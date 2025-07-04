const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Project Tests', function () {
  this.timeout(5000);

  it('validates required files exist', function () {
    const requiredFiles = [
      'backend/server.js',
      'backend/database/index.js',
      'backend/config/index.js',
      'frontend/public/index.html',
      'package.json',
      'config/ecosystem.test.json',
      'config/ecosystem.production.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file);
      assert.ok(fs.existsSync(filePath), `Required file missing: ${file}`);
    }
  });

  it('validates package.json has required dependencies', function () {
    const packageJson = require('../package.json');
    const requiredDeps = ['express', 'socket.io', 'dotenv', 'pg', 'bcrypt'];
    
    for (const dep of requiredDeps) {
      assert.ok(packageJson.dependencies[dep], `Missing dependency: ${dep}`);
    }
  });

  it('validates backend modules can be required', function () {
    // Test that main modules can be loaded without syntax errors
    assert.doesNotThrow(() => {
      require('../backend/config/index.js');
    }, 'Config module should load without errors');

    assert.doesNotThrow(() => {
      require('../backend/database/index.js');
    }, 'Database module should load without errors');
  });

  it('validates environment configuration', function () {
    const config = require('../backend/config/index.js');
    
    assert.ok(config.server, 'Config should have server section');
    assert.ok(config.server.port, 'Config should have port defined');
    assert.ok(config.server.sessionSecret, 'Config should have session secret');
    assert.ok(typeof config.server.port === 'number', 'Port should be a number');
    assert.ok(config.game, 'Config should have game section');
    assert.ok(config.database, 'Config should have database section');
  });

  it('uses config projectile speed when creating projectiles', function () {
    const GameService = require('../backend/services/GameService');
    const config = require('../backend/config');
    const service = new GameService();

    const gameId = 'game1';
    const socketId = 'socket1';
    service.createGame(gameId, 'Test Game', 'owner');
    service.addPlayerToGame(gameId, socketId, {
      username: 'owner',
      width: 100,
      height: 100
    });

    const projectile = service.createProjectile(gameId, socketId, { angle: 0 });
    assert.strictEqual(
      projectile.velocity.x,
      config.game.projectileSpeed,
      'Projectile should use configured speed'
    );
  });
});
