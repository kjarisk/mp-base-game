// lobby.js - handles game lobby interactions
const socket = io();

function renderGames(list) {
  const container = document.getElementById('gamesList');
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<div>No games in progress</div>';
  }
  list.forEach((game) => {
    const div = document.createElement('div');
    const btn = document.createElement('button');
    btn.textContent = 'Join';
    btn.addEventListener('click', () => {
      window.location.href = `./game.html?gameId=${game.id}`;
    });
    div.textContent = `${game.name} (${game.players})`;
    div.appendChild(btn);
    container.appendChild(div);
  });
}

socket.on('gamesList', (list) => {
  renderGames(list);
});

// create game
const form = document.getElementById('createGameForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('gameNameInput').value.trim();
  const id = Math.random().toString(36).substring(2, 9);
  window.location.href = `./game.html?gameId=${id}&create=1&name=${encodeURIComponent(name)}`;
});
