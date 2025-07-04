# Configuration Management

## Overview

The project uses a clean separation between **environment configuration** and **game configuration**:

- **Environment Config** (`.env` files): Server, database, and deployment settings
- **Game Config** (`shared/gameConfig.js`): Game rules, balance, and mechanics

## Environment Configuration

### Files:
- `.env` - Development defaults
- `config/.env.test` - Test environment 
- `config/.env.production` - Production environment

### Contains:
```bash
# Server settings
NODE_ENV=production
PORT=3000
SESSION_SECRET=secure-key

# Database connection
DATABASE_URL=postgresql://user:pass@host:port/db

# Debug settings  
DEBUG=false
```

## Game Configuration

### File: `shared/gameConfig.js`

### Contains:
```javascript
module.exports = {
  // Player limits
  MAX_PLAYERS_PER_GAME: 10,
  MAX_PLAYERS_TOTAL: 100,
  
  // Game mechanics
  PROJECTILE_SPEED: 5,
  PLAYER_SPEED: 3,

  // Timing
  GAME_TICK_RATE: 60, // server updates per second
  
  // Game balance
  PLAYER_HEALTH: 100,
  ENEMY_HEALTH: 50,
  
  // Map settings
  MAP_WIDTH: 800,
  MAP_HEIGHT: 600
};
```

The `GAME_TICK_RATE` controls how often the server updates game state. Each game
instance starts its own timer based on this rate (`config.game.tickRate`) to
process projectile movement and other periodic logic.

## Why This Separation?

### ❌ **Problems with Game Config in .env:**
- Game rules mixed with server settings
- Environment files aren't version controlled properly
- Can't easily A/B test game settings
- Deployment confusion (which .env has latest game balance?)

### ✅ **Benefits of Separate Game Config:**
- Game rules are version controlled
- Easy to change game balance without touching environment
- Same game config across all environments
- Frontend can access game config via API

## Accessing Configuration

### Backend:
```javascript
const config = require('./config');
const gameConfig = require('../shared/gameConfig');

// Environment settings
const port = config.server.port;

// Game settings  
const maxPlayers = gameConfig.MAX_PLAYERS_PER_GAME;
```

### Frontend:
```javascript
// Fetch game config from API
fetch('/api/game/config')
  .then(res => res.json())
  .then(config => {
    console.log('Max players:', config.maxPlayersPerGame);
  });
```

## Migration Notes

**What was moved OUT of .env files:**
- `MAX_PLAYERS_PER_GAME` → `gameConfig.MAX_PLAYERS_PER_GAME`
- `PROJECTILE_SPEED` → `gameConfig.PROJECTILE_SPEED`

**What stays in .env files:**
- `NODE_ENV`, `PORT`, `DATABASE_URL`
- `SESSION_SECRET`, `DEBUG`
- Server and deployment settings

## Best Practices

1. **Environment Config** - Things that change between dev/test/prod
2. **Game Config** - Things that define game rules and balance
3. **Constants** - Things that never change (like collision padding)

This keeps your configuration organized and makes the project much easier to maintain!
