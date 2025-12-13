// Single Player Game Engine - handles local game loop without server
class SinglePlayerEngine {
  constructor(canvas, context, options = {}) {
    this.canvas = canvas;
    this.ctx = context;
    this.options = options;
    
    // Viewport and map settings
    this.viewportWidth = 1229;
    this.viewportHeight = 749;
    this.levelWidth = 8000; // Longer levels
    this.levelHeight = 1200; // Taller world for vertical movement
    
    // Camera
    this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
    
    // Player with thrust physics
    this.player = null;
    this.playerVelocity = { x: 0, y: 0 };
    this.thrustPower = 0.05; // Acceleration when pressing keys
    this.maxSpeed = 2;
    this.friction = 0.98; // Slowdown when not thrusting
    this.shootCooldown = 200;
    this.lastShootTime = 0;
    
    // Special weapon
    this.specialWeaponCharge = 0;
    this.maxSpecialCharge = 100;
    this.specialWeaponCooldown = 0;
    
    // Game objects
    this.projectiles = [];
    this.asteroids = [];
    this.powerups = [];
    this.crystals = [];
    this.particles = [];
    this.enemies = [];
    this.enemyProjectiles = [];
    this.spaceStations = [];
    this.finishZone = null;
    this.boss = null;
    
    // Level objectives
    this.objectivesComplete = false;
    this.isBossLevel = false;
    this.bossDefeated = false;
    this.requiredCrystals = 0;
    this.showBossWarning = false;
    this.bossWarningTime = 0;
    
    // Game state
    this.level = 1;
    this.score = 0;
    this.crystalsCollected = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.damageTaken = false;
    this.levelCompleted = false; // Guard to prevent multiple level completions
    this.timeElapsed = 0;
    this.timeLimit = 120; // 2 minutes per level
    this.lastTime = 0;
    this.warningPlayed = false;
    this.inSafeZone = false;
    
    // Per-level stat tracking (for achievements)
    this.asteroidsDestroyedThisLevel = 0;
    this.powerupsCollectedThisLevel = 0;
    this.enemiesKilledThisLevel = 0;
    
    // Player rotation for classic controls
    this.playerRotation = 0;
    this.rotationSpeed = 0.04;
    
    // Powerup states
    this.activePowerups = {
      shield: { active: false, remaining: 0 },
      speed: { active: false, remaining: 0 },
      rapid: { active: false, remaining: 0 },
      magnet: { active: false, remaining: 0 },
      timeslow: { active: false, remaining: 0 },
      plasma: { active: false, remaining: 0 },
      homing: { active: false, remaining: 0 },
      timeextend: { active: false, remaining: 0 }
    };
    
    // Input state
    this.keys = { w: false, a: false, s: false, d: false, shift: false, e: false, space: false };
    this.mouseX = 0;
    this.mouseY = 0;
    
    // Animation
    this.animationId = null;
    this.isRunning = false;
    this.isPaused = false;
    
    // Sound system
    this.sounds = {};
    this.soundEnabled = true;
    this.initSounds();
    
    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  initSounds() {
    // Create audio context for sound effects
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not supported');
      this.soundEnabled = false;
    }
  }

  playSound(type) {
    if (!this.soundEnabled || !this.audioContext) return;
    
    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    switch (type) {
      case 'warning':
        oscillator.frequency.value = 440;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        // Play twice for alarm effect
        setTimeout(() => this.playSound('warning2'), 300);
        break;
      case 'warning2':
        oscillator.frequency.value = 520;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'shoot':
        oscillator.frequency.value = 800;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;
      case 'special':
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;
      case 'collect':
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'damage':
        oscillator.frequency.value = 150;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
    }
  }

  start() {
    this.setupEventListeners();
    this.initializeLevel(this.level);
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.removeEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('click', this.handleClick);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  removeEventListeners() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('click', this.handleClick);
  }

  handleKeyDown(e) {
    if (e.code === 'Escape') {
      this.togglePause();
      return;
    }
    
    if (this.isPaused) return;
    
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': this.keys.w = true; break;
      case 'KeyA': case 'ArrowLeft': this.keys.a = true; break;
      case 'KeyS': case 'ArrowDown': this.keys.s = true; break;
      case 'KeyD': case 'ArrowRight': this.keys.d = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.shift = true; break;
      case 'Space':
        // Space to shoot
        if (!this.keys.space) this.fireWeapon();
        this.keys.space = true;
        break;
      case 'KeyE': 
        // E for special weapon
        if (!this.keys.e) this.fireSpecialWeapon();
        this.keys.e = true; 
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': this.keys.w = false; break;
      case 'KeyA': case 'ArrowLeft': this.keys.a = false; break;
      case 'KeyS': case 'ArrowDown': this.keys.s = false; break;
      case 'KeyD': case 'ArrowRight': this.keys.d = false; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.shift = false; break;
      case 'Space': this.keys.space = false; break;
      case 'KeyE': this.keys.e = false; break;
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
  }

  handleClick(e) {
    // Click also fires weapon (optional alternative to space)
    this.fireWeapon();
  }

  fireWeapon() {
    if (this.isPaused || this.health <= 0 || this.inSafeZone) return;
    
    const now = Date.now();
    let cooldown = this.shootCooldown;
    if (this.activePowerups.rapid.active) cooldown /= 3;
    
    if (now - this.lastShootTime < cooldown) return;
    this.lastShootTime = now;
    
    // Shoot in the direction the ship is facing (offset by -90° since sprite faces up)
    const angle = this.playerRotation - Math.PI / 2;
    
    // Determine projectile properties
    const isPlasma = this.activePowerups.plasma.active;
    const isHoming = this.activePowerups.homing && this.activePowerups.homing.active;
    
    // Create projectile
    this.projectiles.push({
      x: this.player.x + Math.cos(angle) * this.player.radius,
      y: this.player.y + Math.sin(angle) * this.player.radius,
      vx: Math.cos(angle) * 12,
      vy: Math.sin(angle) * 12,
      radius: isPlasma ? 8 : 4,
      color: isPlasma ? '#FF4444' : (isHoming ? '#FF8C00' : '#20B2AA'),
      isPlasma,
      isHoming,
      createdAt: now
    });
    
    this.playSound('shoot');
  }

  fireSpecialWeapon() {
    if (this.specialWeaponCharge < this.maxSpecialCharge) return;
    if (this.specialWeaponCooldown > 0) return;
    if (this.inSafeZone) return; // Can't use weapons in safe zone
    
    this.specialWeaponCharge = 0;
    this.specialWeaponCooldown = 60; // 1 second cooldown
    
    this.playSound('special');
    
    // Nova Blast - destroy all nearby collision asteroids
    const blastRadius = 250;
    
    // Create visual effect
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      this.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * 8,
        vy: Math.sin(angle) * 8,
        radius: 5,
        color: '#FFD700',
        alpha: 1,
        decay: 0.02
      });
    }
    
    // Destroy asteroids in range
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const asteroid = this.asteroids[i];
      if (!asteroid.hasCollision) continue;
      
      const dist = Math.sqrt((this.player.x - asteroid.x) ** 2 + (this.player.y - asteroid.y) ** 2);
      
      if (dist < blastRadius + asteroid.radius) {
        // Create explosion particles
        this.createParticles(asteroid.x, asteroid.y, '#FF8C00', 10);
        
        // Spawn crystals from mineable
        if (asteroid.type === 'mineable') {
          this.spawnCrystalsFromAsteroid(asteroid);
        }
        
        this.asteroids.splice(i, 1);
        this.score += 10; // Reduced from 25
        this.asteroidsDestroyedThisLevel++;
      }
    }
    
    // Damage enemies in range
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const dist = Math.sqrt((this.player.x - enemy.x) ** 2 + (this.player.y - enemy.y) ** 2);
      
      if (dist < blastRadius) {
        enemy.health -= 50;
        if (enemy.health <= 0) {
          this.createParticles(enemy.x, enemy.y, '#FF6B6B', 15);
          this.enemies.splice(i, 1);
          this.score += 50; // Reduced from 100
          this.enemiesKilledThisLevel++;
        }
      }
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastTime = performance.now();
    }
  }

  initializeLevel(levelNum) {
    this.level = levelNum;
    this.damageTaken = false;
    this.levelCompleted = false; // Reset level completion flag
    this.timeElapsed = 0;
    this.crystalsCollected = 0;
    this.warningPlayed = false;
    this.specialWeaponCharge = 0;
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    
    // Reset per-level stats
    this.asteroidsDestroyedThisLevel = 0;
    this.powerupsCollectedThisLevel = 0;
    this.enemiesKilledThisLevel = 0;
    
    // Reset player rotation
    this.playerRotation = 0;
    
    // Level configuration
    const levelConfig = this.getLevelConfig(levelNum);
    this.levelWidth = levelConfig.width;
    this.levelHeight = levelConfig.height;
    this.timeLimit = levelConfig.timeLimit;
    
    // Check if this is a boss level (every 4th level)
    this.isBossLevel = levelNum % 4 === 0;
    this.bossDefeated = false;
    this.objectivesComplete = false;
    this.boss = null;
    
    // Set required crystals for objective (50% of available)
    this.requiredCrystals = Math.floor(levelConfig.crystalCount * 0.5);
    
    // Show boss warning at start of boss levels
    if (this.isBossLevel) {
      this.showBossWarning = true;
      this.bossWarningTime = Date.now();
    }
    
    // Create player at start position (15% smaller: 18 * 0.85 ≈ 15)
    this.player = new Player({
      x: 150,
      y: this.levelHeight / 2,
      radius: 15,
      color: '#20B2AA',
      username: this.options.username || 'Pilot'
    });
    this.playerVelocity = { x: 0, y: 0 };
    
    // Generate level content
    this.generateAsteroids(levelConfig);
    this.generatePowerups(levelConfig);
    this.generateCrystals(levelConfig);
    this.generateEnemies(levelConfig);
    this.generateSpaceStations(levelConfig);
    this.generateFinishZone(levelConfig);
    
    // Generate boss for boss levels
    if (this.isBossLevel) {
      this.generateBoss(levelNum, levelConfig);
    }
    
    // Reset camera
    this.camera.x = 0;
    this.camera.y = (this.levelHeight - this.viewportHeight) / 2;
    
    // Clear powerups
    for (const key in this.activePowerups) {
      this.activePowerups[key] = { active: false, remaining: 0 };
    }
    
    // Update UI
    this.updateState();
  }

  getLevelConfig(level) {
    // Themed level zones for 100 levels
    // 1-5: Tutorial Zone - learn mechanics
    // 6-10: Asteroid Belt - dense fields
    // 11-15: Enemy Territory - more enemies
    // 16-20: Mining Operations - lots of mineables
    // 21-30: Deep Space - longer levels, mixed challenges
    // 31-50: War Zone - heavy combat
    // 51-75: Expert Challenges - all mechanics combined
    // 76-100: Legendary - extreme difficulty
    
    // Every 4th level is a boss level
    // Every 10th level is a mega boss (harder)
    const isBoss = level % 4 === 0;
    const isMegaBoss = level % 10 === 0;
    
    let config;
    
    if (level <= 5) {
      // Tutorial Zone
      const t = level;
      config = {
        width: 4000 + t * 800,
        height: 800 + t * 50,
        density: 0.08 + t * 0.02,
        movingRatio: t > 2 ? 0.1 : 0,
        mineableRatio: 0.25 + t * 0.02,
        powerupCount: 3 + t,
        crystalCount: 15 + t * 3,
        enemyCount: t > 3 ? t - 2 : 0,
        stationCount: 1,
        timeLimit: 80 + t * 10,
        zone: 'Tutorial'
      };
    } else if (level <= 10) {
      // Asteroid Belt - dense fields
      const t = level - 5;
      config = {
        width: 7000 + t * 600,
        height: 1000 + t * 40,
        density: 0.25 + t * 0.03,
        movingRatio: 0.15 + t * 0.05,
        mineableRatio: 0.2,
        powerupCount: 5 + t,
        crystalCount: 25 + t * 4,
        enemyCount: 3 + t,
        stationCount: 1 + Math.floor(t / 3),
        timeLimit: 100 + t * 10,
        zone: 'Asteroid Belt'
      };
    } else if (level <= 15) {
      // Enemy Territory
      const t = level - 10;
      config = {
        width: 8000 + t * 500,
        height: 1100 + t * 30,
        density: 0.2,
        movingRatio: 0.25,
        mineableRatio: 0.25,
        powerupCount: 6 + t,
        crystalCount: 30 + t * 3,
        enemyCount: 8 + t * 3,
        stationCount: 2,
        timeLimit: 120 + t * 10,
        zone: 'Enemy Territory'
      };
    } else if (level <= 20) {
      // Mining Operations
      const t = level - 15;
      config = {
        width: 9000 + t * 600,
        height: 1150 + t * 25,
        density: 0.22,
        movingRatio: 0.2,
        mineableRatio: 0.45 + t * 0.02,
        powerupCount: 7 + t,
        crystalCount: 50 + t * 8,
        enemyCount: 5 + t,
        stationCount: 2 + Math.floor(t / 3),
        timeLimit: 140 + t * 10,
        zone: 'Mining Ops'
      };
    } else if (level <= 30) {
      // Deep Space
      const t = level - 20;
      config = {
        width: 10000 + t * 500,
        height: 1200 + t * 20,
        density: 0.25 + t * 0.01,
        movingRatio: 0.3 + t * 0.01,
        mineableRatio: 0.3,
        powerupCount: 8 + Math.floor(t / 2),
        crystalCount: 45 + t * 4,
        enemyCount: 8 + t * 2,
        stationCount: 2 + Math.floor(t / 4),
        timeLimit: 160 + t * 8,
        zone: 'Deep Space'
      };
    } else if (level <= 50) {
      // War Zone
      const t = level - 30;
      config = {
        width: 12000 + t * 300,
        height: 1300 + t * 10,
        density: 0.3 + t * 0.005,
        movingRatio: 0.35 + t * 0.005,
        mineableRatio: 0.25,
        powerupCount: 10 + Math.floor(t / 3),
        crystalCount: 55 + t * 3,
        enemyCount: 15 + t * 2,
        stationCount: 3 + Math.floor(t / 5),
        timeLimit: 180 + t * 5,
        zone: 'War Zone'
      };
    } else if (level <= 75) {
      // Expert Challenges
      const t = level - 50;
      config = {
        width: 14000 + t * 200,
        height: 1400 + t * 8,
        density: 0.38 + t * 0.004,
        movingRatio: 0.42 + t * 0.004,
        mineableRatio: 0.28,
        powerupCount: 12 + Math.floor(t / 4),
        crystalCount: 65 + t * 2,
        enemyCount: 20 + t,
        stationCount: 4,
        timeLimit: 200 + t * 4,
        zone: 'Expert'
      };
    } else {
      // Legendary (76-100+)
      const t = level - 75;
      config = {
        width: 16000 + t * 150,
        height: 1500,
        density: Math.min(0.55, 0.45 + t * 0.003),
        movingRatio: Math.min(0.6, 0.5 + t * 0.003),
        mineableRatio: 0.3,
        powerupCount: 15 + Math.floor(t / 5),
        crystalCount: 80 + t * 2,
        enemyCount: 25 + t,
        stationCount: 5,
        timeLimit: 240 + t * 3,
        zone: 'Legendary'
      };
    }
    
    // Boss levels have fewer regular enemies but the boss
    if (isBoss) {
      config.enemyCount = Math.floor(config.enemyCount * 0.6);
    }
    
    // Mega bosses get extra time
    if (isMegaBoss) {
      config.timeLimit += 60;
    }
    
    return config;
  }

  generateAsteroids(config) {
    this.asteroids = [];
    
    const startBuffer = 300;
    const endBuffer = 400;
    const playableWidth = config.width - startBuffer - endBuffer;
    
    const area = playableWidth * config.height;
    const avgAsteroidArea = Math.PI * 55 * 55;
    const numAsteroids = Math.floor((area * config.density) / avgAsteroidArea);
    
    for (let i = 0; i < numAsteroids; i++) {
      const radius = 30 + Math.random() * 70;
      const x = startBuffer + Math.random() * playableWidth;
      const y = radius + Math.random() * (config.height - radius * 2);
      
      const rand = Math.random();
      let type, hasCollision;
      
      if (rand < config.mineableRatio) {
        type = 'mineable';
        hasCollision = true;
      } else if (rand < config.mineableRatio + 0.25) {
        type = 'static';
        hasCollision = false;
      } else {
        type = 'collision';
        hasCollision = true;
      }
      
      const isMoving = Math.random() < config.movingRatio;
      
      this.asteroids.push({
        x, y, radius, type, hasCollision,
        health: type === 'mineable' ? 3 : 0,
        isMoving,
        vx: isMoving ? (Math.random() - 0.5) * 2.5 : 0,
        vy: isMoving ? (Math.random() - 0.5) * 2 : 0,
        rotation: Math.random() * Math.PI * 2,
        // Static asteroids don't rotate
        rotationSpeed: type === 'static' ? 0 : (Math.random() - 0.5) * 0.025,
        vertices: this.generateAsteroidVertices(radius)
      });
    }
  }

  generateAsteroidVertices(radius) {
    const vertices = [];
    const numVertices = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const variation = 0.65 + Math.random() * 0.55;
      vertices.push({
        x: Math.cos(angle) * radius * variation,
        y: Math.sin(angle) * radius * variation
      });
    }
    
    return vertices;
  }

  generatePowerups(config) {
    this.powerups = [];
    const types = ['shield', 'speed', 'rapid', 'magnet', 'timeslow', 'plasma', 'homing', 'timeextend'];
    
    for (let i = 0; i < config.powerupCount; i++) {
      const segment = (config.width - 600) / config.powerupCount;
      const x = 300 + segment * i + Math.random() * segment * 0.7;
      const y = 80 + Math.random() * (config.height - 160);
      
      this.powerups.push({
        x, y, radius: 18,
        type: types[Math.floor(Math.random() * types.length)],
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      });
    }
  }

  generateCrystals(config) {
    this.crystals = [];
    
    for (let i = 0; i < config.crystalCount; i++) {
      const x = 250 + Math.random() * (config.width - 500);
      const y = 40 + Math.random() * (config.height - 80);
      
      this.crystals.push({
        x, y, radius: 12,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      });
    }
  }

  generateEnemies(config) {
    this.enemies = [];
    
    const enemyTypes = ['drone', 'turret', 'hunter'];
    
    for (let i = 0; i < config.enemyCount; i++) {
      const x = 600 + Math.random() * (config.width - 900);
      const y = 100 + Math.random() * (config.height - 200);
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      
      this.enemies.push({
        x, y, radius: type === 'hunter' ? 22 : 18,
        type,
        health: type === 'hunter' ? 60 : (type === 'turret' ? 40 : 25),
        vx: 0, vy: 0,
        rotation: Math.random() * Math.PI * 2,
        lastShot: 0,
        shootInterval: type === 'turret' ? 1500 : (type === 'hunter' ? 2000 : 2500),
        detectionRange: type === 'hunter' ? 350 : 280,
        color: type === 'hunter' ? '#FF4444' : (type === 'turret' ? '#FF8C00' : '#9B59B6')
      });
    }
  }

  generateSpaceStations(config) {
    this.spaceStations = [];
    
    for (let i = 0; i < config.stationCount; i++) {
      const segment = (config.width - 800) / (config.stationCount + 1);
      const x = 400 + segment * (i + 1);
      const y = 150 + Math.random() * (config.height - 300);
      
      this.spaceStations.push({
        x, y, radius: 120, // Enlarged from 70
        rotation: Math.random() * Math.PI * 2
      });
    }
  }

  generateFinishZone(config) {
    // Randomize finish zone position
    const positions = [
      { x: config.width - 150, y: config.height / 2, w: 150, h: 200, type: 'right' },
      { x: config.width - 200, y: 50, w: 180, h: 120, type: 'topRight' },
      { x: config.width - 200, y: config.height - 170, w: 180, h: 120, type: 'bottomRight' },
      { x: config.width - 400, y: config.height / 2 - 75, w: 150, h: 150, type: 'portal' }
    ];
    
    this.finishZone = positions[Math.floor(Math.random() * positions.length)];
  }

  generateBoss(level, config) {
    const bossIndex = Math.floor(level / 4); // 1, 2, 3, 4...
    const bossTypes = ['guardian', 'swarm', 'laser', 'titan'];
    const bossType = bossTypes[(bossIndex - 1) % bossTypes.length];
    
    // Position boss in the middle-right area of the level
    const x = config.width * 0.7;
    const y = config.height / 2;
    
    // Boss stats scale with level
    const levelMultiplier = 1 + (bossIndex - 1) * 0.3;
    
    this.boss = {
      x, y,
      type: bossType,
      radius: bossType === 'titan' ? 80 : (bossType === 'swarm' ? 50 : 60),
      maxHealth: Math.floor(300 * levelMultiplier),
      health: Math.floor(300 * levelMultiplier),
      rotation: Math.PI,
      phase: 0,
      phaseTimer: 0,
      attackTimer: 0,
      spawnTimer: 0,
      chargeTimer: 0,
      isCharging: false,
      vx: 0,
      vy: 0,
      color: this.getBossColor(bossType),
      spawnedMinions: []
    };
  }

  getBossColor(type) {
    const colors = {
      guardian: '#4488FF',
      swarm: '#AA44FF',
      laser: '#FF4444',
      titan: '#FFD700'
    };
    return colors[type] || '#FF4444';
  }

  animate() {
    if (!this.isRunning) return;
    
    this.animationId = requestAnimationFrame(() => this.animate());
    
    const now = performance.now();
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.05); // Cap delta time
    this.lastTime = now;
    
    if (!this.isPaused && this.health > 0) {
      this.update(deltaTime);
    }
    
    this.render();
  }

  update(deltaTime) {
    // Check if in safe zone (space station)
    this.checkSafeZone();
    
    // Update time only if not in safe zone
    if (!this.inSafeZone) {
      this.timeElapsed += deltaTime;
      
      // Check for time warning
      const timeRemaining = this.timeLimit - this.timeElapsed;
      if (timeRemaining <= 10 && timeRemaining > 9.5 && !this.warningPlayed) {
        this.playSound('warning');
        this.warningPlayed = true;
      }
      
      // Check time out
      if (this.timeElapsed >= this.timeLimit) {
        this.takeDamage(100);
        return;
      }
    }
    
    // Update special weapon cooldown
    if (this.specialWeaponCooldown > 0) {
      this.specialWeaponCooldown--;
    }
    
    // Charge special weapon
    if (this.specialWeaponCharge < this.maxSpecialCharge) {
      this.specialWeaponCharge += deltaTime * 8; // Takes ~12 seconds to full charge
    }
    
    this.updatePlayer(deltaTime);
    this.updateCamera();
    this.updateProjectiles(deltaTime);
    this.updateAsteroids(deltaTime);
    this.updatePowerups(deltaTime);
    this.updateEnemies(deltaTime);
    if (this.boss && !this.bossDefeated) {
      this.updateBoss(deltaTime);
    }
    this.checkCollisions();
    this.checkObjectives();
    this.checkLevelCompletion();
    this.updateState();
  }

  updateBoss(deltaTime) {
    const boss = this.boss;
    const now = Date.now();
    const dx = this.player.x - boss.x;
    const dy = this.player.y - boss.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Face the player
    boss.rotation = Math.atan2(dy, dx);
    
    // Behavior based on boss type
    switch (boss.type) {
      case 'guardian':
        // Moves slowly, fires spread shots
        boss.x += (dx / dist) * 0.8;
        boss.y += (dy / dist) * 0.8;
        
        if (now - boss.attackTimer > 2000) {
          boss.attackTimer = now;
          // Fire spread of 5 projectiles
          for (let i = -2; i <= 2; i++) {
            const angle = boss.rotation + i * 0.3;
            this.enemyProjectiles.push({
              x: boss.x, y: boss.y,
              vx: Math.cos(angle) * 5,
              vy: Math.sin(angle) * 5,
              radius: 6, color: boss.color, createdAt: now
            });
          }
        }
        break;
        
      case 'swarm':
        // Circles around, spawns mini drones
        const circleAngle = now / 2000;
        const targetX = this.player.x + Math.cos(circleAngle) * 300;
        const targetY = this.player.y + Math.sin(circleAngle) * 300;
        boss.x += (targetX - boss.x) * 0.02;
        boss.y += (targetY - boss.y) * 0.02;
        
        // Spawn minions
        if (now - boss.spawnTimer > 3000 && boss.spawnedMinions.length < 5) {
          boss.spawnTimer = now;
          this.enemies.push({
            x: boss.x, y: boss.y, radius: 12,
            type: 'drone', health: 15,
            vx: 0, vy: 0, rotation: 0,
            lastShot: 0, shootInterval: 2500,
            detectionRange: 300, color: '#9B59B6'
          });
          boss.spawnedMinions.push(true);
        }
        break;
        
      case 'laser':
        // Charges up and fires a laser beam
        if (!boss.isCharging) {
          // Move toward player slowly
          boss.x += (dx / dist) * 0.5;
          boss.y += (dy / dist) * 0.5;
          
          if (now - boss.chargeTimer > 4000) {
            boss.isCharging = true;
            boss.chargeTimer = now;
          }
        } else {
          // Charging - stay still, then fire
          if (now - boss.chargeTimer > 1500) {
            // Fire laser burst
            for (let i = 0; i < 8; i++) {
              setTimeout(() => {
                if (this.boss && !this.bossDefeated) {
                  this.enemyProjectiles.push({
                    x: boss.x, y: boss.y,
                    vx: Math.cos(boss.rotation) * 10,
                    vy: Math.sin(boss.rotation) * 10,
                    radius: 8, color: '#FF0000', createdAt: Date.now()
                  });
                }
              }, i * 100);
            }
            boss.isCharging = false;
            boss.chargeTimer = now;
          }
        }
        break;
        
      case 'titan':
        // Large and slow, creates shockwaves
        boss.x += (dx / dist) * 0.4;
        boss.y += (dy / dist) * 0.4;
        
        if (now - boss.attackTimer > 3000) {
          boss.attackTimer = now;
          // Create circular shockwave
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.enemyProjectiles.push({
              x: boss.x, y: boss.y,
              vx: Math.cos(angle) * 4,
              vy: Math.sin(angle) * 4,
              radius: 8, color: boss.color, createdAt: now
            });
          }
        }
        break;
    }
    
    // Keep boss in bounds
    boss.x = Math.max(boss.radius, Math.min(this.levelWidth - boss.radius, boss.x));
    boss.y = Math.max(boss.radius, Math.min(this.levelHeight - boss.radius, boss.y));
  }

  checkObjectives() {
    if (this.isBossLevel) {
      // Boss level: must defeat boss
      this.objectivesComplete = this.bossDefeated;
    } else {
      // Normal level: collect enough crystals OR reach progress threshold
      this.objectivesComplete = this.crystalsCollected >= this.requiredCrystals || 
                                 (this.player.x / this.levelWidth) > 0.8;
    }
  }

  checkSafeZone() {
    this.inSafeZone = false;
    
    for (const station of this.spaceStations) {
      const dist = Math.sqrt((this.player.x - station.x) ** 2 + (this.player.y - station.y) ** 2);
      if (dist < station.radius - 10) {
        this.inSafeZone = true;
        // Slowly regenerate health in safe zone
        if (this.health < this.maxHealth) {
          this.health = Math.min(this.maxHealth, this.health + 0.2);
        }
        break;
      }
    }
  }

  updatePlayer(deltaTime) {
    // Classic Asteroids-style controls: A/D rotate, W thrust forward
    const thrustPower = this.activePowerups.speed.active ? this.thrustPower * 1.6 : this.thrustPower;
    
    // Rotation with A/D
    if (this.keys.a) this.playerRotation -= this.rotationSpeed;
    if (this.keys.d) this.playerRotation += this.rotationSpeed;
    
    // Thrust forward with W (in the direction we're facing)
    // Offset by -90° since the sprite faces up (negative Y) but rotation 0 = right (positive X)
    const thrustAngle = this.playerRotation - Math.PI / 2;
    let isThrusting = false;
    if (this.keys.w) {
      this.playerVelocity.x += Math.cos(thrustAngle) * thrustPower;
      this.playerVelocity.y += Math.sin(thrustAngle) * thrustPower;
      isThrusting = true;
    }

    // Reverse thrust with S (slower)
    if (this.keys.s) {
      this.playerVelocity.x -= Math.cos(thrustAngle) * thrustPower * 0.5;
      this.playerVelocity.y -= Math.sin(thrustAngle) * thrustPower * 0.5;
    }
    
    // Apply friction
    this.playerVelocity.x *= this.friction;
    this.playerVelocity.y *= this.friction;
    
    // Clamp to max speed
    const speed = Math.sqrt(this.playerVelocity.x ** 2 + this.playerVelocity.y ** 2);
    const maxSpd = this.activePowerups.speed.active ? this.maxSpeed * 1.5 : this.maxSpeed;
    
    if (speed > maxSpd) {
      this.playerVelocity.x = (this.playerVelocity.x / speed) * maxSpd;
      this.playerVelocity.y = (this.playerVelocity.y / speed) * maxSpd;
    }
    
    // Update position
    this.player.x += this.playerVelocity.x;
    this.player.y += this.playerVelocity.y;
    
    // Constrain to level bounds
    this.player.x = Math.max(this.player.radius, Math.min(this.levelWidth - this.player.radius, this.player.x));
    this.player.y = Math.max(this.player.radius, Math.min(this.levelHeight - this.player.radius, this.player.y));
    
    // Bounce off boundaries
    if (this.player.x <= this.player.radius || this.player.x >= this.levelWidth - this.player.radius) {
      this.playerVelocity.x *= -0.5;
    }
    if (this.player.y <= this.player.radius || this.player.y >= this.levelHeight - this.player.radius) {
      this.playerVelocity.y *= -0.5;
    }
    
    // Set thrust flag for visual effect
    this.player.isThrusting = isThrusting;
    
    // Update player's visual rotation to match our rotation
    this.player.rotation = this.playerRotation;
  }

  updateCamera() {
    // Camera follows player with lead based on velocity
    this.camera.targetX = this.player.x - this.viewportWidth * 0.35 + this.playerVelocity.x * 15;
    this.camera.targetY = this.player.y - this.viewportHeight * 0.5 + this.playerVelocity.y * 10;
    
    // Smooth camera movement
    this.camera.x += (this.camera.targetX - this.camera.x) * 0.08;
    this.camera.y += (this.camera.targetY - this.camera.y) * 0.08;
    
    // Constrain camera to level bounds
    this.camera.x = Math.max(0, Math.min(this.levelWidth - this.viewportWidth, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.levelHeight - this.viewportHeight, this.camera.y));
  }

  updateProjectiles(deltaTime) {
    const timeScale = this.activePowerups.timeslow.active ? 0.5 : 1;
    
    // Player projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      
      // Homing missile logic
      if (p.isHoming) {
        const target = this.findNearestTarget(p);
        if (target) {
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const targetAngle = Math.atan2(dy, dx);
          const currentAngle = Math.atan2(p.vy, p.vx);
          
          // Gradually turn toward target
          let angleDiff = targetAngle - currentAngle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          
          const turnSpeed = 0.08;
          const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnSpeed);
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          
          p.vx = Math.cos(newAngle) * speed;
          p.vy = Math.sin(newAngle) * speed;
        }
      }
      
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      
      if (p.x < 0 || p.x > this.levelWidth || p.y < 0 || p.y > this.levelHeight ||
          Date.now() - p.createdAt > 2500) {
        this.projectiles.splice(i, 1);
      }
    }
    
    // Enemy projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const p = this.enemyProjectiles[i];
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      
      if (p.x < 0 || p.x > this.levelWidth || p.y < 0 || p.y > this.levelHeight ||
          Date.now() - p.createdAt > 3000) {
        this.enemyProjectiles.splice(i, 1);
      }
    }
  }

  findNearestTarget(projectile) {
    let nearest = null;
    let nearestDist = 400; // Max homing range
    
    // Check enemies first
    for (const enemy of this.enemies) {
      const dist = Math.sqrt((projectile.x - enemy.x) ** 2 + (projectile.y - enemy.y) ** 2);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }
    
    // Check mineable asteroids if no enemy found
    if (!nearest) {
      for (const asteroid of this.asteroids) {
        if (asteroid.type !== 'mineable') continue;
        const dist = Math.sqrt((projectile.x - asteroid.x) ** 2 + (projectile.y - asteroid.y) ** 2);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = asteroid;
        }
      }
    }
    
    return nearest;
  }

  updateAsteroids(deltaTime) {
    const timeScale = this.activePowerups.timeslow.active ? 0.5 : 1;
    
    for (const asteroid of this.asteroids) {
      asteroid.rotation += asteroid.rotationSpeed * timeScale;
      
      if (asteroid.isMoving) {
        asteroid.x += asteroid.vx * timeScale;
        asteroid.y += asteroid.vy * timeScale;
        
        // Bounce off bounds
        if (asteroid.y - asteroid.radius < 0 || asteroid.y + asteroid.radius > this.levelHeight) {
          asteroid.vy *= -1;
          asteroid.y = Math.max(asteroid.radius, Math.min(this.levelHeight - asteroid.radius, asteroid.y));
        }
        if (asteroid.x - asteroid.radius < 200 || asteroid.x + asteroid.radius > this.levelWidth - 200) {
          asteroid.vx *= -1;
        }
      }
    }
  }

  updatePowerups(deltaTime) {
    for (const key in this.activePowerups) {
      const powerup = this.activePowerups[key];
      if (powerup.active) {
        powerup.remaining -= deltaTime * 1000;
        if (powerup.remaining <= 0) {
          powerup.active = false;
          powerup.remaining = 0;
        }
      }
    }
    
    // Magnet effect
    if (this.activePowerups.magnet.active) {
      const magnetRange = 180;
      for (const crystal of this.crystals) {
        if (crystal.collected) continue;
        
        const dx = this.player.x - crystal.x;
        const dy = this.player.y - crystal.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < magnetRange && dist > 0) {
          const force = (magnetRange - dist) / magnetRange * 4;
          crystal.x += (dx / dist) * force;
          crystal.y += (dy / dist) * force;
        }
      }
    }
  }

  updateEnemies(deltaTime) {
    const timeScale = this.activePowerups.timeslow.active ? 0.5 : 1;
    const now = Date.now();
    
    for (const enemy of this.enemies) {
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Update rotation to face player
      enemy.rotation = Math.atan2(dy, dx);
      
      if (dist < enemy.detectionRange) {
        // Behavior based on type
        if (enemy.type === 'drone') {
          // Drones circle around player
          const circleAngle = enemy.rotation + Math.PI / 2;
          enemy.vx = Math.cos(circleAngle) * 1.5 * timeScale;
          enemy.vy = Math.sin(circleAngle) * 1.5 * timeScale;
        } else if (enemy.type === 'hunter') {
          // Hunters chase player
          if (dist > 100) {
            enemy.vx = (dx / dist) * 2.5 * timeScale;
            enemy.vy = (dy / dist) * 2.5 * timeScale;
          } else {
            enemy.vx *= 0.9;
            enemy.vy *= 0.9;
          }
        }
        // Turrets don't move
        
        // Shooting
        if (now - enemy.lastShot > enemy.shootInterval / timeScale) {
          enemy.lastShot = now;
          const angle = Math.atan2(dy, dx);
          
          this.enemyProjectiles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * 6,
            vy: Math.sin(angle) * 6,
            radius: 5,
            color: enemy.color,
            createdAt: now
          });
        }
      } else {
        enemy.vx *= 0.95;
        enemy.vy *= 0.95;
      }
      
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
      
      // Keep in bounds
      enemy.x = Math.max(enemy.radius, Math.min(this.levelWidth - enemy.radius, enemy.x));
      enemy.y = Math.max(enemy.radius, Math.min(this.levelHeight - enemy.radius, enemy.y));
    }
  }

  checkCollisions() {
    // Projectile vs Asteroid
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      
      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        const asteroid = this.asteroids[j];
        if (!asteroid.hasCollision) continue;
        
        const dist = Math.sqrt((proj.x - asteroid.x) ** 2 + (proj.y - asteroid.y) ** 2);
        
        if (dist < proj.radius + asteroid.radius) {
          // Plasma can destroy collision asteroids
          if (proj.isPlasma || asteroid.type === 'mineable') {
            asteroid.health--;
            this.createParticles(proj.x, proj.y, asteroid.type === 'mineable' ? '#FFD700' : '#FF6B6B', 6);
            
            if (asteroid.health <= 0 || (proj.isPlasma && asteroid.type !== 'mineable')) {
              if (asteroid.type === 'mineable') {
                this.spawnCrystalsFromAsteroid(asteroid);
              }
              this.asteroids.splice(j, 1);
              this.score += asteroid.type === 'mineable' ? 20 : 15; // Reduced scores
              this.asteroidsDestroyedThisLevel++;
            }
          } else {
            this.createParticles(proj.x, proj.y, '#888', 3);
          }
          
          if (!proj.isPlasma) {
            this.projectiles.splice(i, 1);
          }
          break;
        }
      }
    }
    
    // Projectile vs Enemy
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        const dist = Math.sqrt((proj.x - enemy.x) ** 2 + (proj.y - enemy.y) ** 2);
        
        if (dist < proj.radius + enemy.radius) {
          enemy.health -= proj.isPlasma ? 30 : 15;
          this.createParticles(proj.x, proj.y, enemy.color, 5);
          
          if (enemy.health <= 0) {
            this.createParticles(enemy.x, enemy.y, enemy.color, 15);
            this.enemies.splice(j, 1);
            this.score += 50; // Reduced from 100
            this.enemiesKilledThisLevel++;
            this.specialWeaponCharge = Math.min(this.maxSpecialCharge, this.specialWeaponCharge + 15);
          }
          
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }
    
    // Player vs Asteroid
    for (const asteroid of this.asteroids) {
      if (!asteroid.hasCollision || asteroid.type === 'mineable') continue;
      
      const dist = Math.sqrt((this.player.x - asteroid.x) ** 2 + (this.player.y - asteroid.y) ** 2);
      
      if (dist < this.player.radius + asteroid.radius) {
        if (this.activePowerups.shield.active) {
          this.activePowerups.shield.active = false;
          this.activePowerups.shield.remaining = 0;
          this.createParticles(this.player.x, this.player.y, '#20B2AA', 12);
        } else {
          this.takeDamage(20);
        }
        
        // Bounce off asteroid (reduced by 50%)
        const angle = Math.atan2(this.player.y - asteroid.y, this.player.x - asteroid.x);
        this.playerVelocity.x = Math.cos(angle) * 2.5;
        this.playerVelocity.y = Math.sin(angle) * 2.5;
        this.player.x += Math.cos(angle) * 7;
        this.player.y += Math.sin(angle) * 7;
      }
    }
    
    // Player vs Enemy Projectile
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      const dist = Math.sqrt((this.player.x - proj.x) ** 2 + (this.player.y - proj.y) ** 2);
      
      if (dist < this.player.radius + proj.radius) {
        if (this.activePowerups.shield.active) {
          this.activePowerups.shield.active = false;
          this.activePowerups.shield.remaining = 0;
          this.createParticles(this.player.x, this.player.y, '#20B2AA', 10);
        } else {
          this.takeDamage(15);
        }
        this.enemyProjectiles.splice(i, 1);
      }
    }
    
    // Enemy Projectile vs Asteroid (boss/enemy bullets blocked by asteroids)
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      let destroyed = false;
      
      for (const asteroid of this.asteroids) {
        const dist = Math.sqrt((proj.x - asteroid.x) ** 2 + (proj.y - asteroid.y) ** 2);
        if (dist < proj.radius + asteroid.radius) {
          // Create small impact particles
          this.createParticles(proj.x, proj.y, proj.color, 4);
          this.enemyProjectiles.splice(i, 1);
          destroyed = true;
          break;
        }
      }
      
      if (destroyed) continue;
    }
    
    // Player vs Crystal
    for (const crystal of this.crystals) {
      if (crystal.collected) continue;
      
      const dist = Math.sqrt((this.player.x - crystal.x) ** 2 + (this.player.y - crystal.y) ** 2);
      
      if (dist < this.player.radius + crystal.radius + 5) {
        crystal.collected = true;
        this.crystalsCollected++;
        this.score += 5; // Reduced from 10
        this.specialWeaponCharge = Math.min(this.maxSpecialCharge, this.specialWeaponCharge + 3);
        this.createParticles(crystal.x, crystal.y, '#FFD700', 8);
        this.playSound('collect');
      }
    }
    
    // Player vs Powerup
    for (const powerup of this.powerups) {
      if (powerup.collected) continue;
      
      const dist = Math.sqrt((this.player.x - powerup.x) ** 2 + (this.player.y - powerup.y) ** 2);
      
      if (dist < this.player.radius + powerup.radius + 3) {
        powerup.collected = true;
        this.activatePowerup(powerup.type);
        this.createParticles(powerup.x, powerup.y, this.getPowerupColor(powerup.type), 12);
        this.playSound('collect');
      }
    }
    
    // Projectile vs Boss
    if (this.boss && !this.bossDefeated) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const proj = this.projectiles[i];
        const dist = Math.sqrt((proj.x - this.boss.x) ** 2 + (proj.y - this.boss.y) ** 2);
        
        if (dist < proj.radius + this.boss.radius) {
          this.boss.health -= proj.isPlasma ? 25 : 10;
          this.createParticles(proj.x, proj.y, this.boss.color, 8);
          
          if (this.boss.health <= 0) {
            this.defeatBoss();
          }
          
          this.projectiles.splice(i, 1);
        }
      }
      
      // Player vs Boss collision
      const bossDist = Math.sqrt((this.player.x - this.boss.x) ** 2 + (this.player.y - this.boss.y) ** 2);
      if (bossDist < this.player.radius + this.boss.radius) {
        if (this.activePowerups.shield.active) {
          this.activePowerups.shield.active = false;
          this.activePowerups.shield.remaining = 0;
          this.createParticles(this.player.x, this.player.y, '#20B2AA', 12);
        } else {
          this.takeDamage(30);
        }
        
        // Push player away
        const angle = Math.atan2(this.player.y - this.boss.y, this.player.x - this.boss.x);
        this.playerVelocity.x = Math.cos(angle) * 4;
        this.playerVelocity.y = Math.sin(angle) * 4;
        this.player.x += Math.cos(angle) * 20;
        this.player.y += Math.sin(angle) * 20;
      }
    }
  }

  defeatBoss() {
    this.bossDefeated = true;
    this.score += 500; // Big bonus for defeating boss
    
    // Epic explosion
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      this.particles.push({
        x: this.boss.x, y: this.boss.y,
        vx: Math.cos(angle) * (5 + Math.random() * 8),
        vy: Math.sin(angle) * (5 + Math.random() * 8),
        radius: 4 + Math.random() * 6,
        color: this.boss.color,
        alpha: 1,
        decay: 0.01 + Math.random() * 0.02
      });
    }
    
    // Spawn bonus crystals
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      this.crystals.push({
        x: this.boss.x + Math.cos(angle) * 50,
        y: this.boss.y + Math.sin(angle) * 50,
        radius: 12,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      });
    }
    
    this.playSound('special');
  }

  activatePowerup(type) {
    const durations = {
      shield: 6000,
      speed: 5000,
      rapid: 7000,
      magnet: 10000,
      timeslow: 4000,
      plasma: 8000,
      homing: 10000,
      timeextend: 0
    };
    
    this.powerupsCollectedThisLevel++;
    
    if (type === 'timeextend') {
      // Add time to the clock
      this.timeLimit += 20;
      this.score += 25; // Reduced from 50
    } else {
      this.activePowerups[type].active = true;
      this.activePowerups[type].remaining = durations[type];
      this.score += 15; // Reduced from 30
    }
    
    // Create enhanced powerup collection effect
    this.createPowerupEffect(this.player.x, this.player.y, this.getPowerupColor(type));
  }

  createPowerupEffect(x, y, color) {
    // Screen flash effect (handled via state update)
    this.powerupFlashTime = Date.now();
    this.powerupFlashColor = color;
    
    // Large expanding ring particles
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 6,
        radius: 4,
        color,
        alpha: 1,
        decay: 0.02,
        isRing: true
      });
    }
    
    // Burst of smaller particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 0.025 + Math.random() * 0.02
      });
    }
  }

  getPowerupColor(type) {
    const colors = {
      shield: '#20B2AA',
      speed: '#FFD700',
      rapid: '#FF8C00',
      magnet: '#9B59B6',
      timeslow: '#FFFFFF',
      plasma: '#FF4444',
      homing: '#FF6B6B',
      timeextend: '#00FF88'
    };
    return colors[type] || '#FFFFFF';
  }

  takeDamage(amount) {
    this.health -= amount;
    this.damageTaken = true;
    this.createParticles(this.player.x, this.player.y, '#FF6B6B', 18);
    this.playSound('damage');
    
    if (this.health <= 0) {
      this.health = 0;
      this.gameOver();
    }
  }

  gameOver() {
    if (this.options.onGameOver) {
      this.options.onGameOver();
    }
  }

  spawnCrystalsFromAsteroid(asteroid) {
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = asteroid.radius * 0.5;
      this.crystals.push({
        x: asteroid.x + Math.cos(angle) * dist,
        y: asteroid.y + Math.sin(angle) * dist,
        radius: 10,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      });
    }
  }

  createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 4,
        color,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02
      });
    }
  }

  checkLevelCompletion() {
    if (!this.finishZone) return;
    
    // Can't complete if objectives not met
    if (!this.objectivesComplete) return;
    
    const fz = this.finishZone;
    const inZone = this.player.x > fz.x && this.player.x < fz.x + fz.w &&
                   this.player.y > fz.y - fz.h/2 && this.player.y < fz.y + fz.h/2;
    
    if (inZone) {
      this.levelComplete();
    }
  }

  levelComplete() {
    // Guard to prevent multiple completions per level
    if (this.levelCompleted) return;
    this.levelCompleted = true;
    
    const config = this.getLevelConfig(this.level);
    
    // Reduced scoring values
    const levelScore = 200; // Reduced from 500
    const crystalBonus = this.crystalsCollected * 5; // Reduced from 10
    const timeRemaining = Math.max(0, this.timeLimit - this.timeElapsed);
    const timeBonus = timeRemaining > 30 ? 100 : 0; // Reduced from 200
    const noDamageBonus = !this.damageTaken ? 150 : 0; // Reduced from 300
    const totalScore = levelScore + crystalBonus + timeBonus + noDamageBonus;
    
    this.score += levelScore + timeBonus + noDamageBonus;
    
    if (this.options.onLevelComplete) {
      this.options.onLevelComplete({
        level: this.level,
        levelScore,
        crystalBonus,
        timeBonus,
        noDamageBonus,
        totalScore,
        time: this.timeElapsed,
        crystals: this.crystalsCollected,
        asteroidsDestroyed: this.asteroidsDestroyedThisLevel,
        powerupsCollected: this.powerupsCollectedThisLevel,
        enemiesKilled: this.enemiesKilledThisLevel
      });
    }
  }

  nextLevel() {
    this.level++;
    this.initializeLevel(this.level);
  }

  restartLevel() {
    this.health = this.maxHealth;
    this.initializeLevel(this.level);
  }

  updateState() {
    const progress = (this.player.x / this.levelWidth) * 100;
    const config = this.getLevelConfig(this.level);
    const timeRemaining = Math.max(0, this.timeLimit - this.timeElapsed);
    
    const activePowerupsList = [];
    for (const [type, state] of Object.entries(this.activePowerups)) {
      if (state.active) {
        const maxDuration = { shield: 6000, speed: 5000, rapid: 7000, magnet: 10000, timeslow: 4000, plasma: 8000, homing: 10000 }[type];
        activePowerupsList.push({
          type,
          name: type.charAt(0).toUpperCase() + type.slice(1),
          remaining: (state.remaining / maxDuration) * 100
        });
      }
    }
    
    if (this.options.onStateUpdate) {
      // Build objectives list
      let primaryObjective, secondaryObjective;
      if (this.isBossLevel) {
        primaryObjective = this.bossDefeated ? 'Defeat the boss [COMPLETE]' : 'Defeat the boss';
        secondaryObjective = 'Reach the finish zone';
      } else {
        primaryObjective = this.objectivesComplete ? 
          `Collect ${this.requiredCrystals} crystals [COMPLETE]` : 
          `Collect ${this.requiredCrystals} crystals (${this.crystalsCollected}/${this.requiredCrystals})`;
        secondaryObjective = 'Reach the finish zone';
      }
      
      this.options.onStateUpdate({
        level: this.level,
        score: this.score,
        crystals: this.crystalsCollected,
        health: this.health,
        progress,
        timeElapsed: this.timeElapsed,
        timeRemaining,
        timeLimit: this.timeLimit,
        parTime: this.timeLimit - 30,
        activePowerups: activePowerupsList,
        specialCharge: (this.specialWeaponCharge / this.maxSpecialCharge) * 100,
        inSafeZone: this.inSafeZone,
        isBossLevel: this.isBossLevel,
        bossHealth: this.boss ? (this.boss.health / this.boss.maxHealth) * 100 : 0,
        bossDefeated: this.bossDefeated,
        objectivesComplete: this.objectivesComplete,
        objectives: {
          primary: primaryObjective,
          secondary: secondaryObjective,
          bonus: `Finish with 30+ seconds remaining`
        }
      });
    }
  }

  render() {
    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(-this.camera.x, -this.camera.y);
    
    this.renderBackground(ctx);
    this.renderSpaceStations(ctx);
    this.renderFinishZone(ctx);
    this.renderGrid(ctx);
    
    // Background asteroids
    for (const asteroid of this.asteroids) {
      if (!asteroid.hasCollision) this.renderAsteroid(ctx, asteroid);
    }
    
    // Crystals
    for (const crystal of this.crystals) {
      if (!crystal.collected) this.renderCrystal(ctx, crystal);
    }
    
    // Powerups
    for (const powerup of this.powerups) {
      if (!powerup.collected) this.renderPowerup(ctx, powerup);
    }
    
    // Projectiles
    for (const proj of this.projectiles) this.renderProjectile(ctx, proj);
    for (const proj of this.enemyProjectiles) this.renderProjectile(ctx, proj);
    
    // Enemies
    for (const enemy of this.enemies) this.renderEnemy(ctx, enemy);
    
    // Boss
    if (this.boss && !this.bossDefeated) {
      this.renderBoss(ctx, this.boss);
    }
    
    // Player
    if (this.player) {
      this.player.draw(ctx);
      
      if (this.activePowerups.shield.active) {
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.radius + 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(32, 178, 170, 0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
    
    // Foreground asteroids
    for (const asteroid of this.asteroids) {
      if (asteroid.hasCollision) this.renderAsteroid(ctx, asteroid);
    }
    
    this.renderParticles(ctx);
    
    ctx.restore();
    
    // Render minimap
    this.renderMinimap(ctx, dpr);
    
    // Render boss warning overlay
    if (this.showBossWarning && this.isBossLevel) {
      this.renderBossWarning(ctx, dpr);
    }
  }

  renderBossWarning(ctx, dpr) {
    const elapsed = Date.now() - this.bossWarningTime;
    if (elapsed > 3000) {
      this.showBossWarning = false;
      return;
    }
    
    const alpha = elapsed < 2500 ? 1 : 1 - (elapsed - 2500) / 500;
    
    ctx.save();
    ctx.scale(dpr, dpr);
    
    // Red vignette
    const gradient = ctx.createRadialGradient(
      this.viewportWidth / 2, this.viewportHeight / 2, 0,
      this.viewportWidth / 2, this.viewportHeight / 2, this.viewportWidth * 0.7
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, `rgba(255, 0, 0, ${0.3 * alpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
    
    // Warning text
    ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Pulsing effect
    const pulse = 1 + Math.sin(elapsed / 100) * 0.1;
    ctx.save();
    ctx.translate(this.viewportWidth / 2, this.viewportHeight / 2 - 30);
    ctx.scale(pulse, pulse);
    ctx.fillText('BOSS LEVEL', 0, 0);
    ctx.restore();
    
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
    ctx.fillText('DEFEAT THE BOSS TO PROCEED', this.viewportWidth / 2, this.viewportHeight / 2 + 30);
    
    ctx.restore();
  }

  renderBackground(ctx) {
    ctx.fillStyle = '#080a0e';
    ctx.fillRect(0, 0, this.levelWidth, this.levelHeight);
    
    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 200; i++) {
      const x = (i * 73 + i * i * 13) % this.levelWidth;
      const y = (i * 47 + i * i * 7) % this.levelHeight;
      const size = (i % 3 === 0) ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Nebula effect
    const gradient = ctx.createRadialGradient(
      this.levelWidth * 0.7, this.levelHeight * 0.3, 0,
      this.levelWidth * 0.7, this.levelHeight * 0.3, 400
    );
    gradient.addColorStop(0, 'rgba(32, 178, 170, 0.05)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.levelWidth, this.levelHeight);
  }

  renderSpaceStations(ctx) {
    for (const station of this.spaceStations) {
      ctx.save();
      ctx.translate(station.x, station.y);
      
      // Safe zone glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, station.radius);
      gradient.addColorStop(0, 'rgba(32, 178, 170, 0.15)');
      gradient.addColorStop(0.7, 'rgba(32, 178, 170, 0.05)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, station.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Station structure
      ctx.strokeStyle = '#20B2AA';
      ctx.lineWidth = 2;
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner ring
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.stroke();
      
      // Cross beams
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + station.rotation;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 25, Math.sin(angle) * 25);
        ctx.lineTo(Math.cos(angle) * 45, Math.sin(angle) * 45);
        ctx.stroke();
      }
      
      // Center
      ctx.fillStyle = '#20B2AA';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SAFE ZONE', 0, station.radius + 15);
      
      ctx.restore();
      
      station.rotation += 0.003;
    }
  }

  renderFinishZone(ctx) {
    if (!this.finishZone) return;
    
    const fz = this.finishZone;
    const isLocked = !this.objectivesComplete;
    
    // Color based on locked/unlocked
    const mainColor = isLocked ? '#888888' : '#FFD700';
    const glowColor = isLocked ? 'rgba(100, 100, 100, 0.3)' : 'rgba(255, 215, 0, 0.3)';
    
    ctx.save();
    
    if (fz.type === 'portal') {
      // Portal style finish
      ctx.translate(fz.x + fz.w/2, fz.y);
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, fz.w/2);
      gradient.addColorStop(0, isLocked ? 'rgba(100, 100, 100, 0.4)' : 'rgba(255, 215, 0, 0.4)');
      gradient.addColorStop(0.5, isLocked ? 'rgba(80, 80, 80, 0.2)' : 'rgba(255, 140, 0, 0.2)');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, fz.w/2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, fz.w/2 - 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = mainColor;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isLocked ? 'LOCKED' : 'EXIT', 0, 5);
    } else {
      // Standard finish zone
      const gradient = ctx.createLinearGradient(fz.x, 0, fz.x + fz.w, 0);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, glowColor);
      gradient.addColorStop(1, isLocked ? 'rgba(100, 100, 100, 0.4)' : 'rgba(255, 215, 0, 0.4)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(fz.x, fz.y - fz.h/2, fz.w, fz.h);
      
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 12]);
      ctx.strokeRect(fz.x, fz.y - fz.h/2, fz.w, fz.h);
      ctx.setLineDash([]);
      
      ctx.fillStyle = mainColor;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isLocked ? 'LOCKED' : 'FINISH', fz.x + fz.w/2, fz.y + 6);
    }
    
    ctx.restore();
  }

  renderGrid(ctx) {
    ctx.strokeStyle = 'rgba(32, 178, 170, 0.04)';
    ctx.lineWidth = 1;
    
    const gridSize = 120;
    for (let x = 0; x <= this.levelWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.levelHeight);
      ctx.stroke();
    }
    
    for (let y = 0; y <= this.levelHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.levelWidth, y);
      ctx.stroke();
    }
  }

  renderAsteroid(ctx, asteroid) {
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);
    
    let fillColor, strokeColor;
    switch (asteroid.type) {
      case 'mineable':
        fillColor = 'rgba(255, 200, 50, 0.35)';
        strokeColor = 'rgba(255, 215, 0, 0.9)';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 18;
        break;
      case 'collision':
        fillColor = 'rgba(70, 50, 45, 0.85)';
        strokeColor = 'rgba(255, 100, 100, 0.7)';
        ctx.shadowColor = 'rgba(255, 100, 100, 0.4)';
        ctx.shadowBlur = 12;
        break;
      default:
        // Static asteroids are more faded (background decoration)
        fillColor = 'rgba(35, 35, 45, 0.3)';
        strokeColor = 'rgba(80, 80, 100, 0.2)';
    }
    
    ctx.beginPath();
    ctx.moveTo(asteroid.vertices[0].x, asteroid.vertices[0].y);
    for (let i = 1; i < asteroid.vertices.length; i++) {
      ctx.lineTo(asteroid.vertices[i].x, asteroid.vertices[i].y);
    }
    ctx.closePath();
    
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = asteroid.type === 'mineable' ? 2.5 : 1.5;
    ctx.stroke();
    
    if (asteroid.type === 'mineable' && asteroid.health < 3) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(asteroid.health.toString(), 0, 5);
    }
    
    ctx.restore();
  }

  renderCrystal(ctx, crystal) {
    const bob = Math.sin(Date.now() / 280 + crystal.bobOffset) * 4;
    
    ctx.save();
    ctx.translate(crystal.x, crystal.y + bob);
    
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 12;
    
    ctx.beginPath();
    ctx.moveTo(0, -crystal.radius);
    ctx.lineTo(crystal.radius * 0.7, 0);
    ctx.lineTo(0, crystal.radius);
    ctx.lineTo(-crystal.radius * 0.7, 0);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, -crystal.radius, 0, crystal.radius);
    gradient.addColorStop(0, '#FFFACD');
    gradient.addColorStop(0.5, '#FFD700');
    gradient.addColorStop(1, '#DAA520');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#FFF8DC';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.restore();
  }

  renderPowerup(ctx, powerup) {
    const bob = Math.sin(Date.now() / 350 + powerup.bobOffset) * 5;
    const color = this.getPowerupColor(powerup.type);
    const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
    
    ctx.save();
    ctx.translate(powerup.x, powerup.y + bob);
    ctx.scale(pulse, pulse);
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    
    ctx.beginPath();
    ctx.arc(0, 0, powerup.radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(0, 0, powerup.radius - 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = color;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const icons = { 
      shield: 'S', speed: 'F', rapid: 'R', magnet: 'M', 
      timeslow: 'T', plasma: 'P', homing: 'H', timeextend: '+' 
    };
    ctx.fillText(icons[powerup.type] || '?', 0, 0);
    
    ctx.restore();
  }

  renderBoss(ctx, boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);
    ctx.rotate(boss.rotation);
    
    // Glow effect
    ctx.shadowColor = boss.color;
    ctx.shadowBlur = 30;
    
    // Draw boss based on type
    ctx.fillStyle = boss.color;
    ctx.globalAlpha = 0.9;
    
    switch (boss.type) {
      case 'guardian':
        // Shield-like hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const r = boss.radius;
          if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        break;
        
      case 'swarm':
        // Organic-looking blob
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const wobble = Math.sin(Date.now() / 200 + i) * 5;
          const r = boss.radius + wobble;
          if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'laser':
        // Angular destroyer shape
        ctx.beginPath();
        ctx.moveTo(boss.radius + 20, 0);
        ctx.lineTo(-boss.radius, -boss.radius * 0.6);
        ctx.lineTo(-boss.radius * 0.5, 0);
        ctx.lineTo(-boss.radius, boss.radius * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Charging indicator
        if (boss.isCharging) {
          const chargeProgress = (Date.now() - boss.chargeTimer) / 1500;
          ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + chargeProgress * 0.5})`;
          ctx.beginPath();
          ctx.arc(boss.radius, 0, 15 + chargeProgress * 10, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'titan':
        // Massive circular fortress
        ctx.beginPath();
        ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner rings
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, boss.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, boss.radius * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
    
    ctx.globalAlpha = 1;
    ctx.restore();
    
    // Health bar (always horizontal, above boss)
    const healthPct = boss.health / boss.maxHealth;
    const barWidth = 100;
    const barHeight = 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(boss.x - barWidth/2 - 2, boss.y - boss.radius - 30, barWidth + 4, barHeight + 4);
    
    ctx.fillStyle = '#333';
    ctx.fillRect(boss.x - barWidth/2, boss.y - boss.radius - 28, barWidth, barHeight);
    
    const healthColor = healthPct > 0.5 ? '#4CAF50' : (healthPct > 0.25 ? '#FFA500' : '#FF4444');
    ctx.fillStyle = healthColor;
    ctx.fillRect(boss.x - barWidth/2, boss.y - boss.radius - 28, barWidth * healthPct, barHeight);
    
    // Boss name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    const bossNames = {
      guardian: 'SHIELD GUARDIAN',
      swarm: 'SWARM MOTHER',
      laser: 'LASER DESTROYER',
      titan: 'TITAN FORTRESS'
    };
    ctx.fillText(bossNames[boss.type] || 'BOSS', boss.x, boss.y - boss.radius - 40);
  }

  renderEnemy(ctx, enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.rotation);
    
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 15;
    
    // Body
    ctx.fillStyle = enemy.color;
    ctx.globalAlpha = 0.8;
    
    if (enemy.type === 'turret') {
      // Turret - hexagon base
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const r = enemy.radius;
        if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      
      // Gun barrel
      ctx.fillRect(0, -4, enemy.radius + 8, 8);
    } else if (enemy.type === 'hunter') {
      // Hunter - arrow shape
      ctx.beginPath();
      ctx.moveTo(enemy.radius + 5, 0);
      ctx.lineTo(-enemy.radius, -enemy.radius * 0.7);
      ctx.lineTo(-enemy.radius * 0.5, 0);
      ctx.lineTo(-enemy.radius, enemy.radius * 0.7);
      ctx.closePath();
      ctx.fill();
    } else {
      // Drone - circle
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
    
    // Health bar
    if (enemy.health < (enemy.type === 'hunter' ? 60 : (enemy.type === 'turret' ? 40 : 25))) {
      const maxHealth = enemy.type === 'hunter' ? 60 : (enemy.type === 'turret' ? 40 : 25);
      const healthPct = enemy.health / maxHealth;
      
      ctx.rotate(-enemy.rotation); // Unrotate for health bar
      ctx.fillStyle = '#333';
      ctx.fillRect(-15, -enemy.radius - 12, 30, 5);
      ctx.fillStyle = healthPct > 0.3 ? '#4CAF50' : '#F44336';
      ctx.fillRect(-15, -enemy.radius - 12, 30 * healthPct, 5);
    }
    
    ctx.restore();
  }

  renderProjectile(ctx, proj) {
    ctx.save();
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = proj.radius * 3;
    
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
    ctx.fillStyle = proj.color;
    ctx.fill();
    
    if (proj.isPlasma) {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = proj.color;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  renderParticles(ctx) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= p.decay;
      
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }
  }

  renderMinimap(ctx, dpr) {
    const mapW = 160;
    const mapH = 100;
    const mapX = this.viewportWidth - mapW - 15;
    const mapY = this.viewportHeight - mapH - 15;
    
    ctx.save();
    ctx.scale(dpr, dpr);
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.strokeStyle = 'rgba(32, 178, 170, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX, mapY, mapW, mapH);
    
    const scaleX = mapW / this.levelWidth;
    const scaleY = mapH / this.levelHeight;
    
    // Finish zone
    if (this.finishZone) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
      const fz = this.finishZone;
      ctx.fillRect(
        mapX + fz.x * scaleX,
        mapY + (fz.y - fz.h/2) * scaleY,
        fz.w * scaleX,
        fz.h * scaleY
      );
    }
    
    // Space stations
    ctx.fillStyle = 'rgba(32, 178, 170, 0.6)';
    for (const station of this.spaceStations) {
      ctx.beginPath();
      ctx.arc(mapX + station.x * scaleX, mapY + station.y * scaleY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Enemies
    ctx.fillStyle = '#FF4444';
    for (const enemy of this.enemies) {
      ctx.fillRect(mapX + enemy.x * scaleX - 1.5, mapY + enemy.y * scaleY - 1.5, 3, 3);
    }
    
    // Player
    ctx.fillStyle = '#20B2AA';
    ctx.beginPath();
    ctx.arc(mapX + this.player.x * scaleX, mapY + this.player.y * scaleY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Viewport indicator
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.strokeRect(
      mapX + this.camera.x * scaleX,
      mapY + this.camera.y * scaleY,
      this.viewportWidth * scaleX,
      this.viewportHeight * scaleY
    );
    
    ctx.restore();
  }
}

window.SinglePlayerEngine = SinglePlayerEngine;
