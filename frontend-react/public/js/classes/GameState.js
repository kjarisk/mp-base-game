// Game state management class
class GameState {
  constructor() {
    this.players = {};
    this.projectiles = {};
    this.asteroids = [];
    this.config = {};
    this.socket = null;
    this.canvas = null;
    this.context = null;
    this.gameId = null;
    this.socketId = null;
    
    // Camera/viewport system
    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      smoothing: 0.1 // Camera follow smoothness
    };
    
    // Map dimensions (will be set from config)
    this.mapWidth = 6400;
    this.mapHeight = 4800;
    
    // Viewport dimensions (20% wider, 30% taller)
    this.viewportWidth = 1229;
    this.viewportHeight = 749;
  }

  setSocket(socket) {
    this.socket = socket;
    this.socketId = socket.id;
    console.log('Socket set in GameState:', socket.id);
  }

  setCanvas(canvas, context) {
    this.canvas = canvas;
    this.context = context;
    this.viewportWidth = canvas.width / (window.devicePixelRatio || 1);
    this.viewportHeight = canvas.height / (window.devicePixelRatio || 1);
  }

  setGameId(gameId) {
    this.gameId = gameId;
  }

  setConfig(config) {
    this.config = config;
    if (config.mapWidth) this.mapWidth = config.mapWidth;
    if (config.mapHeight) this.mapHeight = config.mapHeight;
  }

  // Update camera to follow the current player
  updateCamera() {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;
    
    // Target camera position (centered on player)
    this.camera.targetX = currentPlayer.x - this.viewportWidth / 2;
    this.camera.targetY = currentPlayer.y - this.viewportHeight / 2;
    
    // Clamp camera to map bounds
    this.camera.targetX = Math.max(0, Math.min(this.mapWidth - this.viewportWidth, this.camera.targetX));
    this.camera.targetY = Math.max(0, Math.min(this.mapHeight - this.viewportHeight, this.camera.targetY));
    
    // Smooth camera movement
    this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
    this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.camera.x,
      y: worldY - this.camera.y
    };
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.camera.x,
      y: screenY + this.camera.y
    };
  }

  // Check if a point is visible in the viewport
  isInViewport(worldX, worldY, padding = 50) {
    const screenPos = this.worldToScreen(worldX, worldY);
    return screenPos.x >= -padding && 
           screenPos.x <= this.viewportWidth + padding &&
           screenPos.y >= -padding && 
           screenPos.y <= this.viewportHeight + padding;
  }

  addPlayer(id, playerData) {
    if (!this.players[id]) {
      console.log('Creating new frontend player:', id, playerData.username);
      this.players[id] = new Player({
        x: playerData.x,
        y: playerData.y,
        radius: 10,
        color: playerData.color,
        username: playerData.username
      });
      return true; // New player created
    }
    return false; // Player already exists
  }

  updatePlayer(id, playerData) {
    if (this.players[id]) {
      this.players[id].target = {
        x: playerData.x,
        y: playerData.y
      };
      // Update score if provided
      if (playerData.score !== undefined) {
        this.players[id].score = playerData.score;
      }
    }
  }

  removePlayer(id) {
    if (this.players[id]) {
      console.log('Removing frontend player:', id, this.players[id].username);
      delete this.players[id];
      return true;
    }
    return false;
  }

  addProjectile(id, projectileData) {
    if (!this.projectiles[id]) {
      console.log('Creating new projectile:', id, 'at', projectileData.x, projectileData.y);
      this.projectiles[id] = new Projectile({
        x: projectileData.x,
        y: projectileData.y,
        velocity: projectileData.velocity,
        radius: 5,
        color: this.players[projectileData.playerId]?.color || 'white'
      });
      return true;
    }
    return false;
  }

  updateProjectile(id, projectileData) {
    if (this.projectiles[id]) {
      this.projectiles[id].x = projectileData.x;
      this.projectiles[id].y = projectileData.y;
    }
  }

  removeProjectile(id) {
    if (this.projectiles[id]) {
      console.log('Removing projectile:', id);
      delete this.projectiles[id];
      return true;
    }
    return false;
  }

  getCurrentPlayer() {
    const currentPlayer = this.players[this.socketId];
    if (!currentPlayer) {
      console.log('No current player found. socketId:', this.socketId, 'players:', Object.keys(this.players));
    }
    return currentPlayer;
  }

  isCurrentPlayer(id) {
    return id === this.socketId;
  }
}

// Export as global for now, could be ES6 modules later
window.GameState = GameState;
