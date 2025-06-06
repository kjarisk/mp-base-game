const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const socket = io();

const scoreEl = document.querySelector('#scoreEl');

const devicePixelRation = window.devicePixelRatio || 1;

canvas.width = 1024 * devicePixelRation;
canvas.height = 576 * devicePixelRation;

c.scale(devicePixelRation, devicePixelRation);

const x = canvas.width / 2;
const y = canvas.height / 2;

// const player = new Player(x, y, 10, 'white');
const frontEndPlayers = {};
const frontEndProjectiles = {};

socket.on('updatePlayers', (backendPlayers) => {
  for (const id in backendPlayers) {
    const backendPlayer = backendPlayers[id];

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backendPlayer.x,
        y: backendPlayer.y,
        radius: 10,
        color: backendPlayer.color,
        username: backendPlayer.username
      });
      document.querySelector(
        '#playerLabels'
      ).innerHTML += `<div data-id="${id}" data-score="${backendPlayer.score}">${backendPlayer.username} : ${backendPlayer.score}</div>`;
    } else {
      // Player exist
      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${backendPlayer.username} : ${backendPlayer.score}`;
      document
        .querySelector(`div[data-id="${id}"]`)
        .setAttribute('data-score', backendPlayer.score);

      const parentDiv = document.querySelector('#playerLabels');
      const childDivs = Array.from(parentDiv.querySelectorAll('div'));

      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute('data-score'));
        const scoreB = Number(b.getAttribute('data-score'));
        return scoreB - scoreA;
      });

      childDivs.forEach((div) => {
        parentDiv.removeChild(div);
      });

      childDivs.forEach((div) => {
        parentDiv.append(div);
      });

      frontEndPlayers[id].target = {
        x: backendPlayer.x,
        y: backendPlayer.y
      };

      if (id === socket.id) {
        // your player
        // frontEndPlayers[id].x = backendPlayer.x;
        // frontEndPlayers[id].y = backendPlayer.y;
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backendPlayer.sequenceNumber === input.sequenceNumber;
        });
        if (lastBackendInputIndex > -1) {
          playerInputs.splice(0, lastBackendInputIndex + 1);

          playerInputs.forEach((input) => {
            frontEndPlayers[id].target.x += input.dx;
            frontEndPlayers[id].target.y += input.dy;
          });
        }
        // } else {
        // all other players
        // frontEndPlayers[id].x = backendPlayer.x;
        // frontEndPlayers[id].y = backendPlayer.y;

        //   gsap.to(frontEndPlayers[id], {
        //     x: backendPlayer.x,
        //     y: backendPlayer.y,
        //     duration: 0.015,
        //     ease: 'linear'
        //   });
      }
    }
  }

  for (const id in frontEndPlayers) {
    if (!backendPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`);
      divToDelete.remove();
      delete frontEndPlayers[id];
      if (id === socket.id) {
        document.querySelector('#usernameForm').style.display = 'block';
      }
    }
  }
});

socket.on('updateProjectiles', (backEndProjectiles) => {
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id];
    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        velocity: backEndProjectile.velocity,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerId]?.color
      });
    } else {
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
    }
  }
  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId];
    }
  }
});

let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)';
  c.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in frontEndPlayers) {
    const player = frontEndPlayers[id];

    if (player.target) {
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5;
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5;
    }
    player.draw();
  }

  for (const id in frontEndProjectiles) {
    const projectile = frontEndProjectiles[id];
    projectile.draw();
  }

  /*for (let i = frontEndProjectiles.length - 1; i >= 0; i--) {
    const frontEndProjectile = frontEndProjectiles[i];
    frontEndProjectile.update();
  }*/
}

animate();

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  s: {
    pressed: false
  }
};

const SPEED = 5;
const playerInputs = [];
let sequenceNumber;
setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED });
    frontEndPlayers[socket.id].y -= SPEED;
    socket.emit('keydown', { keycode: 'KeyW', sequenceNumber });
  }
  if (keys.a.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 });
    frontEndPlayers[socket.id].x -= SPEED;
    socket.emit('keydown', { keycode: 'KeyA', sequenceNumber });
  }
  if (keys.s.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED });
    frontEndPlayers[socket.id].y += SPEED;
    socket.emit('keydown', { keycode: 'KeyS', sequenceNumber });
  }
  if (keys.d.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 });
    frontEndPlayers[socket.id].x += SPEED;
    socket.emit('keydown', { keycode: 'KeyD', sequenceNumber });
  }
}, 15);

window.addEventListener('keydown', (e) => {
  if (!frontEndPlayers[socket.id]) return;
  switch (e.code) {
    case 'KeyW':
      keys.w.pressed = true;
      break;
    case 'KeyA':
      keys.a.pressed = true;
      break;
    case 'KeyS':
      keys.s.pressed = true;
      break;
    case 'KeyD':
      keys.d.pressed = true;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  if (!frontEndPlayers[socket.id]) return;
  switch (e.code) {
    case 'KeyW':
      keys.w.pressed = false;
      break;
    case 'KeyA':
      keys.a.pressed = false;
      break;
    case 'KeyS':
      keys.s.pressed = false;
      break;
    case 'KeyD':
      keys.d.pressed = false;
      break;
  }
});

document.querySelector('#usernameForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.querySelector('#usernameInput').value;
  document.querySelector('#usernameForm').style.display = 'none';
  socket.emit('initGame', {
    username: text,
    width: canvas.width,
    height: canvas.height
  });
});
