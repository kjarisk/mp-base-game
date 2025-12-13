// Input handling and player movement
class InputManager {
  constructor(gameState, socketManager) {
    this.gameState = gameState;
    this.socketManager = socketManager;
    this.keys = {
      w: { pressed: false },
      a: { pressed: false },
      s: { pressed: false },
      d: { pressed: false }
    };
    this.playerSpeed = 5;
    this.playerInputs = [];
    this.sequenceNumber = 0;
    this.inputInterval = null;
    this.lastShootTime = 0;
    this.shootCooldown = 100; // 100ms cooldown between shots
    
    // Store bound functions for cleanup
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundClick = this.handleClick.bind(this);
  }

  initialize() {
    this.setupKeyboardListeners();
    this.loadGameConfig();
  }

  setupKeyboardListeners() {
    // Remove existing listeners first to prevent duplicates
    this.removeKeyboardListeners();
    
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('click', this.boundClick);
    
    console.log('🎮 Input listeners set up');
  }

  removeKeyboardListeners() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('click', this.boundClick);
  }

  handleKeyDown(e) {
    if (!this.gameState.getCurrentPlayer()) {
      console.log('❌ No current player found for key down:', e.code);
      return;
    }
    
    console.log('⌨️ Key down:', e.code);
    
    switch (e.code) {
      case 'KeyW':
        this.keys.w.pressed = true;
        break;
      case 'KeyA':
        this.keys.a.pressed = true;
        break;
      case 'KeyS':
        this.keys.s.pressed = true;
        break;
      case 'KeyD':
        this.keys.d.pressed = true;
        break;
    }
  }

  handleKeyUp(e) {
    if (!this.gameState.getCurrentPlayer()) {
      console.log('❌ No current player found for key up:', e.code);
      return;
    }
    
    console.log('⌨️ Key up:', e.code);
    
    switch (e.code) {
      case 'KeyW':
        this.keys.w.pressed = false;
        break;
      case 'KeyA':
        this.keys.a.pressed = false;
        break;
      case 'KeyS':
        this.keys.s.pressed = false;
        break;
      case 'KeyD':
        this.keys.d.pressed = false;
        break;
    }
  }

  handleMouseMove(e) {
    const canvas = this.gameState.canvas;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    window.mouseX = e.clientX - rect.left;
    window.mouseY = e.clientY - rect.top;
  }

  handleClick(e) {
    if (!this.gameState.getCurrentPlayer()) return;
    
    // Prevent rapid-fire shooting with global guard
    const now = Date.now();
    if (now - this.lastShootTime < this.shootCooldown) {
      return;
    }
    
    // Global shooting guard to prevent multiple instances from shooting
    if (window.lastGlobalShoot && now - window.lastGlobalShoot < 200) {
      return;
    }
    
    this.lastShootTime = now;
    window.lastGlobalShoot = now;
    
    const canvas = this.gameState.canvas;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates
    const worldPos = this.gameState.screenToWorld(screenX, screenY);
    
    const player = this.gameState.getCurrentPlayer();
    if (player) {
      // Calculate projectile direction using world coordinates
      const angle = Math.atan2(worldPos.y - player.y, worldPos.x - player.x);
      const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
      };
      
      this.socketManager.emit('shoot', {
        x: player.x,
        y: player.y,
        velocity: velocity,
        angle: angle
      });
    }
  }

  startInputLoop() {
    this.inputInterval = setInterval(() => {
      if (!this.gameState.getCurrentPlayer()) return;

      const player = this.gameState.getCurrentPlayer();
      
      // Send individual key presses to match backend expectations
      if (this.keys.w.pressed) {
        this.sendMovement('KeyW');
      }
      if (this.keys.a.pressed) {
        this.sendMovement('KeyA');
      }
      if (this.keys.s.pressed) {
        this.sendMovement('KeyS');
      }
      if (this.keys.d.pressed) {
        this.sendMovement('KeyD');
      }
    }, 1000 / 60);
  }

  sendMovement(keycode) {
    this.sequenceNumber++;
    
    this.playerInputs.push({
      sequenceNumber: this.sequenceNumber,
      keycode
    });
    
    this.socketManager.emit('keydown', {
      keycode,
      sequenceNumber: this.sequenceNumber
    });
  }

  async loadGameConfig() {
    try {
      const response = await fetch('/api/game/config');
      const config = await response.json();
      
      this.gameState.setConfig(config);
      this.playerSpeed = config.playerSpeed || this.playerSpeed;
      this.startInputLoop();
    } catch (error) {
      console.error('Failed to load game config:', error);
      this.startInputLoop(); // Start with defaults
    }
  }

  handlePlayerPrediction(playerId, playerData) {
    if (this.gameState.isCurrentPlayer(playerId)) {
      const lastBackendInputIndex = this.playerInputs.findIndex((input) => {
        return playerData.sequenceNumber === input.sequenceNumber;
      });
      
      if (lastBackendInputIndex > -1) {
        this.playerInputs.splice(0, lastBackendInputIndex + 1);
        
        const currentPlayer = this.gameState.players[playerId];
        if (currentPlayer && currentPlayer.target) {
          this.playerInputs.forEach((input) => {
            currentPlayer.target.x += input.dx;
            currentPlayer.target.y += input.dy;
          });
        }
      }
    }
  }

  cleanup() {
    console.log('🧹 Cleaning up InputManager');
    
    // Remove event listeners
    this.removeKeyboardListeners();
    
    // Clear input interval
    if (this.inputInterval) {
      clearInterval(this.inputInterval);
      this.inputInterval = null;
    }
    
    // Reset keys
    this.keys = {
      w: { pressed: false },
      a: { pressed: false },
      s: { pressed: false },
      d: { pressed: false }
    };
    
    // Clear player inputs
    this.playerInputs = [];
    this.sequenceNumber = 0;
    this.lastShootTime = 0;
  }

  destroy() {
    this.cleanup();
  }
}

window.InputManager = InputManager;
