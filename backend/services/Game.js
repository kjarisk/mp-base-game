const logger = require('../utils/logger');
const config = require('../config');

class Game {
  constructor(gameId, gameName, ownerUsername) {
    this.id = gameId;
    this.name = gameName;
    this.owner = ownerUsername;
    this.players = {};
    this.projectiles = {};
    this.createdAt = new Date().toISOString();
    this.maxPlayers = config.game.maxPlayersPerGame;
  }

  addPlayer(socketId, player) {
    if (Object.keys(this.players).length >= this.maxPlayers) {
      throw new Error('Game is full');
    }

    // Remove any existing player with this socket ID (reconnection)
    if (this.players[socketId]) {
      delete this.players[socketId];
    }

    this.players[socketId] = player;
    logger.info(`Player ${player.username} joined game ${this.name}`);
    
    return player;
  }

  removePlayer(socketId) {
    const player = this.players[socketId];
    if (!player) return false;

    delete this.players[socketId];
    logger.info(`Player ${player.username} left game ${this.name}`);
    
    return true;
  }

  addProjectile(projectile) {
    this.projectiles[projectile.id] = projectile;
    return projectile;
  }

  isEmpty() {
    return Object.keys(this.players).length === 0;
  }

  getPlayerCount() {
    return Object.keys(this.players).length;
  }

  toListItem() {
    return {
      id: this.id,
      name: `${this.name} (by ${this.owner})`,
      players: this.getPlayerCount(),
      maxPlayers: this.maxPlayers,
      createdAt: this.createdAt
    };
  }
}

module.exports = Game;
