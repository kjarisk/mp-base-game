const db = require('./db');

module.exports = function registerSocketHandlers(io) {
  const games = {};

  function broadcastGames() {
    const list = Object.keys(games).map((id) => ({
      id,
      name: `${games[id].name} (by ${games[id].owner})`,
      players: Object.keys(games[id].players).length
    }));
    io.emit('gamesList', list);
  }

  io.on('connection', (socket) => {
    broadcastGames();

    socket.on('initGame', ({ username, gameId, create, gameName }) => {
      if (!username) return;
      if (create && !games[gameId]) {
        games[gameId] = {
          name: gameName || 'Unnamed game',
          owner: username,
          players: {}
        };
      }

      if (!games[gameId]) return;

      db.createPlayer(username);

      socket.join(gameId);
      socket.data.gameId = gameId;
      socket.data.username = username;

      games[gameId].players[socket.id] = {
        x: Math.random() * 6400,
        y: Math.random() * 6400,
        angle: 0,
        speed: 0,
        username,
        score: 0
      };

      broadcastGames();
    });

    socket.on('updateState', (state) => {
      const gameId = socket.data.gameId;
      const player = games[gameId]?.players[socket.id];
      if (!player) return;
      player.x = state.x;
      player.y = state.y;
      player.angle = state.angle;
      player.speed = state.speed;
    });

    socket.on('collectBooster', () => {
      const gameId = socket.data.gameId;
      const player = games[gameId]?.players[socket.id];
      if (player) {
        player.score += 1;
        db.updateScore(player.username, player.score);
        io.to(gameId).emit('leaderboard', games[gameId].players);
      }
    });

    socket.on('horn', () => {
      const gameId = socket.data.gameId;
      io.to(gameId).emit('horn', { id: socket.id });
    });

    socket.on('questComplete', (questState) => {
      if (socket.data.username) {
        db.updateQuestState(socket.data.username, questState);
      }
    });

    socket.on('disconnect', () => {
      const gameId = socket.data.gameId;
      if (gameId && games[gameId]) {
        delete games[gameId].players[socket.id];
        if (Object.keys(games[gameId].players).length === 0) {
          delete games[gameId];
        }
        broadcastGames();
      }
    });
  });

  setInterval(() => {
    for (const gameId in games) {
      io.to(gameId).emit('state', { players: games[gameId].players });
    }
  }, 50);
};
