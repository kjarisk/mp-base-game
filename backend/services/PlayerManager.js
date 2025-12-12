const logger = require('../utils/logger');
const config = require('../config');

class PlayerManager {
  constructor() {
    // Could add player validation, movement patterns, etc.
  }

  createPlayer(socketId, playerData) {
    logger.info(`🎮 Creating player: socketId=${socketId}, username=${playerData.username}`);
    
    // Create unique display name if username already exists would be handled by GameService
    const player = {
      id: socketId,
      x: playerData.width * Math.random(),
      y: playerData.height * Math.random(),
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      username: playerData.username, // GameService will handle uniqueness
      originalUsername: playerData.username,
      canvas: {
        width: playerData.width,
        height: playerData.height
      },
      joinedAt: new Date().toISOString()
    };

    logger.info(`🎮 Player created: ${player.username} at (${Math.round(player.x)}, ${Math.round(player.y)})`);
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

    // Boundary checking
    const radius = config.game.playerRadius;
    newX = Math.max(radius, Math.min(player.canvas.width - radius, newX));
    newY = Math.max(radius, Math.min(player.canvas.height - radius, newY));

    player.x = newX;
    player.y = newY;
    player.sequenceNumber = sequenceNumber;

    return player;
  }

  ensureUniqueUsername(username, existingPlayers) {
    const existingUsernames = Object.values(existingPlayers).map(p => p.username);
    let displayName = username;
    let counter = 2;
    
    logger.info(`🎮 Ensuring unique username for: ${username}, existing usernames: [${existingUsernames.join(', ')}]`);
    
    while (existingUsernames.includes(displayName)) {
      displayName = `${username}_${counter}`;
      counter++;
    }
    
    if (displayName !== username) {
      logger.info(`🎮 Username changed from ${username} to ${displayName} to ensure uniqueness`);
    }
    
    return displayName;
  }
}

module.exports = PlayerManager;
