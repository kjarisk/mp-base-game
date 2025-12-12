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
    }, 1000 / 60);

  }

  async handleGameInit(socket, data) {
    try {
      const { width, height, username, gameId, create, gameName } = data;

      logger.info(`🎮 Game init request from socket ${socket.id}: username=${username}, gameId=${gameId}, create=${create}`);

      if (!username) {
        socket.emit('error', { message: 'Username is required' });
        return;
      }

      // Create game if requested
      if (create && !this.gameService.getGame(gameId)) {
        this.gameService.createGame(gameId, gameName || 'Unnamed game', username);
        logger.info(`🎮 Game created: ${gameId} by ${username}`);
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

      logger.info(`🎮 Player ${username} (${socket.id}) joining game ${gameId}`);

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

      // Broadcast updated player list to all players in the game
      const game = this.gameService.getGame(gameId);
      if (game) {
        this.io.to(gameId).emit('updatePlayers', game.players);
      }

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

      // Broadcast updated projectile list to all players in the game
      const game = this.gameService.getGame(gameId);
      if (game) {
        this.io.to(gameId).emit('updateProjectiles', game.projectiles);
      }

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
    const guestNames = require('../../shared/guestNames');
    
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

        // Always emit updated players when projectiles are processed (for scoring/respawning)
        this.io.to(gameId).emit('updatePlayers', game.players);

        // Always emit projectiles if there are any active ones
        if (newProjectileCount > 0) {
          this.io.to(gameId).emit('updateProjectiles', game.projectiles);
        } else if (oldProjectileCount > 0 && newProjectileCount === 0) {
          // Send empty object to clear all projectiles on frontend
          this.io.to(gameId).emit('updateProjectiles', {});
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
