const logger = require('../utils/logger');
const config = require('../config');
const gameConfig = require('../../shared/gameConfig');

class ProjectileManager {
  constructor(collisionDetector) {
    this.projectileId = 0;
    this.collisionDetector = collisionDetector;
  }

  createProjectile(player, projectileData) {
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
      x: projectileData.x || player.x,
      y: projectileData.y || player.y,
      velocity: velocity,
      playerId: player.id,
      color: player.color,
      createdAt: Date.now()
    };

    logger.debug(`Projectile created: ${projectile.id} at (${projectile.x}, ${projectile.y}) with velocity (${velocity.x}, ${velocity.y}) for player ${player.username}`);
    return projectile;
  }

  updateProjectiles(game) {
    const now = Date.now();
    const projectilesToRemove = [];

    for (const [id, projectile] of Object.entries(game.projectiles)) {
      // Remove old projectiles (5 seconds lifetime)
      if (now - projectile.createdAt > 5000) {
        projectilesToRemove.push(id);
        continue;
      }

      // Update position with 60fps timing
      const deltaTime = 1 / 60;
      projectile.x += projectile.velocity.x * deltaTime;
      projectile.y += projectile.velocity.y * deltaTime;

      // Check collision with players
      for (const [playerId, player] of Object.entries(game.players)) {
        // Don't let players hit themselves
        if (playerId === projectile.playerId) continue;

        if (this.collisionDetector.checkProjectilePlayerCollision(projectile, player)) {
          logger.info(`Player ${player.username} hit by ${game.players[projectile.playerId]?.username || 'unknown'}`);
          
          const shooter = game.players[projectile.playerId];
          this.collisionDetector.handlePlayerHit(shooter, player);

          projectilesToRemove.push(id);
          break;
        }
      }

      // Check boundaries using map dimensions
      const mapWidth = gameConfig.MAP_WIDTH;
      const mapHeight = gameConfig.MAP_HEIGHT;
      
      if (this.collisionDetector.checkProjectileBoundaries(projectile, mapWidth, mapHeight)) {
        projectilesToRemove.push(id);
        logger.debug(`Projectile ${id} removed - out of bounds: (${projectile.x}, ${projectile.y})`);
      }
    }

    // Remove expired/out-of-bounds projectiles
    projectilesToRemove.forEach(id => {
      delete game.projectiles[id];
    });
    
    if (projectilesToRemove.length > 0) {
      logger.debug(`Removed ${projectilesToRemove.length} projectiles from game ${game.id}`);
    }
  }
}

module.exports = ProjectileManager;
