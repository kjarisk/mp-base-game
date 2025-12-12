// Mouse tracking for player rotation
window.addEventListener('mousemove', (event) => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  
  const { top, left } = canvas.getBoundingClientRect();
  window.mouseX = event.clientX - left;
  window.mouseY = event.clientY - top;
});

window.addEventListener('click', (event) => {
  // Check if game controller exists and is initialized
  if (!window.gameController || !window.gameController.gameState) {
    console.log('Game not initialized yet');
    return;
  }
  
  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  
  const gameState = window.gameController.gameState;
  const currentPlayer = gameState.getCurrentPlayer();
  
  if (!currentPlayer) {
    console.log('Player not found for shooting');
    return;
  }
  
  const { top, left } = canvas.getBoundingClientRect();
  
  // Get nose position for accurate shooting
  const nosePos = currentPlayer.getNosePosition();
  
  const angle = Math.atan2(
    event.clientY - top - nosePos.y,
    event.clientX - left - nosePos.x
  );

  window.gameController.socketManager.emit('shoot', {
    x: nosePos.x,
    y: nosePos.y,
    angle
  });

  // frontEndProjectiles.push(
  //   new Projectile({
  //     x: playerPosition.x,
  //     y: playerPosition.y,
  //     radius: 5,
  //     color: 'white',
  //     velocity
  //   })
  // );
});

// Write in etc/ngnix/sites-available  with nano, check with cat out

// server {
//   listen 80;
//   server_name multiplayer.wonderspants.com;

//   location / {
//     proxy_pass http://localhost:3000;
//     proxy_http_version 1.1;
//     proxy_set_header Upgrade $http_upgrade;
//     proxy_set_header Connection 'upgrade';
//     proxy_set_header Host $host;
//     proxy_cache_bypass $http_upgrade;
//   }
// }

// sudo ln -s /etc/nginx/sites-available/multiplayer.wonderspants.com /etc/nginx/sites-enabled

// check if everything is ok
// sudo nginx -t

// restart the nginx server
// sudo systemctl reload nginx
