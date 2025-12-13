// Game rendering and animation loop
class GameRenderer {
  constructor(gameState) {
    this.gameState = gameState;
    this.animationId = null;
    this.isRunning = false;
    
    // Grid settings for visual reference
    this.gridSize = 100;
    this.gridColor = 'rgba(32, 178, 170, 0.08)'; // Teal with low opacity
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
    
    const ctx = this.gameState.context;
    const dpr = window.devicePixelRatio || 1;
    
    // Update camera position
    this.gameState.updateCamera();
    
    // Update asteroid rotations
    for (const asteroid of this.gameState.asteroids) {
      asteroid.update();
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, this.gameState.canvas.width, this.gameState.canvas.height);

    // Save context state and apply transformations
    ctx.save();
    
    // Scale for device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Apply camera translation (after dpr scale)
    ctx.translate(-this.gameState.camera.x, -this.gameState.camera.y);
    
    // Render background grid
    this.renderGrid(ctx);
    
    // Render map boundaries
    this.renderMapBoundaries(ctx);
    
    // Render asteroids (background layer - non-collision)
    this.renderAsteroidsBackground(ctx);
    
    // Render projectiles
    this.renderProjectiles(ctx);
    
    // Render players
    this.renderPlayers(ctx);
    
    // Render asteroids (foreground layer - collision ones)
    this.renderAsteroidsForeground(ctx);
    
    // Restore context state (removes camera transform)
    ctx.restore();
    
    // Render UI elements (not affected by camera) - with just dpr scale
    ctx.save();
    ctx.scale(dpr, dpr);
    this.renderMinimap(ctx);
    ctx.restore();
  }

  renderGrid(ctx) {
    const mapWidth = this.gameState.mapWidth;
    const mapHeight = this.gameState.mapHeight;
    
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= mapWidth; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mapHeight);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= mapHeight; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mapWidth, y);
      ctx.stroke();
    }
  }

  renderMapBoundaries(ctx) {
    const mapWidth = this.gameState.mapWidth;
    const mapHeight = this.gameState.mapHeight;
    
    // Draw map border
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.4)'; // Coral color
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, mapWidth - 4, mapHeight - 4);
    
    // Add glow effect
    ctx.shadowColor = 'rgba(255, 107, 107, 0.3)';
    ctx.shadowBlur = 15;
    ctx.strokeRect(2, 2, mapWidth - 4, mapHeight - 4);
    ctx.shadowBlur = 0;
  }

  renderPlayers(ctx) {
    for (const id in this.gameState.players) {
      const player = this.gameState.players[id];

      // Smooth player movement interpolation
      if (player.target) {
        player.x += (player.target.x - player.x) * 0.3;
        player.y += (player.target.y - player.y) * 0.3;
      }
      
      // Update rotation for current player based on mouse position
      if (this.gameState.isCurrentPlayer(id) && 
          window.mouseX !== undefined && 
          window.mouseY !== undefined) {
        // Convert screen mouse position to world position for rotation calculation
        const worldMouse = this.gameState.screenToWorld(window.mouseX, window.mouseY);
        player.updateRotation(worldMouse.x, worldMouse.y);
      }
      
      // Draw player at world position
      player.draw(ctx);
    }
  }

  renderProjectiles(ctx) {
    for (const id in this.gameState.projectiles) {
      const projectile = this.gameState.projectiles[id];
      projectile.draw(ctx);
    }
  }

  renderAsteroidsBackground(ctx) {
    // Render non-collision asteroids (background layer)
    for (const asteroid of this.gameState.asteroids) {
      if (!asteroid.hasCollision) {
        asteroid.draw(ctx);
      }
    }
  }

  renderAsteroidsForeground(ctx) {
    // Render collision asteroids (foreground layer)
    for (const asteroid of this.gameState.asteroids) {
      if (asteroid.hasCollision) {
        asteroid.draw(ctx);
      }
    }
  }

  renderMinimap(ctx) {
    // Minimap dimensions and position (top-right corner)
    const minimapWidth = 180;
    const minimapHeight = 135;
    const minimapX = this.gameState.viewportWidth - minimapWidth - 15;
    const minimapY = 15;
    
    // Scale factors
    const scaleX = minimapWidth / this.gameState.mapWidth;
    const scaleY = minimapHeight / this.gameState.mapHeight;
    
    // Draw minimap background
    ctx.fillStyle = 'rgba(10, 13, 16, 0.85)';
    ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);
    
    // Draw minimap border
    ctx.strokeStyle = 'rgba(32, 178, 170, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(minimapX, minimapY, minimapWidth, minimapHeight);
    
    // Draw viewport indicator
    const viewX = minimapX + (this.gameState.camera.x * scaleX);
    const viewY = minimapY + (this.gameState.camera.y * scaleY);
    const viewW = this.gameState.viewportWidth * scaleX;
    const viewH = this.gameState.viewportHeight * scaleY;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(viewX, viewY, viewW, viewH);
    
    // Draw asteroids on minimap
    for (const asteroid of this.gameState.asteroids) {
      const ax = minimapX + (asteroid.x * scaleX);
      const ay = minimapY + (asteroid.y * scaleY);
      const ar = Math.max(1.5, asteroid.radius * scaleX * 0.5);
      
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2);
      ctx.fillStyle = asteroid.hasCollision ? 'rgba(255, 107, 107, 0.4)' : 'rgba(100, 100, 100, 0.25)';
      ctx.fill();
    }
    
    // Draw players on minimap
    for (const id in this.gameState.players) {
      const player = this.gameState.players[id];
      const px = minimapX + (player.x * scaleX);
      const py = minimapY + (player.y * scaleY);
      
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      
      // Current player is highlighted
      if (this.gameState.isCurrentPlayer(id)) {
        ctx.fillStyle = '#20B2AA'; // Teal
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = player.color;
        ctx.fill();
      }
    }
    
    // Draw minimap label
    ctx.font = '9px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'left';
    ctx.fillText('MAP', minimapX + 5, minimapY + 11);
  }
}

window.GameRenderer = GameRenderer;
