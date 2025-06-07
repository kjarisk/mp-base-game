const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');

// socket io
const { Server } = require('socket.io');

// simple JSON persistence for players
const db = require('./db');

const app = express();
const server = createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// structure to hold game rooms
const games = {};

const SPEED = 5;
let projectileId = 0;
const RADIUS = 10;
const PROJECTILE_RADIUS = 5;

// load persisted players into memory
const players = db.loadPlayers();

function broadcastGames() {
  const list = Object.keys(games).map((id) => ({
    id,
    name: games[id].name,
    players: Object.keys(games[id].players).length
  }));
  io.emit('gamesList', list);
}

io.on('connection', (socket) => {
  // send current games when a client connects
  broadcastGames();

  socket.on('initCanvas', () => {});

  socket.on('initGame', ({ width, height, username, gameId, create, gameName }) => {
    if (create && !games[gameId]) {
      games[gameId] = { name: gameName || 'Unnamed game', players: {}, projectiles: {} };
    }

    if (!games[gameId]) return;

    // ensure player is registered in persistence layer
    db.createPlayer(username);

    socket.join(gameId);
    socket.data.gameId = gameId;
    socket.data.username = username;

    games[gameId].players[socket.id] = {
      x: width * Math.random(),
      y: height * Math.random(),
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      username,
      canvas: {
        width,
        height
      },
      radius: RADIUS
    };

    broadcastGames();
  });

  socket.on('disconnect', (reason) => {
    const gameId = socket.data.gameId;
    if (gameId && games[gameId]) {
      delete games[gameId].players[socket.id];
      if (Object.keys(games[gameId].players).length === 0) {
        delete games[gameId];
      }
      broadcastGames();
    }
  });

  socket.on('shoot', ({ x, y, angle }) => {
    const gameId = socket.data.gameId;
    if (!games[gameId]) return;

    projectileId++;

    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    };

    games[gameId].projectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    };
  });

  // update quest state when players complete quests
  socket.on('questComplete', (questState) => {
    if (socket.data.username) {
      db.updateQuestState(socket.data.username, questState);
    }
  });

  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    const gameId = socket.data.gameId;
    const backendPlayer = games[gameId]?.players[socket.id];
    if (!backendPlayer) return;

    switch (keycode) {
      case 'KeyW':
        backendPlayer.y -= SPEED;
        break;
      case 'KeyA':
        backendPlayer.x -= SPEED;
        break;
      case 'KeyS':
        backendPlayer.y += SPEED;
        break;
      case 'KeyD':
        backendPlayer.x += SPEED;
        break;
    }

    const playerSides = {
      left: backendPlayer.x - backendPlayer.radius,
      right: backendPlayer.x + backendPlayer.radius,
      top: backendPlayer.y - backendPlayer.radius,
      bottom: backendPlayer.y + backendPlayer.radius
    };
    if (playerSides.left < 0) {
      backendPlayer.x = backendPlayer.radius;
    }
    if (playerSides.right > 1024) {
      backendPlayer.x = 1024 - backendPlayer.radius;
    }
    if (playerSides.top < 0) {
      backendPlayer.y = backendPlayer.radius;
    }
    if (playerSides.bottom > 576) {
      backendPlayer.y = 576 - backendPlayer.radius;
    }
  });
});

// backend ticker
setInterval(() => {
  for (const gameId in games) {
    const game = games[gameId];

    for (const id in game.projectiles) {
      game.projectiles[id].x += game.projectiles[id].velocity.x;
      game.projectiles[id].y += game.projectiles[id].velocity.y;

      const playerCanvas =
        game.players[game.projectiles[id].playerId]?.canvas || {};

      if (
        game.projectiles[id].x - 5 >= playerCanvas.width ||
        game.projectiles[id].x + 5 <= 0 ||
        game.projectiles[id].y - 5 >= playerCanvas.height ||
        game.projectiles[id].y + 5 <= 0
      ) {
        delete game.projectiles[id];
        continue;
      }

      for (const playerId in game.players) {
        const backendPlayer = game.players[playerId];
        const DISTANCE = Math.hypot(
          game.projectiles[id].x - backendPlayer.x,
          game.projectiles[id].y - backendPlayer.y
        );

        if (
          DISTANCE < PROJECTILE_RADIUS + backendPlayer.radius &&
          game.projectiles[id].playerId !== playerId
        ) {
          if (game.players[game.projectiles[id].playerId]) {
            const shooter = game.players[game.projectiles[id].playerId];
            shooter.score++;
            // persist high score if new record
            db.updateScore(shooter.username, shooter.score);
          }

          delete game.projectiles[id];
          delete game.players[playerId];
          break;
        }
      }
    }

    io.to(gameId).emit('updateProjectiles', game.projectiles);
    io.to(gameId).emit('updatePlayers', game.players);
  }
}, 15);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

console.log('server load');
