// Game state management class
class GameState {
  constructor() {
    this.players = {};
    this.projectiles = {};
    this.config = {};
    this.socket = null;
    this.canvas = null;
    this.context = null;
    this.gameId = null;
    this.socketId = null;
  }

  setSocket(socket) {
    this.socket = socket;
    this.socketId = socket.id;
    console.log('🔌 Socket set in GameState:', socket.id);
  }

  setCanvas(canvas, context) {
    this.canvas = canvas;
    this.context = context;
  }

  setGameId(gameId) {
    this.gameId = gameId;
  }

  setConfig(config) {
    this.config = config;
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
      console.log('❌ No current player found. socketId:', this.socketId, 'players:', Object.keys(this.players));
    }
    return currentPlayer;
  }

  isCurrentPlayer(id) {
    return id === this.socketId;
  }
}

// Export as global for now, could be ES6 modules later
window.GameState = GameState;
