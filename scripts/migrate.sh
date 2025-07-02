#!/bin/bash

# Database Migration Script
# Usage: ./migrate.sh [test|production]

ENV=${1:-test}

if [ "$ENV" = "test" ]; then
    echo "🧪 Setting up TEST database..."
    DB_NAME="mp_game_test"
    DB_USER="postgres"
    DB_PASS="test_password_123"
elif [ "$ENV" = "production" ]; then
    echo "🚀 Setting up PRODUCTION database..."
    DB_NAME="mp_game_prod"
    DB_USER="mp_game_user"
    DB_PASS="prod_password_456"
else
    echo "Usage: ./migrate.sh [test|production]"
    exit 1
fi

echo "Creating tables in $DB_NAME..."

# Create tables
PGPASSWORD=$DB_PASS psql -h localhost -U $DB_USER -d $DB_NAME << EOF
-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    high_score INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    quest_state JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create games table  
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_username VARCHAR(255) NOT NULL,
    max_players INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_high_score ON players(high_score DESC);
CREATE INDEX IF NOT EXISTS idx_games_owner ON games(owner_username);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);

-- Insert sample data for testing (only in test environment)
EOF

if [ "$ENV" = "test" ]; then
    PGPASSWORD=$DB_PASS psql -h localhost -U $DB_USER -d $DB_NAME << EOF
INSERT INTO players (username, high_score) VALUES 
('test_player_1', 100),
('test_player_2', 200),
('test_player_3', 150)
ON CONFLICT (username) DO NOTHING;
EOF
    echo "✅ Test data inserted"
fi

echo "✅ Database $ENV setup complete!"
