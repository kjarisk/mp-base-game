const logger = require('../utils/logger');
const config = require('../config');

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

  checkProjectileBoundaries(projectile, canvasWidth, canvasHeight) {
    return projectile.x < 0 || 
           projectile.x > canvasWidth || 
           projectile.y < 0 || 
           projectile.y > canvasHeight;
  }

  handlePlayerHit(shooter, hitPlayer) {
    if (!shooter || !hitPlayer) return;

    // Award point to shooter
    shooter.score = (shooter.score || 0) + 1;
    logger.info(`${shooter.username} scored! New score: ${shooter.score}`);

    // Respawn hit player at random location
    hitPlayer.x = hitPlayer.canvas.width * Math.random();
    hitPlayer.y = hitPlayer.canvas.height * Math.random();
    logger.info(`Player ${hitPlayer.username} respawned at (${hitPlayer.x}, ${hitPlayer.y})`);
  }
}

module.exports = CollisionDetector;
