// Level Manager for Single Player Mode
class LevelManager {
  constructor() {
    this.currentLevel = 1;
    this.levelData = null;
    this.highestLevel = this.loadProgress().highestLevel || 0;
  }

  static LEVEL_CONFIGS = {
    1: {
      name: 'Tutorial',
      width: 3000,
      density: 0.15,
      movingRatio: 0,
      mineableRatio: 0.2,
      powerupCount: 2,
      crystalCount: 15,
      parTime: 45,
      description: 'Learn the basics - navigate through the asteroid field to reach the finish zone.'
    },
    2: {
      name: 'Beginner',
      width: 4000,
      density: 0.25,
      movingRatio: 0.2,
      mineableRatio: 0.25,
      powerupCount: 3,
      crystalCount: 20,
      parTime: 55,
      description: 'Moving asteroids appear. Stay alert and time your movements!'
    },
    3: {
      name: 'Mining Zone',
      width: 5000,
      density: 0.30,
      movingRatio: 0.25,
      mineableRatio: 0.35,
      powerupCount: 4,
      crystalCount: 30,
      parTime: 65,
      description: 'Rich in mineable asteroids. Shoot the golden rocks to collect extra crystals!'
    },
    4: {
      name: 'Dense Field',
      width: 6000,
      density: 0.40,
      movingRatio: 0.35,
      mineableRatio: 0.3,
      powerupCount: 5,
      crystalCount: 35,
      parTime: 80,
      description: 'A dense asteroid field. Use powerups wisely to survive!'
    },
    5: {
      name: 'Chaos Zone',
      width: 7000,
      density: 0.50,
      movingRatio: 0.4,
      mineableRatio: 0.35,
      powerupCount: 6,
      crystalCount: 45,
      parTime: 100,
      description: 'The ultimate challenge. Only the best pilots make it through!'
    }
  };

  getConfig(level) {
    if (level <= 5) {
      return { ...LevelManager.LEVEL_CONFIGS[level] };
    }
    
    // Endless mode - procedurally harder levels
    const baseConfig = LevelManager.LEVEL_CONFIGS[5];
    const scaleFactor = level - 5;
    
    return {
      name: `Endless ${level}`,
      width: baseConfig.width + scaleFactor * 1000,
      density: Math.min(0.65, baseConfig.density + scaleFactor * 0.03),
      movingRatio: Math.min(0.6, baseConfig.movingRatio + scaleFactor * 0.05),
      mineableRatio: baseConfig.mineableRatio,
      powerupCount: baseConfig.powerupCount + Math.floor(scaleFactor / 2),
      crystalCount: baseConfig.crystalCount + scaleFactor * 5,
      parTime: baseConfig.parTime + scaleFactor * 15,
      description: 'Endless mode - how far can you go?'
    };
  }

  generateLevel(level, viewportHeight) {
    const config = this.getConfig(level);
    this.currentLevel = level;
    
    const startBuffer = 200;
    const endBuffer = 300;
    const playableWidth = config.width - startBuffer - endBuffer;
    
    // Generate asteroids
    const asteroids = this.generateAsteroids(config, startBuffer, playableWidth, viewportHeight);
    
    // Generate powerups
    const powerups = this.generatePowerups(config, startBuffer, playableWidth, viewportHeight);
    
    // Generate crystals
    const crystals = this.generateCrystals(config, startBuffer, playableWidth, viewportHeight);
    
    this.levelData = {
      config,
      asteroids,
      powerups,
      crystals,
      width: config.width,
      height: viewportHeight
    };
    
    return this.levelData;
  }

  generateAsteroids(config, startBuffer, playableWidth, viewportHeight) {
    const asteroids = [];
    
    // Calculate number based on density
    const area = playableWidth * viewportHeight;
    const avgAsteroidArea = Math.PI * 50 * 50;
    const numAsteroids = Math.floor((area * config.density) / avgAsteroidArea);
    
    for (let i = 0; i < numAsteroids; i++) {
      const radius = 25 + Math.random() * 60;
      const x = startBuffer + Math.random() * playableWidth;
      const y = radius + Math.random() * (viewportHeight - radius * 2);
      
      // Determine type
      const rand = Math.random();
      let type, hasCollision;
      
      if (rand < config.mineableRatio) {
        type = 'mineable';
        hasCollision = true;
      } else if (rand < config.mineableRatio + 0.3) {
        type = 'static';
        hasCollision = false;
      } else {
        type = 'collision';
        hasCollision = true;
      }
      
      const isMoving = Math.random() < config.movingRatio;
      
      asteroids.push({
        x, y, radius,
        type,
        hasCollision,
        health: type === 'mineable' ? 3 : 0,
        isMoving,
        vx: isMoving ? (Math.random() - 0.5) * 2 : 0,
        vy: isMoving ? (Math.random() - 0.5) * 1.5 : 0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        vertices: this.generateAsteroidVertices(radius)
      });
    }
    
    return asteroids;
  }

  generateAsteroidVertices(radius) {
    const vertices = [];
    const numVertices = 8 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const variation = 0.7 + Math.random() * 0.5;
      vertices.push({
        x: Math.cos(angle) * radius * variation,
        y: Math.sin(angle) * radius * variation
      });
    }
    
    return vertices;
  }

  generatePowerups(config, startBuffer, playableWidth, viewportHeight) {
    const powerups = [];
    const types = ['shield', 'speed', 'rapid', 'magnet', 'timeslow'];
    
    for (let i = 0; i < config.powerupCount; i++) {
      // Distribute powerups evenly across the level
      const segment = playableWidth / config.powerupCount;
      const x = startBuffer + segment * i + Math.random() * segment * 0.8 + segment * 0.1;
      const y = 50 + Math.random() * (viewportHeight - 100);
      
      powerups.push({
        x, y,
        radius: 15,
        type: types[Math.floor(Math.random() * types.length)],
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      });
    }
    
    return powerups;
  }

  generateCrystals(config, startBuffer, playableWidth, viewportHeight) {
    const crystals = [];
    
    for (let i = 0; i < config.crystalCount; i++) {
      const x = startBuffer + Math.random() * playableWidth;
      const y = 30 + Math.random() * (viewportHeight - 60);
      
      crystals.push({
        x, y,
        radius: 10,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      });
    }
    
    return crystals;
  }

  completeLevel(level, stats) {
    if (level > this.highestLevel) {
      this.highestLevel = level;
      this.saveProgress();
    }
    
    // Calculate score bonuses
    const config = this.getConfig(level);
    const bonuses = {
      levelComplete: 500,
      crystals: stats.crystals * 10,
      timeBonus: stats.time < config.parTime ? 200 : 0,
      noDamage: stats.noDamage ? 300 : 0,
      allCrystals: stats.crystals >= config.crystalCount ? 250 : 0
    };
    
    const total = Object.values(bonuses).reduce((a, b) => a + b, 0);
    
    return { bonuses, total };
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('sp_progress');
      return saved ? JSON.parse(saved) : { highestLevel: 0 };
    } catch {
      return { highestLevel: 0 };
    }
  }

  saveProgress() {
    try {
      localStorage.setItem('sp_progress', JSON.stringify({
        highestLevel: this.highestLevel
      }));
    } catch (e) {
      console.warn('Could not save progress:', e);
    }
  }

  getAvailableLevels() {
    const levels = [];
    for (let i = 1; i <= 5; i++) {
      const config = LevelManager.LEVEL_CONFIGS[i];
      levels.push({
        level: i,
        name: config.name,
        description: config.description,
        unlocked: i <= this.highestLevel + 1,
        completed: i <= this.highestLevel
      });
    }
    
    // Add endless mode if level 5 completed
    if (this.highestLevel >= 5) {
      levels.push({
        level: 6,
        name: 'Endless Mode',
        description: 'Procedurally generated levels of increasing difficulty',
        unlocked: true,
        completed: false,
        isEndless: true
      });
    }
    
    return levels;
  }
}

window.LevelManager = LevelManager;

