const express = require('express');
const gameConfig = require('../../shared/gameConfig');
const router = express.Router();

// Guest name pool - sci-fi themed names
const GUEST_NAMES = [
  'Nebula', 'Orion', 'Vega', 'Sirius', 'Altair', 'Rigel', 'Polaris', 'Castor', 'Pollux', 'Andromeda',
  'Galaxy', 'Cosmos', 'Stellar', 'Nova', 'Comet', 'Meteor', 'Asteroid', 'Quasar', 'Pulsar', 'Neutron',
  'Phoenix', 'Dragon', 'Falcon', 'Eagle', 'Hawk', 'Raven', 'Wolf', 'Tiger', 'Lion', 'Panther',
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa',
  'Cipher', 'Matrix', 'Vector', 'Pixel', 'Binary', 'Quantum', 'Photon', 'Electron', 'Proton', 'Neutron',
  'Titan', 'Atlas', 'Hermes', 'Apollo', 'Artemis', 'Athena', 'Zeus', 'Poseidon', 'Hades', 'Ares',
  'Crimson', 'Azure', 'Violet', 'Emerald', 'Golden', 'Silver', 'Platinum', 'Diamond', 'Ruby', 'Sapphire',
  'Storm', 'Thunder', 'Lightning', 'Blizzard', 'Tornado', 'Hurricane', 'Cyclone', 'Typhoon', 'Monsoon', 'Gale',
  'Shadow', 'Ghost', 'Phantom', 'Specter', 'Wraith', 'Spirit', 'Soul', 'Echo', 'Mirage', 'Illusion',
  'Blade', 'Sword', 'Spear', 'Arrow', 'Shield', 'Armor', 'Helmet', 'Gauntlet', 'Boot', 'Cloak',
  'Fire', 'Ice', 'Earth', 'Air', 'Water', 'Metal', 'Wood', 'Light', 'Dark', 'Void',
  'Hunter', 'Ranger', 'Scout', 'Warrior', 'Knight', 'Paladin', 'Rogue', 'Assassin', 'Mage', 'Wizard',
  'Ace', 'Chief', 'Major', 'Captain', 'Admiral', 'General', 'Marshal', 'Commander', 'Leader', 'Boss',
  'Cyber', 'Tech', 'Data', 'Code', 'Hack', 'Link', 'Node', 'Grid', 'Net', 'Web',
  'Star', 'Moon', 'Sun', 'Earth', 'Mars', 'Venus', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
  'Apex', 'Prime', 'Ultra', 'Super', 'Mega', 'Giga', 'Tera', 'Peta', 'Exa', 'Zetta',
  'Frost', 'Flame', 'Spark', 'Bolt', 'Charge', 'Surge', 'Pulse', 'Wave', 'Beam', 'Ray',
  'Viper', 'Cobra', 'Python', 'Boa', 'Mamba', 'Adder', 'Asp', 'Krait', 'Taipan', 'Coral',
  'Laser', 'Plasma', 'Fusion', 'Fission', 'Atomic', 'Nuclear', 'Particle', 'Molecule', 'Atom', 'Ion',
  'Turbo', 'Nitro', 'Boost', 'Rush', 'Speed', 'Swift', 'Flash', 'Dash', 'Zoom', 'Blur'
];

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
