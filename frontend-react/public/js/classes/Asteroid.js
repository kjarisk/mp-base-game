// Asteroid class with visual distinction for collision types
class Asteroid {
  constructor({ x, y, radius, hasCollision, rotation = 0, rotationSpeed = 0, vertices = null }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.hasCollision = hasCollision;
    this.rotation = rotation;
    this.rotationSpeed = rotationSpeed;
    
    // Generate irregular asteroid shape using vertices
    this.vertices = vertices || this.generateVertices();
    
    // Visual properties based on collision type
    if (hasCollision) {
      // Collision asteroids - solid, brighter with warning glow
      this.fillColor = 'rgba(80, 60, 50, 0.9)';
      this.strokeColor = 'rgba(255, 107, 107, 0.8)'; // Coral warning
      this.glowColor = 'rgba(255, 107, 107, 0.4)';
      this.lineWidth = 3;
    } else {
      // Non-collision asteroids - darker, more transparent (background)
      this.fillColor = 'rgba(40, 35, 45, 0.5)';
      this.strokeColor = 'rgba(100, 100, 120, 0.3)';
      this.glowColor = null;
      this.lineWidth = 1;
    }
  }

  generateVertices() {
    const vertices = [];
    const numVertices = 8 + Math.floor(Math.random() * 5); // 8-12 vertices
    
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      // Vary the radius for each vertex to create irregular shape
      const radiusVariation = 0.7 + Math.random() * 0.6; // 70% to 130% of radius
      const vx = Math.cos(angle) * this.radius * radiusVariation;
      const vy = Math.sin(angle) * this.radius * radiusVariation;
      vertices.push({ x: vx, y: vy });
    }
    
    return vertices;
  }

  update() {
    // Rotate the asteroid
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    
    // Move to asteroid position and apply rotation
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Draw glow effect for collision asteroids
    if (this.glowColor) {
      ctx.shadowColor = this.glowColor;
      ctx.shadowBlur = 15;
    }
    
    // Draw asteroid shape
    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    
    ctx.closePath();
    
    // Fill
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    
    // Stroke
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();
    
    // Add surface detail for collision asteroids
    if (this.hasCollision) {
      this.drawSurfaceDetail(ctx);
    }
    
    ctx.restore();
  }

  drawSurfaceDetail(ctx) {
    // Add some crater-like details
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    
    // Draw 2-4 small craters
    const numCraters = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numCraters; i++) {
      const craterX = (Math.random() - 0.5) * this.radius * 0.8;
      const craterY = (Math.random() - 0.5) * this.radius * 0.8;
      const craterRadius = this.radius * (0.1 + Math.random() * 0.15);
      
      ctx.beginPath();
      ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Check if asteroid contains a point (for collision detection)
  containsPoint(px, py) {
    if (!this.hasCollision) return false;
    
    // Simple circular collision check
    const dx = px - this.x;
    const dy = py - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < this.radius;
  }

  // Serialize for network transmission
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
      hasCollision: this.hasCollision,
      rotation: this.rotation,
      rotationSpeed: this.rotationSpeed,
      vertices: this.vertices
    };
  }

  // Create from network data
  static fromJSON(data) {
    return new Asteroid({
      x: data.x,
      y: data.y,
      radius: data.radius,
      hasCollision: data.hasCollision,
      rotation: data.rotation,
      rotationSpeed: data.rotationSpeed,
      vertices: data.vertices
    });
  }
}

window.Asteroid = Asteroid;

