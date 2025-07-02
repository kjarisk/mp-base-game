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
    maxPlayersPerGame: 10,
    canvasDefaults: {
      width: 1024,
      height: 768
    }
  },
  database: {
    filePath: 'players.json',
    autoSave: true
  }
};

module.exports = config;
