const express = require('express');
const gameConfig = require('../../shared/gameConfig');
const router = express.Router();

// Sci-fi themed guest names shared between frontend and backend
const GUEST_NAMES = require('../../shared/guestNames');

// Keep track of used guest names
const usedGuestNames = new Set();

// Get available guest name
router.get('/guest-name', async (req, res) => {
  try {
    // Get list of currently active players from database/memory
    const db = require('../database');
    const activeUsers = await db.getActiveUsers();
    const activeUsernames = new Set(activeUsers.map(user => user.username));
    
    // Find available guest names
    const availableNames = GUEST_NAMES.filter(name => 
      !activeUsernames.has(name) && !usedGuestNames.has(name)
    );
    
    if (availableNames.length === 0) {
      // If no names available, generate a random one with number suffix
      const baseName = GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
      let guestName = baseName;
      let counter = 1;
      
      while (activeUsernames.has(guestName) || usedGuestNames.has(guestName)) {
        guestName = `${baseName}${counter}`;
        counter++;
      }
      
      usedGuestNames.add(guestName);
      return res.json({ success: true, guestName });
    }
    
    // Pick a random available name
    const selectedName = availableNames[Math.floor(Math.random() * availableNames.length)];
    usedGuestNames.add(selectedName);
    
    res.json({ success: true, guestName: selectedName });
  } catch (error) {
    console.error('Error getting guest name:', error);
    res.status(500).json({ success: false, error: 'Unable to get guest name' });
  }
});

// Clean up guest name when user disconnects
function releaseGuestName(guestName) {
  if (guestName && usedGuestNames.has(guestName)) {
    usedGuestNames.delete(guestName);
    console.log(`Released guest name: ${guestName}`);
  }
}

// Get game configuration for frontend
router.get('/config', (req, res) => {
  // Only send safe configuration to frontend (no sensitive data)
  const safeConfig = {
    maxPlayersPerGame: gameConfig.MAX_PLAYERS_PER_GAME,
    projectileSpeed: gameConfig.PROJECTILE_SPEED,
    playerSpeed: gameConfig.PLAYER_SPEED,
    mapWidth: gameConfig.MAP_WIDTH,
    mapHeight: gameConfig.MAP_HEIGHT,
    gameTickRate: gameConfig.GAME_TICK_RATE,
    pointsPerEnemy: gameConfig.POINTS_PER_ENEMY,
    pointsPerLevel: gameConfig.POINTS_PER_LEVEL,
    respawnTime: gameConfig.RESPAWN_TIME
  };
  
  res.json(safeConfig);
});

module.exports = router;
module.exports.releaseGuestName = releaseGuestName;
