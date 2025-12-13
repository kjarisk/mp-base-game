// Powerup Manager for Single Player Mode
class PowerupManager {
  static POWERUP_CONFIG = {
    shield: {
      name: 'Shield',
      color: '#20B2AA',
      duration: 5000,
      icon: 'S',
      description: 'Blocks 1 hit from asteroids',
      effect: 'shield'
    },
    speed: {
      name: 'Speed Boost',
      color: '#FFD700',
      duration: 4000,
      icon: 'F',
      description: '50% faster movement',
      effect: 'speedMultiplier',
      value: 1.5
    },
    rapid: {
      name: 'Rapid Fire',
      color: '#FF8C00',
      duration: 6000,
      icon: 'R',
      description: '3x fire rate',
      effect: 'fireRateMultiplier',
      value: 3
    },
    magnet: {
      name: 'Crystal Magnet',
      color: '#9B59B6',
      duration: 8000,
      icon: 'M',
      description: 'Auto-collect nearby crystals',
      effect: 'magnetRange',
      value: 150
    },
    timeslow: {
      name: 'Time Slow',
      color: '#FFFFFF',
      duration: 3000,
      icon: 'T',
      description: 'Slows asteroids by 50%',
      effect: 'timeScale',
      value: 0.5
    }
  };

  constructor() {
    this.activePowerups = {};
    this.totalCollected = this.loadStats().totalCollected || 0;
    this.shieldHitsBlocked = this.loadStats().shieldHitsBlocked || 0;
  }

  activate(type) {
    const config = PowerupManager.POWERUP_CONFIG[type];
    if (!config) return null;
    
    this.activePowerups[type] = {
      startTime: Date.now(),
      duration: config.duration,
      remaining: config.duration,
      config
    };
    
    this.totalCollected++;
    this.saveStats();
    
    return config;
  }

  deactivate(type) {
    delete this.activePowerups[type];
  }

  update(deltaTime) {
    const now = Date.now();
    const expired = [];
    
    for (const [type, powerup] of Object.entries(this.activePowerups)) {
      const elapsed = now - powerup.startTime;
      powerup.remaining = Math.max(0, powerup.duration - elapsed);
      
      if (powerup.remaining <= 0) {
        expired.push(type);
      }
    }
    
    // Remove expired powerups
    for (const type of expired) {
      this.deactivate(type);
    }
    
    return expired;
  }

  isActive(type) {
    return !!this.activePowerups[type];
  }

  getRemaining(type) {
    const powerup = this.activePowerups[type];
    return powerup ? powerup.remaining : 0;
  }

  getRemainingPercent(type) {
    const powerup = this.activePowerups[type];
    if (!powerup) return 0;
    return (powerup.remaining / powerup.duration) * 100;
  }

  getActivePowerupsList() {
    return Object.entries(this.activePowerups).map(([type, powerup]) => ({
      type,
      name: powerup.config.name,
      remaining: this.getRemainingPercent(type),
      color: powerup.config.color
    }));
  }

  getEffectValue(effect) {
    for (const powerup of Object.values(this.activePowerups)) {
      if (powerup.config.effect === effect) {
        return powerup.config.value;
      }
    }
    return null;
  }

  getSpeedMultiplier() {
    return this.isActive('speed') ? PowerupManager.POWERUP_CONFIG.speed.value : 1;
  }

  getFireRateMultiplier() {
    return this.isActive('rapid') ? PowerupManager.POWERUP_CONFIG.rapid.value : 1;
  }

  getTimeScale() {
    return this.isActive('timeslow') ? PowerupManager.POWERUP_CONFIG.timeslow.value : 1;
  }

  getMagnetRange() {
    return this.isActive('magnet') ? PowerupManager.POWERUP_CONFIG.magnet.value : 0;
  }

  hasShield() {
    return this.isActive('shield');
  }

  useShield() {
    if (this.isActive('shield')) {
      this.deactivate('shield');
      this.shieldHitsBlocked++;
      this.saveStats();
      return true;
    }
    return false;
  }

  clearAll() {
    this.activePowerups = {};
  }

  getStats() {
    return {
      totalCollected: this.totalCollected,
      shieldHitsBlocked: this.shieldHitsBlocked
    };
  }

  loadStats() {
    try {
      const saved = localStorage.getItem('sp_powerup_stats');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveStats() {
    try {
      localStorage.setItem('sp_powerup_stats', JSON.stringify({
        totalCollected: this.totalCollected,
        shieldHitsBlocked: this.shieldHitsBlocked
      }));
    } catch (e) {
      console.warn('Could not save powerup stats:', e);
    }
  }

  static getRandomType() {
    const types = Object.keys(PowerupManager.POWERUP_CONFIG);
    return types[Math.floor(Math.random() * types.length)];
  }

  static getConfig(type) {
    return PowerupManager.POWERUP_CONFIG[type];
  }

  static getAllTypes() {
    return Object.keys(PowerupManager.POWERUP_CONFIG);
  }
}

window.PowerupManager = PowerupManager;

