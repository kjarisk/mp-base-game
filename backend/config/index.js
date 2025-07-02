require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    sessionSecret: process.env.SESSION_SECRET || 'keyboard cat'
  },
  socket: {
    pingInterval: 2000,
    pingTimeout: 5000
  },
  game: {
    playerSpeed: 5,
    playerRadius: 10,
    projectileRadius: 5,
    maxPlayersPerGame: parseInt(process.env.MAX_PLAYERS_PER_GAME) || 10,
    projectileSpeed: parseInt(process.env.PROJECTILE_SPEED) || 5,
    canvasDefaults: {
      width: 1024,
      height: 768
    }
  },
  database: {
    url: process.env.DATABASE_URL,
    filePath: 'players.json', // Fallback for in-memory mode
    autoSave: true
  }
};

module.exports = config;
