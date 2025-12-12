// Game Configuration
// This file contains game rules and settings that are consistent across environments

module.exports = {
  // Player limits
  MAX_PLAYERS_PER_GAME: 10,
  MAX_PLAYERS_TOTAL: 100,
  
  // Game mechanics
  PROJECTILE_SPEED: 300, // pixels per second
  PLAYER_SPEED: 3,
  ENEMY_SPAWN_RATE: 1000, // milliseconds
  
  // Game balance
  PLAYER_HEALTH: 100,
  ENEMY_HEALTH: 50,
  PROJECTILE_DAMAGE: 25,
  
  // Map settings
  MAP_WIDTH: 800,
  MAP_HEIGHT: 600,
  
  // Scoring
  POINTS_PER_ENEMY: 10,
  POINTS_PER_LEVEL: 100,
  
  // Timing
  GAME_TICK_RATE: 60, // FPS
  RESPAWN_TIME: 3000, // milliseconds
  
  // Socket.IO settings
  SOCKET_PING_TIMEOUT: 60000, // 60 seconds - increased from 5 seconds
  SOCKET_PING_INTERVAL: 25000, // 25 seconds - increased from 2 seconds
};
