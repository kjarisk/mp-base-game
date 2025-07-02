// Game constants shared between frontend and backend
const gameConfig = require('./gameConfig');

const GAME_CONSTANTS = {
  PLAYER_SPEED: gameConfig.PLAYER_SPEED,
  PLAYER_RADIUS: 10, // Visual constant, not in config
  PROJECTILE_RADIUS: 5, // Visual constant, not in config
  MAX_PLAYERS_PER_GAME: gameConfig.MAX_PLAYERS_PER_GAME,
  PROJECTILE_LIFETIME: 5000, // 5 seconds
  TICK_RATE: gameConfig.GAME_TICK_RATE,
  
  // Canvas defaults
  CANVAS_WIDTH: gameConfig.MAP_WIDTH,
  CANVAS_HEIGHT: gameConfig.MAP_HEIGHT,
  
  // Collision detection
  COLLISION_PADDING: 2,
  
  // Network
  PING_INTERVAL: gameConfig.SOCKET_PING_INTERVAL,
  PING_TIMEOUT: gameConfig.SOCKET_PING_TIMEOUT
};

const GAME_STATES = {
  MENU: 'MENU',
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER'
};

const PLAYER_STATES = {
  IDLE: 'IDLE',
  MOVING: 'MOVING',
  SHOOTING: 'SHOOTING',
  DEAD: 'DEAD'
};

module.exports = {
  GAME_CONSTANTS,
  GAME_STATES,
  PLAYER_STATES
};
