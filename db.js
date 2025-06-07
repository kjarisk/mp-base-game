const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'players.json');

let players = {};

function loadPlayers() {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    players = JSON.parse(data);
  } catch (err) {
    players = {};
  }
  return players;
}

function savePlayers() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(players, null, 2));
}

function getPlayer(username) {
  return players[username];
}

function createPlayer(username, passwordHash = '') {
  if (!players[username]) {
    players[username] = {
      username,
      passwordHash,
      highScore: 0,
      settings: {},
      questState: {}
    };
    savePlayers();
  }
  return players[username];
}

function updateScore(username, newScore) {
  const player = players[username];
  if (player && newScore > player.highScore) {
    player.highScore = newScore;
    savePlayers();
  }
}

function updateQuestState(username, questState) {
  const player = players[username];
  if (player) {
    player.questState = questState;
    savePlayers();
  }
}

function getQuestState(username) {
  return players[username]?.questState || {};
}

module.exports = {
  loadPlayers,
  savePlayers,
  getPlayer,
  createPlayer,
  updateScore,
  updateQuestState,
  getQuestState
};
