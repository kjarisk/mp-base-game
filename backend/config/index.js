require('dotenv').config();
const gameConfig = require('../../shared/gameConfig');
const { GAME_CONSTANTS } = require('../../shared/constants');

const config = {
  server: {
    port: parseInt(process.env.PORT) || 3005,
    sessionSecret: process.env.SESSION_SECRET || 'keyboard cat'
  },
  socket: {
    pingInterval: gameConfig.SOCKET_PING_INTERVAL,
    pingTimeout: gameConfig.SOCKET_PING_TIMEOUT
  },
  game: {
    playerSpeed: gameConfig.PLAYER_SPEED,
    playerRadius: 10,
    projectileRadius: 5,
    maxPlayersPerGame: gameConfig.MAX_PLAYERS_PER_GAME,
    projectileSpeed: gameConfig.PROJECTILE_SPEED,
    tickRate: GAME_CONSTANTS.TICK_RATE,
    canvasDefaults: {
      width: gameConfig.MAP_WIDTH,
      height: gameConfig.MAP_HEIGHT
    }
  },
  database: {
    url: process.env.DATABASE_URL,
    filePath: 'players.json', // Fallback for in-memory mode
    autoSave: true
  }
};

module.exports = config;
