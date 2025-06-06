const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');

// socket io
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

const backEndPlayers = {};
const backEndProjectiles = {};

const SPEED = 5;
let projectileId = 0;
const RADIUS = 10;
const PROJECTILE_RADIUS = 5;

io.on('connection', (socket) => {
  io.emit('updatePlayers', backEndPlayers);

  socket.on('initCanvas', () => {});

  socket.on('initGame', ({ width, height, username }) => {
    backEndPlayers[socket.id] = {
      x: width * Math.random(),
      y: height * Math.random(),
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      username
    };

    backEndPlayers[socket.id].canvas = {
      width,
      height
    };
    backEndPlayers[socket.id].radius = RADIUS;

    // if (devicePixelRation > 1) {  // using scale
    //   backEndPlayers[socket.id].radius = 2 * RADIUS;
    // }
  });

  socket.on('disconnect', (reason) => {
    console.log(reason);
    delete backEndPlayers[socket.id];
    io.emit('updatePlayers', backEndPlayers);
  });

  socket.on('shoot', ({ x, y, angle }) => {
    projectileId++;

    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    };

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    };
  });

  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    const backendPlayer = backEndPlayers[socket.id];
    if (!backEndPlayers[socket.id]) return;

    switch (keycode) {
      case 'KeyW':
        backEndPlayers[socket.id].y -= SPEED;
        break;
      case 'KeyA':
        backEndPlayers[socket.id].x -= SPEED;

        break;
      case 'KeyS':
        backEndPlayers[socket.id].y += SPEED;

        break;
      case 'KeyD':
        backEndPlayers[socket.id].x += SPEED;

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
  // update projectile
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y;

    if (
      backEndProjectiles[id].x - 5 >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
      backEndProjectiles[id].x + 5 <= 0 ||
      backEndProjectiles[id].y - 5 >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
      backEndProjectiles[id].y + 5 <= 0
    ) {
      delete backEndProjectiles[id];
      continue;
    }
    for (const playerId in backEndPlayers) {
      const backendPlayer = backEndPlayers[playerId];
      const DISTANCE = Math.hypot(
        backEndProjectiles[id].x - backendPlayer.x,
        backEndProjectiles[id].y - backendPlayer.y
      );
      // collision detection
      if (
        DISTANCE < PROJECTILE_RADIUS + backendPlayer.radius &&
        backEndProjectiles[id].playerId !== playerId
      ) {
        if (backEndPlayers[backEndProjectiles[id].playerId]) {
          backEndPlayers[backEndProjectiles[id].playerId].score++;
        }

        delete backEndProjectiles[id];
        delete backEndPlayers[playerId];
        break;
      }
    }
  }

  io.emit('updateProjectiles', backEndProjectiles);
  io.emit('updatePlayers', backEndPlayers);
}, 15);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

console.log('server load');
