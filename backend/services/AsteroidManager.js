const logger = require('../utils/logger');
const gameConfig = require('../../shared/gameConfig');

class AsteroidManager {
  constructor() {
    this.asteroidIdCounter = 0;
  }

  // Generate asteroids for a new game
  generateAsteroids(count = 50) {
    const asteroids = [];
    const mapWidth = gameConfig.MAP_WIDTH;
    const mapHeight = gameConfig.MAP_HEIGHT;
    
    for (let i = 0; i < count; i++) {
      const asteroid = this.createAsteroid(mapWidth, mapHeight);
      asteroids.push(asteroid);
    }
    
    logger.info(`Generated ${count} asteroids for game`);
    return asteroids;
  }

  createAsteroid(mapWidth, mapHeight) {
    const id = `asteroid_${this.asteroidIdCounter++}`;
    
    // Random size between 30 and 120
    const radius = 30 + Math.random() * 90;
    
    // Padding from edges
    const padding = radius + 50;
    
    // Random position within map bounds
    const x = padding + Math.random() * (mapWidth - padding * 2);
    const y = padding + Math.random() * (mapHeight - padding * 2);
    
    // 40% chance of being a collision asteroid
    const hasCollision = Math.random() < 0.4;
    
    // Random rotation speed (-0.02 to 0.02 rad per frame, some stationary)
    const isStationary = Math.random() < 0.3; // 30% are stationary
    const rotationSpeed = isStationary ? 0 : (Math.random() - 0.5) * 0.04;
    
    // Generate irregular shape vertices
    const vertices = this.generateVertices(radius);
    
    return {
      id,
      x,
      y,
      radius,
      hasCollision,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed,
      vertices
    };
  }

  generateVertices(radius) {
    const vertices = [];
    const numVertices = 8 + Math.floor(Math.random() * 5); // 8-12 vertices
    
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      // Vary the radius for each vertex to create irregular shape
      const radiusVariation = 0.7 + Math.random() * 0.6;
      const vx = Math.cos(angle) * radius * radiusVariation;
      const vy = Math.sin(angle) * radius * radiusVariation;
      vertices.push({ x: vx, y: vy });
    }
    
    return vertices;
  }

  // Update asteroid rotations (called each tick)
  updateAsteroids(asteroids) {
    for (const asteroid of asteroids) {
      asteroid.rotation += asteroid.rotationSpeed;
    }
  }

  // Check collision between a point and asteroids
  checkCollision(x, y, radius, asteroids) {
    for (const asteroid of asteroids) {
      if (!asteroid.hasCollision) continue;
      
      const dx = x - asteroid.x;
      const dy = y - asteroid.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < asteroid.radius + radius) {
        return asteroid;
      }
    }
    return null;
  }
}

module.exports = AsteroidManager;

