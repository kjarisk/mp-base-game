const logger = require('../utils/logger');
const config = require('../config');
const gameConfig = require('../../shared/gameConfig');

class PlayerManager {
  constructor() {
    // Could add player validation, movement patterns, etc.
  }

  createPlayer(socketId, playerData) {
    logger.info(`Creating player: socketId=${socketId}, username=${playerData.username}`);
    
    // Use map dimensions for spawning, not viewport
    const mapWidth = gameConfig.MAP_WIDTH;
    const mapHeight = gameConfig.MAP_HEIGHT;
    const radius = config.game.playerRadius;
    
    // Spawn player at random position within map bounds (with some padding)
    const padding = 100;
    const player = {
      id: socketId,
      x: padding + Math.random() * (mapWidth - padding * 2),
      y: padding + Math.random() * (mapHeight - padding * 2),
      color: `hsl(${360 * Math.random()}, 70%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      username: playerData.username,
      originalUsername: playerData.username,
      canvas: {
        width: playerData.width,
        height: playerData.height
      },
      joinedAt: new Date().toISOString()
    };

    logger.info(`Player created: ${player.username} at (${Math.round(player.x)}, ${Math.round(player.y)})`);
    return player;
  }

  updatePlayerPosition(player, movementData) {
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

    // Boundary checking using map dimensions
    const radius = config.game.playerRadius;
    const mapWidth = gameConfig.MAP_WIDTH;
    const mapHeight = gameConfig.MAP_HEIGHT;
    
    newX = Math.max(radius, Math.min(mapWidth - radius, newX));
    newY = Math.max(radius, Math.min(mapHeight - radius, newY));

    player.x = newX;
    player.y = newY;
    player.sequenceNumber = sequenceNumber;

    return player;
  }

  ensureUniqueUsername(username, existingPlayers) {
    const existingUsernames = Object.values(existingPlayers).map(p => p.username);
    let displayName = username;
    let counter = 2;
    
    logger.info(`Ensuring unique username for: ${username}, existing usernames: [${existingUsernames.join(', ')}]`);
    
    while (existingUsernames.includes(displayName)) {
      displayName = `${username}_${counter}`;
      counter++;
    }
    
    if (displayName !== username) {
      logger.info(`Username changed from ${username} to ${displayName} to ensure uniqueness`);
    }
    
    return displayName;
  }
}

module.exports = PlayerManager;
