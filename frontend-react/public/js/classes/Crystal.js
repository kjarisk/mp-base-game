// Crystal class for single player mode
class Crystal {
  constructor({ x, y, radius = 10, value = 10 }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.value = value;
    this.collected = false;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.sparklePhase = Math.random() * Math.PI * 2;
  }

  update(deltaTime) {
    this.sparklePhase += deltaTime * 5;
  }

  draw(ctx) {
    if (this.collected) return;
    
    const bob = Math.sin(Date.now() / 300 + this.bobOffset) * 3;
    
    ctx.save();
    ctx.translate(this.x, this.y + bob);
    
    // Outer glow
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    
    // Diamond shape
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius * 0.7, 0);
    ctx.lineTo(0, this.radius);
    ctx.lineTo(-this.radius * 0.7, 0);
    ctx.closePath();
    
    // Fill with gradient
    const gradient = ctx.createLinearGradient(0, -this.radius, 0, this.radius);
    gradient.addColorStop(0, '#FFFACD');
    gradient.addColorStop(0.5, '#FFD700');
    gradient.addColorStop(1, '#DAA520');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = '#FFF8DC';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Inner sparkle
    const sparkleAlpha = 0.5 + Math.sin(this.sparklePhase) * 0.5;
    ctx.beginPath();
    ctx.arc(0, -this.radius * 0.3, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
    ctx.fill();
    
    ctx.restore();
  }

  collect() {
    this.collected = true;
    return this.value;
  }

  checkCollision(playerX, playerY, playerRadius) {
    if (this.collected) return false;
    
    const dist = Math.sqrt((this.x - playerX) ** 2 + (this.y - playerY) ** 2);
    return dist < this.radius + playerRadius;
  }
}

window.Crystal = Crystal;

