// Socket event handler class
class SocketManager {
  constructor(gameState, uiManager, inputManager = null) {
    this.gameState = gameState;
    this.uiManager = uiManager;
    this.inputManager = inputManager;
    this.socket = null;
    this.gameInitialized = false; // Track if game has been initialized via socket
  }

  setInputManager(inputManager) {
    this.inputManager = inputManager;
  }

  initialize(socketUrl) {
    // Prevent multiple socket connections
    if (this.socket && this.socket.connected) {
      console.log('🔌 Socket already connected, disconnecting old connection');
      this.socket.disconnect();
    }
    
    // Check for global socket to prevent multiple instances
    if (window.activeSocket && window.activeSocket.connected) {
      console.log('🔌 Another socket already active globally, disconnecting it');
      window.activeSocket.disconnect();
    }
    
    console.log('🔌 Initializing new socket connection to:', socketUrl);
    this.socket = io(socketUrl);
    this.gameInitialized = false; // Reset on new socket connection
    window.activeSocket = this.socket; // Store globally to track active socket
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

    this.socket.on('updateAsteroids', (asteroids) => {
      this.handleAsteroidsUpdate(asteroids);
    });

    this.socket.on('disconnect', (reason) => {
      console.error('🔌 Disconnected from server:', reason);
      this.gameState.players = {}; // Clear players on disconnect
      if (reason === 'transport close' || reason === 'ping timeout') {
        console.error('🔌 Connection lost - attempting to reconnect...');
        // Don't auto-reconnect, let the user refresh manually
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
    });

    this.socket.on('reconnect', () => {
      console.log('🔌 Reconnected to server - need to rejoin game');
      // Re-initialize game after reconnection
      if (window.gameParams) {
        setTimeout(() => {
          this.initializeGame(
            { username: window.gameParams.username || 'Guest' },
            window.gameParams
          );
        }, 1000);
      }
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔌 Reconnection error:', error);
    });

    this.socket.on('connect', () => {
      console.log('Connected to server with ID:', this.socket.id);
      this.gameState.socketId = this.socket.id;
      this.gameState.setSocket(this.socket); // Ensure socket is set properly
    });
  }

  handlePlayersUpdate(backendPlayers) {
    // Validate backendPlayers is a valid object
    if (!backendPlayers || typeof backendPlayers !== 'object') {
      console.warn('Invalid backendPlayers data received:', backendPlayers);
      return;
    }
    
    const backendPlayerIds = Object.keys(backendPlayers);
    console.log('Received updatePlayers:', backendPlayerIds.length, 'players');
    
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

    // Remove players that no longer exist - but only if we have valid data
    // and the current player is still in the list (prevents race condition)
    const currentPlayerId = this.gameState.socketId;
    const currentPlayerInBackend = backendPlayers[currentPlayerId];
    
    // Only remove players if the update includes our own player (valid state)
    // This prevents removing players during partial/stale updates
    if (currentPlayerInBackend || backendPlayerIds.length === 0) {
      for (const id in this.gameState.players) {
        if (!backendPlayers[id]) {
          // Double-check this isn't the current player before removing
          if (id !== currentPlayerId) {
            this.gameState.removePlayer(id);
            this.uiManager.removePlayerLabel(id);
          }
        }
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

  handleAsteroidsUpdate(asteroids) {
    console.log('Received asteroids update:', asteroids.length, 'asteroids');
    
    // Convert asteroid data to Asteroid objects
    this.gameState.asteroids = asteroids.map(data => Asteroid.fromJSON(data));
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }

  async initializeGame(userData, gameParams) {
    console.log(`🎮 SocketManager.initializeGame called for ${userData.username} in game ${gameParams.gameId}`);
    
    // Prevent duplicate initGame calls
    if (this.gameInitialized) {
      console.log('🎮 Game already initialized via socket, skipping duplicate call');
      return;
    }
    
    this.gameInitialized = true;
    
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
