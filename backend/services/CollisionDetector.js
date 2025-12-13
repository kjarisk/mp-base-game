const logger = require('../utils/logger');
const config = require('../config');
const gameConfig = require('../../shared/gameConfig');

class CollisionDetector {
  constructor() {
    // Could add different collision shapes/algorithms here
  }

  checkProjectilePlayerCollision(projectile, player) {
    const distance = Math.sqrt(
      Math.pow(projectile.x - player.x, 2) + 
      Math.pow(projectile.y - player.y, 2)
    );

    const collisionDistance = config.game.projectileRadius + config.game.playerRadius;
    return distance < collisionDistance;
  }

  checkProjectileBoundaries(projectile, mapWidth, mapHeight) {
    return projectile.x < 0 || 
           projectile.x > mapWidth || 
           projectile.y < 0 || 
           projectile.y > mapHeight;
  }

  handlePlayerHit(shooter, hitPlayer) {
    if (!shooter || !hitPlayer) return;

    // Award point to shooter
    shooter.score = (shooter.score || 0) + 1;
    logger.info(`${shooter.username} scored! New score: ${shooter.score}`);

    // Respawn hit player at random location using map dimensions
    const padding = 100;
    const mapWidth = gameConfig.MAP_WIDTH;
    const mapHeight = gameConfig.MAP_HEIGHT;
    
    hitPlayer.x = padding + Math.random() * (mapWidth - padding * 2);
    hitPlayer.y = padding + Math.random() * (mapHeight - padding * 2);
    logger.info(`Player ${hitPlayer.username} respawned at (${hitPlayer.x}, ${hitPlayer.y})`);
  }
}

module.exports = CollisionDetector;
