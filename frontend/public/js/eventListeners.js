window.addEventListener('click', (event) => {
  const canvas = document.querySelector('canvas');
  const { top, left } = canvas.getBoundingClientRect();
  const playerPosition = {
    x: frontEndPlayers[socket.id].x,
    y: frontEndPlayers[socket.id].y
  };
  const angle = Math.atan2(
    event.clientY - top - playerPosition.y, // using scale for devicePixelRation
    event.clientX - left - playerPosition.x
  );
  // const velocity = {
  //   x: Math.cos(angle) * 5,
  //   y: Math.sin(angle) * 5
  // };

  socket.emit('shoot', {
    x: playerPosition.x,
    y: playerPosition.y,
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
