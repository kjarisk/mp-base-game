const logger = require('../utils/logger');
const config = require('../config');

class GameService {
  constructor() {
    this.games = {};
    this.projectileId = 0;
    this.projectileTimers = {};
  }

  createGame(gameId, gameName, ownerUsername) {
    if (!gameId || !gameName || !ownerUsername) {
      throw new Error('Game ID, name, and owner are required');
    }

    if (this.games[gameId]) {
      throw new Error('Game already exists');
    }

    const game = {
      id: gameId,
      name: gameName,
      owner: ownerUsername,
      players: {},
      projectiles: {},
      createdAt: new Date().toISOString(),
      maxPlayers: config.game.maxPlayersPerGame
    };

    this.games[gameId] = game;

    // Don't start a per-game projectile update timer here - the SocketHandler manages this globally
    // const interval = setInterval(() => {
    //   this.updateProjectiles(gameId);
    // }, 1000 / config.game.tickRate);
    // this.projectileTimers[gameId] = interval;

    logger.info(`Game created: ${gameName} by ${ownerUsername}`);
    
    return game;
  }

  getGame(gameId) {
    return this.games[gameId];
  }

  addPlayerToGame(gameId, socketId, playerData) {
    const game = this.games[gameId];
    if (!game) {
      throw new Error('Game not found');
    }

    if (Object.keys(game.players).length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    // Remove any existing player with this socket ID (in case of reconnection)
    if (game.players[socketId]) {
      delete game.players[socketId];
    }

    // Create unique display name if username already exists in game
    let displayName = playerData.username;
    const existingUsernames = Object.values(game.players).map(p => p.username);
    let counter = 2;
    while (existingUsernames.includes(displayName)) {
      displayName = `${playerData.username}_${counter}`;
      counter++;
    }

    const player = {
      id: socketId,
      x: playerData.width * Math.random(),
      y: playerData.height * Math.random(),
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      username: displayName,
      originalUsername: playerData.username, // Keep track of original username
      canvas: {
        width: playerData.width,
        height: playerData.height
      },
      joinedAt: new Date().toISOString()
    };

    game.players[socketId] = player;
    logger.info(`Player ${displayName} (${playerData.username}) joined game ${game.name}`);
    
    return player;
  }

  removePlayerFromGame(gameId, socketId) {
    const game = this.games[gameId];
    if (!game || !game.players[socketId]) {
      return false;
    }

    const player = game.players[socketId];
    delete game.players[socketId];
    
    logger.info(`Player ${player.username} left game ${game.name}`);

    // Remove empty games (except if owner is still there)
    if (Object.keys(game.players).length === 0) {
      // No need to clear interval since we're not using per-game timers
      // clearInterval(this.projectileTimers[gameId]);
      // delete this.projectileTimers[gameId];
      delete this.games[gameId];
      logger.info(`Game ${game.name} removed (empty)`);
    }

    return true;
  }

  updatePlayerPosition(gameId, socketId, movementData) {
    const game = this.games[gameId];
    if (!game || !game.players[socketId]) {
      throw new Error('Player not found in game');
    }

    const player = game.players[socketId];
    const { keycode, sequenceNumber } = movementData;

    // Validate sequence number to prevent replay attacks
    if (sequenceNumber <= player.sequenceNumber) {
      return player; // Ignore old updates
    }

    // Calculate new position based on keycode
    let newX = player.x;
    let newY = player.y;

    switch (keycode) {
      case 'KeyW':
        newY -= config.game.playerSpeed;
        break;
      case 'KeyS':
        newY += config.game.playerSpeed;
        break;
      case 'KeyA':
        newX -= config.game.playerSpeed;
        break;
      case 'KeyD':
        newX += config.game.playerSpeed;
        break;
    }

    // Boundary checking
    const radius = config.game.playerRadius;
    newX = Math.max(radius, Math.min(player.canvas.width - radius, newX));
    newY = Math.max(radius, Math.min(player.canvas.height - radius, newY));

    player.x = newX;
    player.y = newY;
    player.sequenceNumber = sequenceNumber;

    return player;
  }

  createProjectile(gameId, socketId, projectileData) {
    const game = this.games[gameId];
    if (!game || !game.players[socketId]) {
      throw new Error('Player not found in game');
    }

    const player = game.players[socketId];
    
    logger.debug(`Creating projectile for player ${player.username} at server pos (${player.x}, ${player.y})`);
    
    // Calculate velocity from angle if angle is provided
    let velocity;
    if (projectileData.angle !== undefined) {
      const speed = config.game.projectileSpeed;
      velocity = {
        x: Math.cos(projectileData.angle) * speed,
        y: Math.sin(projectileData.angle) * speed
      };
    } else if (projectileData.velocity) {
      // Scale provided velocity to match our speed
      const currentSpeed = Math.sqrt(projectileData.velocity.x * projectileData.velocity.x + projectileData.velocity.y * projectileData.velocity.y);
      const targetSpeed = config.game.projectileSpeed;
      const scale = targetSpeed / currentSpeed;
      velocity = {
        x: projectileData.velocity.x * scale,
        y: projectileData.velocity.y * scale
      };
    } else {
      throw new Error('Either angle or velocity must be provided');
    }

    const projectile = {
      id: ++this.projectileId,
      x: projectileData.x || player.x,  // Use frontend position if provided
      y: projectileData.y || player.y,  // Use frontend position if provided
      velocity: velocity,
      playerId: socketId,
      color: player.color,
      createdAt: Date.now()
    };

    game.projectiles[projectile.id] = projectile;
    logger.debug(`Projectile created: ${projectile.id} at (${projectile.x}, ${projectile.y}) with velocity (${velocity.x}, ${velocity.y}) for player ${player.username}`);
    return projectile;
  }

  updateProjectiles(gameId) {
    const game = this.games[gameId];
    if (!game) return;

    const now = Date.now();
    const projectilesToRemove = [];

    for (const [id, projectile] of Object.entries(game.projectiles)) {
      // Remove old projectiles (5 seconds lifetime)
      if (now - projectile.createdAt > 5000) {
        projectilesToRemove.push(id);
        continue;
      }

      // Update position with 60fps timing
      const deltaTime = 1 / 60; // 60fps
      projectile.x += projectile.velocity.x * deltaTime;
      projectile.y += projectile.velocity.y * deltaTime;

      // Check collision with players
      for (const [playerId, player] of Object.entries(game.players)) {
        // Don't let players hit themselves
        if (playerId === projectile.playerId) continue;

        const distance = Math.sqrt(
          Math.pow(projectile.x - player.x, 2) + 
          Math.pow(projectile.y - player.y, 2)
        );

        const collisionDistance = config.game.projectileRadius + config.game.playerRadius;
        
        if (distance < collisionDistance) {
          // Collision detected!
          logger.info(`Player ${player.username} hit by ${game.players[projectile.playerId]?.username || 'unknown'}`);
          
          // Award point to shooter
          const shooter = game.players[projectile.playerId];
          if (shooter) {
            shooter.score = (shooter.score || 0) + 1;
            logger.info(`${shooter.username} scored! New score: ${shooter.score}`);
          }

          // Respawn hit player at random location instead of removing them
          player.x = player.canvas.width * Math.random();
          player.y = player.canvas.height * Math.random();
          logger.info(`Player ${player.username} respawned at (${player.x}, ${player.y})`);

          // Remove the projectile
          projectilesToRemove.push(id);
          break; // Exit player loop since projectile hit someone
        }
      }

      // Check boundaries - use actual canvas dimensions from any player in the game
      const anyPlayer = Object.values(game.players)[0];
      const maxX = anyPlayer?.canvas?.width || 1024;
      const maxY = anyPlayer?.canvas?.height || 576;
      
      if (projectile.x < 0 || projectile.x > maxX || 
          projectile.y < 0 || projectile.y > maxY) {
        projectilesToRemove.push(id);
        logger.debug(`Projectile ${id} removed - out of bounds: (${projectile.x}, ${projectile.y})`);
      }
    }

    // Remove expired/out-of-bounds projectiles
    projectilesToRemove.forEach(id => {
      delete game.projectiles[id];
    });
    
    if (projectilesToRemove.length > 0) {
      logger.debug(`Removed ${projectilesToRemove.length} projectiles from game ${gameId}`);
    }
  }

  getGamesList() {
    return Object.keys(this.games).map((id) => ({
      id,
      name: `${this.games[id].name} (by ${this.games[id].owner})`,
      players: Object.keys(this.games[id].players).length,
      maxPlayers: this.games[id].maxPlayers,
      createdAt: this.games[id].createdAt
    }));
  }

  getGameStats() {
    const totalGames = Object.keys(this.games).length;
    const totalPlayers = Object.values(this.games)
      .reduce((sum, game) => sum + Object.keys(game.players).length, 0);
    
    return { totalGames, totalPlayers };
  }
}

module.exports = GameService;
