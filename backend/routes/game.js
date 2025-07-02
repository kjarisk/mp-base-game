const express = require('express');
const gameConfig = require('../../shared/gameConfig');
const router = express.Router();

// Get game configuration for frontend
router.get('/config', (req, res) => {
  // Only send safe configuration to frontend (no sensitive data)
  const safeConfig = {
    maxPlayersPerGame: gameConfig.MAX_PLAYERS_PER_GAME,
    projectileSpeed: gameConfig.PROJECTILE_SPEED,
    playerSpeed: gameConfig.PLAYER_SPEED,
    mapWidth: gameConfig.MAP_WIDTH,
    mapHeight: gameConfig.MAP_HEIGHT,
    gameTickRate: gameConfig.GAME_TICK_RATE,
    pointsPerEnemy: gameConfig.POINTS_PER_ENEMY,
    pointsPerLevel: gameConfig.POINTS_PER_LEVEL,
    respawnTime: gameConfig.RESPAWN_TIME
  };
  
  res.json(safeConfig);
});

module.exports = router;
