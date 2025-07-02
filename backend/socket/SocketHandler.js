const logger = require('../utils/logger');
const GameService = require('../services/GameService');
const db = require('../database');
const { releaseGuestName } = require('../routes/game');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.gameService = new GameService();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);
      this.broadcastGames();

      // Game initialization
      socket.on('initCanvas', () => {
        logger.debug(`Canvas init request from ${socket.id}`);
      });

      socket.on('initGame', (data) => {
        this.handleGameInit(socket, data);
      });

      // Player movement
      socket.on('keydown', (movementData) => {
        this.handlePlayerMovement(socket, movementData);
      });

      // Projectiles
      socket.on('shoot', (projectileData) => {
        this.handleProjectileCreation(socket, projectileData);
      });

      // Disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });
    });

    // Update projectiles for all games every 16ms (~60fps)
    setInterval(() => {
      this.updateAllProjectiles();
    }, 16);
  }

  async handleGameInit(socket, data) {
    try {
      const { width, height, username, gameId, create, gameName } = data;

      if (!username) {
        socket.emit('error', { message: 'Username is required' });
        return;
      }

      // Create game if requested
      if (create && !this.gameService.getGame(gameId)) {
        this.gameService.createGame(gameId, gameName || 'Unnamed game', username);
      }

      // Check if game exists
      const game = this.gameService.getGame(gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Create/update player in database
      await db.createPlayer(username);

      // Join socket room
      socket.join(gameId);
      socket.data.gameId = gameId;
      socket.data.username = username;

      // Add player to game
      const player = this.gameService.addPlayerToGame(gameId, socket.id, {
        username,
        width,
        height
      });

      // Notify client of successful join
      socket.emit('gameJoined', {
        gameId,
        player,
        game: {
          name: game.name,
          players: Object.keys(game.players).length,
          maxPlayers: game.maxPlayers
        }
      });

      // Broadcast updated player list to all players in the game
      this.io.to(gameId).emit('updatePlayers', game.players);
      this.broadcastGames();

      logger.info(`Player ${username} successfully joined game ${game.name}`);

    } catch (error) {
      logger.error('Error in game initialization', { 
        error: error.message, 
        socketId: socket.id 
      });
      socket.emit('error', { message: error.message });
    }
  }

  handlePlayerMovement(socket, movementData) {
    try {
      const gameId = socket.data.gameId;
      if (!gameId) return;

      const updatedPlayer = this.gameService.updatePlayerPosition(
        gameId, 
        socket.id, 
        movementData
      );

      // Broadcast position update to other players in the game
      socket.to(gameId).emit('updatePlayers', {
        [socket.id]: updatedPlayer
      });

    } catch (error) {
      logger.error('Error in player movement', { 
        error: error.message, 
        socketId: socket.id 
      });
    }
  }

  handleProjectileCreation(socket, projectileData) {
    try {
      const gameId = socket.data.gameId;
      if (!gameId) return;

      logger.debug(`Shoot request from ${socket.data.username}: frontend pos (${projectileData.x}, ${projectileData.y}), angle: ${projectileData.angle}`);

      const projectile = this.gameService.createProjectile(
        gameId, 
        socket.id, 
        projectileData
      );

      // Broadcast new projectile to all players in the game
      this.io.to(gameId).emit('updateProjectiles', {
        [projectile.id]: projectile
      });

    } catch (error) {
      logger.error('Error creating projectile', { 
        error: error.message, 
        socketId: socket.id 
      });
    }
  }

  handleDisconnection(socket, reason) {
    try {
      const gameId = socket.data.gameId;
      const username = socket.data.username;

      if (gameId) {
        // Get player info before removing
        const game = this.gameService.getGame(gameId);
        const player = game?.players[socket.id];
        
        this.gameService.removePlayerFromGame(gameId, socket.id);
        
        // Notify remaining players
        const updatedGame = this.gameService.getGame(gameId);
        if (updatedGame) {
          this.io.to(gameId).emit('updatePlayers', updatedGame.players);
        }
        
        this.broadcastGames();
      }

      // Clean up guest name if it was a guest user (check for sci-fi names pattern)
      if (username && this.isGuestName(username)) {
        releaseGuestName(username);
      }

      logger.info(`Client disconnected: ${socket.id} (${username || 'unknown'}) - ${reason}`);

    } catch (error) {
      logger.error('Error handling disconnection', { 
        error: error.message, 
        socketId: socket.id 
      });
    }
  }

  // Helper method to check if a username is a guest name
  isGuestName(username) {
    const guestNames = [
      'Nebula', 'Orion', 'Vega', 'Sirius', 'Altair', 'Rigel', 'Polaris', 'Castor', 'Pollux', 'Andromeda',
      'Galaxy', 'Cosmos', 'Stellar', 'Nova', 'Comet', 'Meteor', 'Asteroid', 'Quasar', 'Pulsar', 'Neutron',
      'Phoenix', 'Dragon', 'Falcon', 'Eagle', 'Hawk', 'Raven', 'Wolf', 'Tiger', 'Lion', 'Panther',
      'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa',
      'Cipher', 'Matrix', 'Vector', 'Pixel', 'Binary', 'Quantum', 'Photon', 'Electron', 'Proton',
      'Titan', 'Atlas', 'Hermes', 'Apollo', 'Artemis', 'Athena', 'Zeus', 'Poseidon', 'Hades', 'Ares',
      'Crimson', 'Azure', 'Violet', 'Emerald', 'Golden', 'Silver', 'Platinum', 'Diamond', 'Ruby', 'Sapphire',
      'Storm', 'Thunder', 'Lightning', 'Blizzard', 'Tornado', 'Hurricane', 'Cyclone', 'Typhoon', 'Monsoon', 'Gale',
      'Shadow', 'Ghost', 'Phantom', 'Specter', 'Wraith', 'Spirit', 'Soul', 'Echo', 'Mirage', 'Illusion',
      'Blade', 'Sword', 'Spear', 'Arrow', 'Shield', 'Armor', 'Helmet', 'Gauntlet', 'Boot', 'Cloak',
      'Fire', 'Ice', 'Earth', 'Air', 'Water', 'Metal', 'Wood', 'Light', 'Dark', 'Void',
      'Hunter', 'Ranger', 'Scout', 'Warrior', 'Knight', 'Paladin', 'Rogue', 'Assassin', 'Mage', 'Wizard',
      'Ace', 'Chief', 'Major', 'Captain', 'Admiral', 'General', 'Marshal', 'Commander', 'Leader', 'Boss',
      'Cyber', 'Tech', 'Data', 'Code', 'Hack', 'Link', 'Node', 'Grid', 'Net', 'Web',
      'Star', 'Moon', 'Sun', 'Earth', 'Mars', 'Venus', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
      'Apex', 'Prime', 'Ultra', 'Super', 'Mega', 'Giga', 'Tera', 'Peta', 'Exa', 'Zetta',
      'Frost', 'Flame', 'Spark', 'Bolt', 'Charge', 'Surge', 'Pulse', 'Wave', 'Beam', 'Ray',
      'Viper', 'Cobra', 'Python', 'Boa', 'Mamba', 'Adder', 'Asp', 'Krait', 'Taipan', 'Coral',
      'Laser', 'Plasma', 'Fusion', 'Fission', 'Atomic', 'Nuclear', 'Particle', 'Molecule', 'Atom', 'Ion',
      'Turbo', 'Nitro', 'Boost', 'Rush', 'Speed', 'Swift', 'Flash', 'Dash', 'Zoom', 'Blur'
    ];
    
    // Check if username matches a guest name pattern (name or name with number)
    const baseUsername = username.replace(/\d+$/, '');
    return guestNames.includes(baseUsername);
  }

  updateAllProjectiles() {
    try {
      const games = this.gameService.games;
      
      for (const [gameId, game] of Object.entries(games)) {
        const oldProjectileCount = Object.keys(game.projectiles).length;
        this.gameService.updateProjectiles(gameId);
        const newProjectileCount = Object.keys(game.projectiles).length;

        // Only emit if projectiles changed
        if (oldProjectileCount !== newProjectileCount || newProjectileCount > 0) {
          this.io.to(gameId).emit('updateProjectiles', game.projectiles);
        }
      }
    } catch (error) {
      logger.error('Error updating projectiles', { error: error.message });
    }
  }

  broadcastGames() {
    try {
      const gamesList = this.gameService.getGamesList();
      this.io.emit('gamesList', gamesList);
    } catch (error) {
      logger.error('Error broadcasting games list', { error: error.message });
    }
  }

  getStats() {
    return {
      connectedClients: this.io.engine.clientsCount,
      ...this.gameService.getGameStats()
    };
  }
}

module.exports = SocketHandler;
