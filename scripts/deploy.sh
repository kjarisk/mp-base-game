#!/bin/bash

# Deployment Script: Test → Production
# Usage: ./deploy.sh

echo "🚀 Deploying from TEST to PRODUCTION..."

# Step 1: Backup production database
echo "📦 Creating production backup..."
./scripts/backup-manager.sh backup production

# Step 2: Stop production server
echo "🛑 Stopping production server..."
pm2 stop mp-base-game 2>/dev/null || echo "Production server not running"

# Step 3: Copy code from test to production
echo "📁 Copying code..."
rsync -av --exclude='.env*' --exclude='node_modules' --exclude='logs' \
    /path/to/mp-base-game-test/ /path/to/mp-base-game/

# Step 4: Install dependencies in production
echo "📦 Installing production dependencies..."
cd /path/to/mp-base-game
npm ci --production

# Step 5: Run database migrations on production
echo "🗄️ Running production migrations..."
./scripts/migrate.sh production

# Step 6: Start production server
echo "🚀 Starting production server..."
pm2 start config/ecosystem.production.json

echo "✅ Deployment complete!"
echo "🔍 Check status: pm2 status"
echo "📊 Health check: curl http://localhost:3000/health"
