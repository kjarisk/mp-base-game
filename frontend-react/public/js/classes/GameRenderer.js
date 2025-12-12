// Game rendering and animation loop
class GameRenderer {
  constructor(gameState) {
    this.gameState = gameState;
    this.animationId = null;
    this.isRunning = false;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  animate() {
    if (!this.isRunning) return;
    
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Clear canvas
    this.gameState.context.clearRect(
      0, 0, 
      this.gameState.canvas.width, 
      this.gameState.canvas.height
    );

    // Render players
    this.renderPlayers();
    
    // Render projectiles
    this.renderProjectiles();
  }

  renderPlayers() {
    for (const id in this.gameState.players) {
      const player = this.gameState.players[id];

      // Smooth player movement interpolation
      if (player.target) {
        player.x += (player.target.x - player.x) * 0.5;
        player.y += (player.target.y - player.y) * 0.5;
      }
      
      // Update rotation for current player based on mouse position
      if (this.gameState.isCurrentPlayer(id) && 
          window.mouseX !== undefined && 
          window.mouseY !== undefined) {
        player.updateRotation(window.mouseX, window.mouseY);
      }
      
      player.draw(this.gameState.context);
    }
  }

  renderProjectiles() {
    for (const id in this.gameState.projectiles) {
      const projectile = this.gameState.projectiles[id];
      projectile.draw(this.gameState.context);
    }
  }
}

window.GameRenderer = GameRenderer;
