const socket = io();
let currentUser = null;
const params = new URLSearchParams(window.location.search);
const gameId = params.get('gameId');
const createGame = params.get('create') === '1';
const gameName = params.get('name');

fetch('/me')
  .then((res) => res.ok ? res.json() : null)
  .then((data) => {
    if (!data) {
      window.location.href = '/';
      return;
    }
    currentUser = data.username;
    socket.emit('initGame', { username: currentUser, gameId, create: createGame, gameName });
  });

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

const tileSize = 32;
const tilesX = 200;
const tilesY = 200;
let cursors;
let car;
let minimap;
let boosters = [];
let leaderBoardDiv;

function generateTextures(scene) {
  const road = scene.add.graphics();
  road.fillStyle(0x555555, 1);
  road.fillRect(0, 0, tileSize, tileSize);
  road.generateTexture('road', tileSize, tileSize);
  road.destroy();

  const grass = scene.add.graphics();
  grass.fillStyle(0x228B22, 1);
  grass.fillRect(0, 0, tileSize, tileSize);
  grass.generateTexture('grass', tileSize, tileSize);
  grass.destroy();

  const boost = scene.add.graphics();
  boost.fillStyle(0xffff00, 1);
  boost.fillRect(0, 0, tileSize, tileSize);
  boost.generateTexture('boost', tileSize, tileSize);
  boost.destroy();
}

function createTrack() {
  const map = [];
  for (let y = 0; y < tilesY; y++) {
    map[y] = new Array(tilesX).fill(1); // 1 = grass
  }
  const margin = 10 + Math.floor(Math.random() * 20);
  const width = 6; // ~200px
  for (let x = margin; x < tilesX - margin; x++) {
    for (let w = 0; w < width; w++) {
      map[margin + w][x] = 0;
      map[tilesY - margin - 1 - w][x] = 0;
    }
  }
  for (let y = margin; y < tilesY - margin; y++) {
    for (let w = 0; w < width; w++) {
      map[y][margin + w] = 0;
      map[y][tilesX - margin - 1 - w] = 0;
    }
  }
  return map;
}

let trackMap;
let layer;

function preload() {
  generateTextures(this);
}

function create() {
  trackMap = createTrack();
  const map = this.make.tilemap({ data: trackMap, tileWidth: tileSize, tileHeight: tileSize });
  const tiles = map.addTilesetImage('road', null, tileSize, tileSize, 0, 0, 0);
  const tiles2 = map.addTilesetImage('grass', null, tileSize, tileSize, 0, 0, 1);
  layer = map.createLayer(0, [tiles2, tiles], 0, 0);
  layer.setCollision(1);

  this.cameras.main.setBounds(0, 0, tilesX * tileSize, tilesY * tileSize);
  this.physics.world.setBounds(0, 0, tilesX * tileSize, tilesY * tileSize);

  car = this.physics.add.sprite(100, 100, 'road').setSize(28, 14).setOffset(2,9);
  car.setCollideWorldBounds(true);
  car.body.maxVelocity.set(400);

  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on('keydown-H', () => {
    socket.emit('horn');
  });

  // boosters
  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(0, tilesX - 1) * tileSize + tileSize / 2;
    const y = Phaser.Math.Between(0, tilesY - 1) * tileSize + tileSize / 2;
    const tile = map.getTileAtWorldXY(x, y);
    if (tile && tile.index === 0) {
      const b = this.physics.add.sprite(x, y, 'boost');
      b.setSize(tileSize, tileSize);
      boosters.push(b);
    }
  }

  boosters.forEach((b) => this.physics.add.overlap(car, b, collectBoost, null, this));

  minimap = this.cameras.add(620, 20, 160, 160).setZoom(0.1).setName('mini');
  minimap.startFollow(car);
  leaderBoardDiv = document.getElementById('playerLabels');
}

function collectBoost(player, boost) {
  boost.destroy();
  socket.emit('collectBooster');
  player.setData('boost', 2000);
}

function speedPenalty() {
  const tile = layer.tilemap.getTileAtWorldXY(car.x, car.y);
  if (!tile || tile.index === 1) {
    // off track
    const dist = nearestRoadDistance(car.x, car.y);
    if (dist > 80) {
      car.body.velocity.scale(0);
    } else if (dist > 20) {
      car.body.velocity.scale(0.5);
    } else {
      car.body.velocity.scale(0.8);
    }
  }
}

function nearestRoadDistance(x, y) {
  const startX = Math.floor(x / tileSize);
  const startY = Math.floor(y / tileSize);
  const maxTiles = 5;
  for (let d = 0; d <= maxTiles; d++) {
    for (let ty = startY - d; ty <= startY + d; ty++) {
      for (let tx = startX - d; tx <= startX + d; tx++) {
        const tile = layer.tilemap.getTileAt(tx, ty);
        if (tile && tile.index === 0) {
          const cx = tx * tileSize + tileSize / 2;
          const cy = ty * tileSize + tileSize / 2;
          return Phaser.Math.Distance.Between(x, y, cx, cy);
        }
      }
    }
  }
  return 999;
}

function update(time, delta) {
  if (!car) return;
  const rotationSpeed = 0.003 * delta;
  const accel = 8;
  if (cursors.left.isDown) car.rotation -= rotationSpeed;
  if (cursors.right.isDown) car.rotation += rotationSpeed;
  if (cursors.up.isDown) {
    this.physics.velocityFromRotation(car.rotation, accel, car.body.acceleration);
  } else if (cursors.down.isDown) {
    this.physics.velocityFromRotation(car.rotation, -accel, car.body.acceleration);
  } else {
    car.setAcceleration(0);
  }

  speedPenalty();

  if (car.getData('boost')) {
    car.setData('boost', car.getData('boost') - delta);
    if (car.getData('boost') <= 0) {
      car.setData('boost', 0);
    } else {
      car.body.velocity.scale(1.2);
    }
  }

  socket.emit('updateState', {
    x: car.x,
    y: car.y,
    angle: car.rotation,
    speed: car.body.speed
  });
}

socket.on('state', ({ players }) => {
  leaderBoardDiv.innerHTML = '';
  Object.keys(players).forEach((id) => {
    if (id === socket.id) return;
  });
  Object.values(players)
    .sort((a, b) => b.score - a.score)
    .forEach((p) => {
      const div = document.createElement('div');
      div.textContent = `${p.username}: ${p.score}`;
      leaderBoardDiv.appendChild(div);
    });
});

socket.on('horn', ({ id }) => {
  if (id === socket.id) return;
  const text = game.scene.scenes[0].add.text(car.x, car.y - 40, 'BEEP', {
    font: '16px Arial',
    fill: '#fff'
  });
  game.scene.scenes[0].tweens.add({
    targets: text,
    y: text.y - 30,
    alpha: 0,
    duration: 500,
    onComplete: () => text.destroy()
  });
});
