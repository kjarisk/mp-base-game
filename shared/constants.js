// Game constants shared between frontend and backend
const GAME_CONSTANTS = {
  PLAYER_SPEED: 5,
  PLAYER_RADIUS: 10,
  PROJECTILE_RADIUS: 5,
  MAX_PLAYERS_PER_GAME: 10,
  PROJECTILE_LIFETIME: 5000, // 5 seconds
  TICK_RATE: 60, // Server update rate
  
  // Canvas defaults
  CANVAS_WIDTH: 1024,
  CANVAS_HEIGHT: 768,
  
  // Collision detection
  COLLISION_PADDING: 2,
  
  // Network
  PING_INTERVAL: 2000,
  PING_TIMEOUT: 5000
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
