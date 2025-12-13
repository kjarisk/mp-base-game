// Powerup class for single player mode
class Powerup {
  static TYPES = {
    SHIELD: { name: 'shield', color: '#20B2AA', duration: 5000, icon: 'S' },
    SPEED: { name: 'speed', color: '#FFD700', duration: 4000, icon: 'F' },
    RAPID: { name: 'rapid', color: '#FF8C00', duration: 6000, icon: 'R' },
    MAGNET: { name: 'magnet', color: '#9B59B6', duration: 8000, icon: 'M' },
    TIMESLOW: { name: 'timeslow', color: '#FFFFFF', duration: 3000, icon: 'T' }
  };

  constructor({ x, y, type, radius = 15 }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.type = type;
    this.collected = false;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.rotationPhase = Math.random() * Math.PI * 2;
  }

  static getRandomType() {
    const types = Object.values(Powerup.TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  update(deltaTime) {
    this.rotationPhase += deltaTime * 2;
  }

  draw(ctx) {
    if (this.collected) return;
    
    const typeInfo = Powerup.TYPES[this.type.toUpperCase()] || Powerup.TYPES.SHIELD;
    const bob = Math.sin(Date.now() / 400 + this.bobOffset) * 4;
    
    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.rotate(Math.sin(this.rotationPhase) * 0.1);
    
    // Glow effect
    ctx.shadowColor = typeInfo.color;
    ctx.shadowBlur = 20;
    
    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = typeInfo.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Rotating particles
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + this.rotationPhase;
      const px = Math.cos(angle) * (this.radius + 5);
      const py = Math.sin(angle) * (this.radius + 5);
      
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = typeInfo.color;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    
    // Inner fill with gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius - 4);
    gradient.addColorStop(0, typeInfo.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.arc(0, 0, this.radius - 4, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.4;
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Icon
    ctx.fillStyle = typeInfo.color;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typeInfo.icon, 0, 0);
    
    ctx.restore();
  }

  collect() {
    this.collected = true;
    return this.type;
  }

  checkCollision(playerX, playerY, playerRadius) {
    if (this.collected) return false;
    
    const dist = Math.sqrt((this.x - playerX) ** 2 + (this.y - playerY) ** 2);
    return dist < this.radius + playerRadius;
  }

  static getDescription(type) {
    const descriptions = {
      shield: 'Blocks 1 hit from asteroids',
      speed: '50% faster movement for 4 seconds',
      rapid: '3x fire rate for 6 seconds',
      magnet: 'Auto-collect nearby crystals for 8 seconds',
      timeslow: 'Slows asteroids by 50% for 3 seconds'
    };
    return descriptions[type] || 'Unknown powerup';
  }
}

window.Powerup = Powerup;

