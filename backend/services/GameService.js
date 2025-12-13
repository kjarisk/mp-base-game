const logger = require('../utils/logger');
const config = require('../config');
const Game = require('./Game');
const PlayerManager = require('./PlayerManager');
const ProjectileManager = require('./ProjectileManager');
const CollisionDetector = require('./CollisionDetector');
const AsteroidManager = require('./AsteroidManager');

class GameService {
  constructor() {
    this.games = {};
    this.playerManager = new PlayerManager();
    this.collisionDetector = new CollisionDetector();
    this.projectileManager = new ProjectileManager(this.collisionDetector);
    this.asteroidManager = new AsteroidManager();
  }

  createGame(gameId, gameName, ownerUsername) {
    if (!gameId || !gameName || !ownerUsername) {
      throw new Error('Game ID, name, and owner are required');
    }

    if (this.games[gameId]) {
      throw new Error('Game already exists');
    }

    const game = new Game(gameId, gameName, ownerUsername);
    
    // Generate asteroids for the game
    const asteroids = this.asteroidManager.generateAsteroids(50);
    game.setAsteroids(asteroids);
    
    this.games[gameId] = game;

    logger.info(`Game created: ${gameName} by ${ownerUsername}`);
    return game;
  }

  getGame(gameId) {
    return this.games[gameId];
  }

  addPlayerToGame(gameId, socketId, playerData) {
    const game = this.games[gameId];
    if (!game) {
      throw new Error('Game not found');
    }

    // Ensure unique username
    const uniqueUsername = this.playerManager.ensureUniqueUsername(
      playerData.username, 
      game.players
    );

    // Create player with unique username
    const playerWithUniqueData = { ...playerData, username: uniqueUsername };
    const player = this.playerManager.createPlayer(socketId, playerWithUniqueData);

    return game.addPlayer(socketId, player);
  }

  removePlayerFromGame(gameId, socketId) {
    const game = this.games[gameId];
    if (!game) return false;

    const removed = game.removePlayer(socketId);
    
    // Remove empty games
    if (game.isEmpty()) {
      delete this.games[gameId];
      logger.info(`Game ${game.name} removed (empty)`);
    }

    return removed;
  }

  updatePlayerPosition(gameId, socketId, movementData) {
    const game = this.games[gameId];
    if (!game || !game.players[socketId]) {
      throw new Error('Player not found in game');
    }

    const player = game.players[socketId];
    return this.playerManager.updatePlayerPosition(player, movementData);
  }

  createProjectile(gameId, socketId, projectileData) {
    const game = this.games[gameId];
    if (!game || !game.players[socketId]) {
      throw new Error('Player not found in game');
    }

    const player = game.players[socketId];
    const projectile = this.projectileManager.createProjectile(player, projectileData);
    
    return game.addProjectile(projectile);
  }

  updateProjectiles(gameId) {
    const game = this.games[gameId];
    if (!game) return;

    this.projectileManager.updateProjectiles(game);
  }

  getGamesList() {
    return Object.values(this.games).map(game => game.toListItem());
  }

  getGameStats() {
    const totalGames = Object.keys(this.games).length;
    const totalPlayers = Object.values(this.games)
      .reduce((sum, game) => sum + game.getPlayerCount(), 0);
    
    return { totalGames, totalPlayers };
  }
}

module.exports = GameService;
