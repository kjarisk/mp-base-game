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
    const params = new URLSearchParams(window.location.search);
    return {
      gameId: params.get('gameId'),
      createGame: params.get('create') === '1',
      gameName: params.get('name')
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
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = 1024 * devicePixelRatio;
    canvas.height = 576 * devicePixelRatio;
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

  destroy() {
    this.gameRenderer.stop();
    this.inputManager.destroy();
    // Could add socketManager.destroy() if needed
  }
}

window.GameController = GameController;
