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
  }

  initialize() {
    this.setupKeyboardListeners();
    this.loadGameConfig();
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.gameState.getCurrentPlayer()) return;
      
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
    });

    window.addEventListener('keyup', (e) => {
      if (!this.gameState.getCurrentPlayer()) return;
      
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
    });
  }

  startInputLoop() {
    this.inputInterval = setInterval(() => {
      const currentPlayer = this.gameState.getCurrentPlayer();
      if (!currentPlayer) return;

      if (this.keys.w.pressed) {
        this.sendMovement('KeyW', 0, -this.playerSpeed);
      }
      if (this.keys.a.pressed) {
        this.sendMovement('KeyA', -this.playerSpeed, 0);
      }
      if (this.keys.s.pressed) {
        this.sendMovement('KeyS', 0, this.playerSpeed);
      }
      if (this.keys.d.pressed) {
        this.sendMovement('KeyD', this.playerSpeed, 0);
      }
    }, 15);
  }

  sendMovement(keycode, dx, dy) {
    this.sequenceNumber++;
    this.playerInputs.push({ sequenceNumber: this.sequenceNumber, dx, dy });
    
    const currentPlayer = this.gameState.getCurrentPlayer();
    currentPlayer.x += dx;
    currentPlayer.y += dy;
    
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
        this.playerInputs.forEach((input) => {
          currentPlayer.target.x += input.dx;
          currentPlayer.target.y += input.dy;
        });
      }
    }
  }

  destroy() {
    if (this.inputInterval) {
      clearInterval(this.inputInterval);
    }
  }
}

window.InputManager = InputManager;
