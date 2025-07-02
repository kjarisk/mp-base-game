const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./config');

const FILE_PATH = path.join(__dirname, config.database.filePath);

let players = {};

function loadPlayers() {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf8');
      players = JSON.parse(data);
      logger.info(`Loaded ${Object.keys(players).length} players from database`);
    } else {
      logger.info('No existing player database found, starting fresh');
      players = {};
    }
  } catch (err) {
    logger.error('Failed to load players database', { error: err.message });
    players = {};
  }
  return players;
}

function savePlayers() {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(players, null, 2));
    logger.debug('Players database saved successfully');
  } catch (err) {
    logger.error('Failed to save players database', { error: err.message });
    throw new Error('Database save failed');
  }
}

function getPlayer(username) {
  return players[username];
}

function createPlayer(username, passwordHash = '') {
  if (!username || typeof username !== 'string') {
    throw new Error('Valid username is required');
  }
  
  if (!players[username]) {
    players[username] = {
      username,
      passwordHash,
      highScore: 0,
      settings: {},
      questState: {},
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    if (config.database.autoSave) {
      savePlayers();
    }
    
    logger.info(`Created new player: ${username}`);
  } else {
    // Update last login for existing player
    players[username].lastLogin = new Date().toISOString();
    if (config.database.autoSave) {
      savePlayers();
    }
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
