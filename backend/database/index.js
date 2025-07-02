const { Pool } = require('pg');
require('dotenv').config();

class Database {
  constructor() {
    // Try PostgreSQL first, fallback to in-memory if not available
    this.usePostgres = false;
    this.pool = null;
    this.players = new Map(); // Fallback in-memory storage
    
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      if (process.env.DATABASE_URL) {
        this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          // For development, don't require SSL
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        // Test connection
        await this.pool.query('SELECT NOW()');
        await this.createTables();
        this.usePostgres = true;
        console.log('✅ PostgreSQL connected successfully');
      }
    } catch (error) {
      console.log('⚠️  PostgreSQL not available, using in-memory storage:', error.message);
      this.usePostgres = false;
    }
  }

  async createTables() {
    const createPlayersTable = `
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        high_score INTEGER DEFAULT 0,
        settings JSONB DEFAULT '{}',
        quest_state JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createGamesTable = `
      CREATE TABLE IF NOT EXISTS games (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_username VARCHAR(255) NOT NULL,
        max_players INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active'
      )
    `;

    await this.pool.query(createPlayersTable);
    await this.pool.query(createGamesTable);
  }

  async getPlayer(username) {
    if (this.usePostgres) {
      try {
        const result = await this.pool.query(
          'SELECT * FROM players WHERE username = $1',
          [username]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error('Database error:', error);
        return null;
      }
    } else {
      // Fallback to in-memory
      return this.players.get(username) || null;
    }
  }

  async createPlayer(username, passwordHash = '') {
    if (!username || typeof username !== 'string') {
      throw new Error('Valid username is required');
    }

    if (this.usePostgres) {
      try {
        const result = await this.pool.query(`
          INSERT INTO players (username, password_hash, created_at, last_login)
          VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (username) 
          DO UPDATE SET last_login = CURRENT_TIMESTAMP
          RETURNING *
        `, [username, passwordHash]);
        
        return result.rows[0];
      } catch (error) {
        console.error('Database error creating player:', error);
        throw error;
      }
    } else {
      // Fallback to in-memory
      const existingPlayer = this.players.get(username);
      if (existingPlayer) {
        existingPlayer.last_login = new Date().toISOString();
        return existingPlayer;
      }

      const newPlayer = {
        id: Date.now(), // Simple ID for in-memory
        username,
        password_hash: passwordHash,
        high_score: 0,
        settings: {},
        quest_state: {},
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      this.players.set(username, newPlayer);
      return newPlayer;
    }
  }

  async updateScore(username, newScore) {
    if (this.usePostgres) {
      try {
        await this.pool.query(`
          UPDATE players 
          SET high_score = $2 
          WHERE username = $1 AND high_score < $2
        `, [username, newScore]);
      } catch (error) {
        console.error('Database error updating score:', error);
      }
    } else {
      // Fallback to in-memory
      const player = this.players.get(username);
      if (player && newScore > player.high_score) {
        player.high_score = newScore;
      }
    }
  }

  async updateQuestState(username, questState) {
    if (this.usePostgres) {
      try {
        await this.pool.query(`
          UPDATE players 
          SET quest_state = $2 
          WHERE username = $1
        `, [username, JSON.stringify(questState)]);
      } catch (error) {
        console.error('Database error updating quest state:', error);
      }
    } else {
      // Fallback to in-memory
      const player = this.players.get(username);
      if (player) {
        player.quest_state = questState;
      }
    }
  }

  async getQuestState(username) {
    const player = await this.getPlayer(username);
    return player ? player.quest_state || {} : {};
  }

  async getAllPlayers() {
    if (this.usePostgres) {
      try {
        const result = await this.pool.query('SELECT * FROM players ORDER BY high_score DESC');
        return result.rows;
      } catch (error) {
        console.error('Database error getting all players:', error);
        return [];
      }
    } else {
      // Fallback to in-memory
      return Array.from(this.players.values())
        .sort((a, b) => b.high_score - a.high_score);
    }
  }

  async close() {
    if (this.usePostgres && this.pool) {
      await this.pool.end();
    }
  }

  // Legacy compatibility methods
  loadPlayers() {
    // This is now async in constructor, so this is a no-op for compatibility
    return this.players;
  }

  savePlayers() {
    // PostgreSQL auto-saves, in-memory doesn't need saving
    return true;
  }
}

module.exports = new Database();
