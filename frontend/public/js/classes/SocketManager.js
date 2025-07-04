// Socket event handler class
class SocketManager {
  constructor(gameState, uiManager, inputManager = null) {
    this.gameState = gameState;
    this.uiManager = uiManager;
    this.inputManager = inputManager;
    this.socket = null;
  }

  setInputManager(inputManager) {
    this.inputManager = inputManager;
  }

  initialize(socketUrl) {
    this.socket = io(socketUrl);
    this.gameState.setSocket(this.socket);
    this.setupEventHandlers();
    return this.socket;
  }

  setupEventHandlers() {
    this.socket.on('updatePlayers', (backendPlayers) => {
      this.handlePlayersUpdate(backendPlayers);
    });

    this.socket.on('updateProjectiles', (backendProjectiles) => {
      this.handleProjectilesUpdate(backendProjectiles);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      alert('Game error: ' + error.message);
    });

    this.socket.on('gameJoined', (data) => {
      console.log('Successfully joined game:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect', () => {
      console.log('Connected to server with ID:', this.socket.id);
      this.gameState.socketId = this.socket.id;
    });
  }

  handlePlayersUpdate(backendPlayers) {
    console.log('Received updatePlayers:', backendPlayers);
    
    // Add/update players
    for (const id in backendPlayers) {
      const backendPlayer = backendPlayers[id];
      
      if (this.gameState.addPlayer(id, backendPlayer)) {
        // New player - add to UI
        this.uiManager.addPlayerLabel(id, backendPlayer);
      } else {
        // Existing player - update
        this.gameState.updatePlayer(id, backendPlayer);
        this.uiManager.updatePlayerLabel(id, backendPlayer);
        
        // Handle client prediction for current player
        if (this.inputManager && this.gameState.isCurrentPlayer(id)) {
          this.inputManager.handlePlayerPrediction(id, backendPlayer);
        }
      }
    }

    // Remove players that no longer exist
    for (const id in this.gameState.players) {
      if (!backendPlayers[id]) {
        this.gameState.removePlayer(id);
        this.uiManager.removePlayerLabel(id);
      }
    }

    // Update UI order
    this.uiManager.sortPlayerLabels();
  }

  handleProjectilesUpdate(backendProjectiles) {
    console.log('Received projectiles update:', Object.keys(backendProjectiles).length, 'projectiles');
    
    // Add/update projectiles
    for (const id in backendProjectiles) {
      const backendProjectile = backendProjectiles[id];
      if (!this.gameState.addProjectile(id, backendProjectile)) {
        this.gameState.updateProjectile(id, backendProjectile);
      }
    }
    
    // Remove projectiles that no longer exist
    for (const id in this.gameState.projectiles) {
      if (!backendProjectiles[id]) {
        this.gameState.removeProjectile(id);
      }
    }
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }

  async initializeGame(userData, gameParams) {
    this.emit('initGame', {
      username: userData.username,
      width: this.gameState.canvas.width,
      height: this.gameState.canvas.height,
      gameId: gameParams.gameId,
      create: gameParams.createGame,
      gameName: gameParams.gameName
    });
  }
}

window.SocketManager = SocketManager;
