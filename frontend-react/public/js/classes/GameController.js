// Main game controller that orchestrates all components
class GameController {
  constructor() {
    this.gameState = new GameState();
    this.uiManager = new UIManager();
    this.socketManager = new SocketManager(this.gameState, this.uiManager);
    this.inputManager = new InputManager(this.gameState, this.socketManager);
    this.gameRenderer = new GameRenderer(this.gameState);
    
    // Wire up the circular dependency
    this.socketManager.setInputManager(this.inputManager);
    
    this.gameParams = this.parseUrlParams();
  }

  parseUrlParams() {
    // Try to get params from React component first (window.gameParams)
    if (window.gameParams) {
      return window.gameParams;
    }
    
    // Fallback to URL params for direct access
    const params = new URLSearchParams(window.location.search);
    return {
      gameId: params.get('gameId'),
      createGame: params.get('create') === '1',
      gameName: params.get('name') || params.get('gameName')
    };
  }

  async initialize() {
    try {
      // Setup canvas
      this.setupCanvas();
      
      // Initialize socket connection
      const socketUrl = window.APP_CONFIG?.SOCKET_URL || '';
      this.socketManager.initialize(socketUrl);
      
      // Initialize input handling
      this.inputManager.initialize();
      
      // Get user data and join game
      await this.initializeGame();
      
      // Start rendering
      this.gameRenderer.start();
      
      // Make available globally for event listeners
      window.gameController = this;
      
      console.log('Game initialized successfully');
    } catch (error) {
      console.error('Failed to initialize game:', error);
      alert('Failed to initialize game: ' + error.message);
    }
  }

  setupCanvas() {
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    
    // New viewport size: 20% wider, 30% taller
    const viewportWidth = 1229;
    const viewportHeight = 749;
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = viewportWidth * devicePixelRatio;
    canvas.height = viewportHeight * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);
    
    this.gameState.setCanvas(canvas, context);
    this.gameState.setGameId(this.gameParams.gameId);
  }

  async initializeGame() {
    try {
      const response = await fetch('/me');
      const userData = response.ok ? await response.json() : null;
      
      if (!userData) {
        window.location.href = '/';
        return;
      }
      
      await this.socketManager.initializeGame(userData, this.gameParams);
    } catch (error) {
      console.error('Failed to initialize game session:', error);
      throw error;
    }
  }

  cleanup() {
    console.log('🧹 Cleaning up game controller');
    
    // Stop rendering
    if (this.gameRenderer) {
      this.gameRenderer.stop();
    }
    
    // Clean up input manager
    if (this.inputManager) {
      this.inputManager.cleanup();
    }
    
    // Disconnect socket
    if (this.socketManager && this.socketManager.socket) {
      console.log('🔌 Disconnecting socket during cleanup');
      this.socketManager.socket.disconnect();
      this.socketManager.socket = null;
    }
    
    // Clear global references
    delete window.gameController;
    delete window.activeSocket;
    delete window.mouseX;
    delete window.mouseY;
    delete window.gameInitializing;
  }

  destroy() {
    this.cleanup();
  }
}

window.GameController = GameController;
