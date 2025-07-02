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

  draw() {
    // Draw username
    c.font = '12px sans-serif';
    c.fillStyle = 'white';
    c.textAlign = 'center';
    c.fillText(this.username, this.x, this.y + this.radius * 2);

    if (!Player.spaceshipLoaded) {
      // Fallback to circle if SVG not loaded
      c.save();
      c.shadowColor = this.color;
      c.shadowBlur = 20;
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = this.color;
      c.fill();
      c.restore();
      return;
    }

    c.save();
    
    // Move to player position and rotate
    c.translate(this.x, this.y);
    c.rotate(this.rotation);
    
    // Draw spaceship base
    const size = this.radius * 2;
    c.drawImage(Player.spaceshipImage, -size/2, -size/2, size, size);
    
    // Apply color overlay using composite operation
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = this.color;
    c.globalAlpha = 0.6;
    c.fillRect(-size/2, -size/2, size, size);
    
    // Add glow effect
    c.globalCompositeOperation = 'destination-over';
    c.globalAlpha = 0.3;
    c.shadowColor = this.color;
    c.shadowBlur = 20;
    c.fillStyle = this.color;
    c.fillRect(-size/2, -size/2, size, size);
    
    c.restore();
  }
}
