class Player {
  constructor({ x, y, radius, color, username }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.username = username;
    this.rotation = 0; // Rotation angle in radians
    this.targetRotation = 0;
    this.scale = radius / 10; // Scale based on radius (default radius was 10)
    
    // Load the spaceship SVG
    this.loadSpaceship();
  }

  loadSpaceship() {
    if (!Player.spaceshipImage) {
      Player.spaceshipImage = new Image();
      Player.spaceshipImage.src = '/img/spaceship-player.svg';
      Player.spaceshipLoaded = false;
      Player.spaceshipImage.onload = () => {
        Player.spaceshipLoaded = true;
      };
    }
  }

  static spaceshipImage = null;
  static spaceshipLoaded = false;

  // Update rotation to face mouse position
  updateRotation(mouseX, mouseY) {
    if (mouseX !== undefined && mouseY !== undefined) {
      this.targetRotation = Math.atan2(mouseY - this.y, mouseX - this.x) + Math.PI / 2;
      
      // Smooth rotation interpolation
      let rotationDiff = this.targetRotation - this.rotation;
      
      // Handle rotation wrap-around
      if (rotationDiff > Math.PI) {
        rotationDiff -= 2 * Math.PI;
      } else if (rotationDiff < -Math.PI) {
        rotationDiff += 2 * Math.PI;
      }
      
      this.rotation += rotationDiff * 0.1; // Smooth rotation speed
    }
  }

  // Get the nose position for projectile spawning
  getNosePosition() {
    const noseDistance = this.radius * 1.2; // Distance from center to nose
    return {
      x: this.x + Math.cos(this.rotation - Math.PI / 2) * noseDistance,
      y: this.y + Math.sin(this.rotation - Math.PI / 2) * noseDistance
    };
  }

  draw(ctx) {
    // Draw username
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(this.username, this.x, this.y + this.radius * 2);

    if (!Player.spaceshipLoaded) {
      // Fallback to circle if SVG not loaded
      ctx.save();
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.save();
    
    // Move to player position and rotate
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Draw spaceship base
    const size = this.radius * 2.5; // Slightly larger for better visibility
    
    // Add glow effect behind ship
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 25;
    
    ctx.drawImage(Player.spaceshipImage, -size/2, -size/2, size, size);
    
    // Draw engine thrust effect when moving
    if (this.isThrusting) {
      ctx.save();
      ctx.globalAlpha = 0.8;
      const thrustGradient = ctx.createRadialGradient(0, size/2.5, 0, 0, size/2.5, size/3);
      thrustGradient.addColorStop(0, '#FFD700');
      thrustGradient.addColorStop(0.5, '#FF8C00');
      thrustGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = thrustGradient;
      ctx.beginPath();
      ctx.moveTo(-size/6, size/3);
      ctx.lineTo(0, size/2 + Math.random() * 10);
      ctx.lineTo(size/6, size/3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    
    ctx.restore();
  }
}
