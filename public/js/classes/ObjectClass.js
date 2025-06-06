// ObjectClass
class Particle {
  constructor({ effect, x, y, radius, color }) {
    this.effect = effect;
    this.radius = Math.floor(Math.random() * 7 + 4);
    this.x = this.effect.element.x + this.effect.element.width * 1.5;
    this.y =
      -this.radius -
      this.effect.maxDistance -
      Math.random() * this.effect.height * 0.2;
    this.vx = Math.random() * -2;
    this.vy = 0;
    this.gravity = this.radius * 0.001;
    this.width = this.radius * 2;
    this.height = this.radius * 2;
    this.bounced = 0;

    this.friction = 0.95;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fill();
    if (this.effect.debug) {
      context.strokeRect(
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
      );
    }
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;

    if (
      this.y > this.effect.height + this.radius + this.effect.maxDistance ||
      this.x < -this.radius - this.effect.maxDistance ||
      this.x > this.effect.width + this.radius + this.effect.maxDistance
    ) {
      this.reset();
    }
    // collision detection;
    if (
      this.x - this.radius <
        this.effect.element.x + this.effect.element.width &&
      this.x - this.radius + this.width > this.effect.element.x &&
      this.y - this.radius < this.effect.element.y + 5 &&
      this.height + this.y - this.radius > this.effect.element.y &&
      this.bounced < 4
    ) {
      this.bounced++;
      this.vy *= -0.5;
      this.y = this.effect.element.y - this.radius;
    }
  }
  reset() {
    this.x = this.effect.element.x + this.effect.element.width * 1.5;
    this.y =
      -this.radius -
      this.effect.maxDistance -
      Math.random() * this.effect.height * 0.2;
    this.vy = 0;
    this.vx = Math.random() * -2;
    this.bounced = 0;
  }
}

class Effect {
  constructor(canvas, context, gradient) {
    this.canvas = canvas;
    this.gradient = gradient;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.debug = false;
    this.element = document.getElementById('caption').getBoundingClientRect();
    this.particles = [];
    this.numberOfParticles = 600;
    this.context = context;
    this.createParticles();
    this.maxDistance = 100;

    this.mouse = {
      x: 0,
      y: 0,
      pressed: false,
      radius: 250
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'd') {
        this.debug = !this.debug;
      }
    });

    window.addEventListener('resize', (e) => {
      this.resize(
        e.target.window.innerWidth,
        e.target.window.innerHeight,
        this.context
      );
    });

    window.addEventListener('mousemove', (e) => {
      if (this.mouse.pressed) {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
      }
    });
    window.addEventListener('mousedown', (e) => {
      this.mouse.pressed = true;
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });
    window.addEventListener('mouseup', (e) => {
      this.mouse.pressed = false;
    });
  }
  createParticles() {
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle({ effect: this }));
    }
  }
  handleParticles(context) {
    context.fillStyle = this.gradient;
    this.connectParticles(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
    if (this.debug) {
      const { x, y, width, height } = this.element;
      context.strokeRect(x, y, width, height);
    }
  }
  connectParticles(context) {
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.hypot(dx, dy);
        if (distance < this.maxDistance) {
          context.save();
          const opacity = 1 - distance / this.maxDistance;
          context.globalAlpha = opacity;
          context.beginPath();
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          context.stroke();
          context.restore();
        }
      }
    }
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.element = document.getElementById('caption').getBoundingClientRect();

    this.context.fillStyle = this.gradient;
    this.context.strokeStyle = 'white';
    this.particles.forEach((particle) => particle.reset());
  }
}
