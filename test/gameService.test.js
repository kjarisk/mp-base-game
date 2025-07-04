const assert = require('assert');
const GameService = require('../backend/services/GameService');

describe('GameService projectile timers', function() {
  it('starts and clears timers when games are created and removed', function() {
    const service = new GameService();
    const gameId = 'test-' + Date.now();
    // create game
    service.createGame(gameId, 'Test Game', 'owner');
    assert.ok(service.projectileTimers[gameId], 'timer should be started');

    // add then remove a player to trigger game cleanup
    service.addPlayerToGame(gameId, 'socket1', { username: 'p1', width: 800, height: 600 });
    service.removePlayerFromGame(gameId, 'socket1');

    assert.strictEqual(service.projectileTimers[gameId], undefined, 'timer should be cleared');
  });
});
