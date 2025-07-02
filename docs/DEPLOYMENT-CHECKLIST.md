# Deployment Checklist

## Pre-Deployment Setup (One-time)

### 1. Install Prerequisites
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx
```

### 2. Setup Database
```bash
# Switch to postgres user
sudo -i -u postgres

# Create database user
createuser --interactive mp_game_user

# Set password
psql -c "ALTER USER mp_game_user PASSWORD 'your_secure_password';"

# Create databases
createdb -O mp_game_user mp_game_test
createdb -O mp_game_user mp_game_prod

exit
```

### 3. Setup Project
```bash
# Clone project
git clone <your-repo-url> /var/www/mp-game
cd /var/www/mp-game

# Install dependencies
npm install

# Setup environment files
cp config/.env.example config/.env.test
cp config/.env.example config/.env.production

# Edit environment files with correct values
nano config/.env.test
nano config/.env.production

# Initialize backup system
./scripts/backup-manager.sh init

# Run complete server setup
./scripts/server-fix.sh full-fix
```

### 4. Configure Nginx
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/mp-game

# Enable site
sudo ln -s /etc/nginx/sites-available/mp-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Deployment Process

### Quick Deployment
```bash
cd /var/www/mp-game

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run complete server reset
./scripts/server-fix.sh full-fix

# Verify deployment
./scripts/server-fix.sh status
```

### Detailed Deployment (with backups)
```bash
cd /var/www/mp-game

# 1. Backup current state
./scripts/backup-manager.sh backup production

# 2. Stop applications
pm2 stop all

# 3. Pull latest code
git pull origin main

# 4. Install dependencies
npm ci --production

# 5. Run database migrations (if any)
./scripts/migrate.sh production

# 6. Start applications
pm2 start config/ecosystem.production.json
pm2 start config/ecosystem.test.json

# 7. Verify
./scripts/server-fix.sh status
curl http://localhost:3001/health
```

## Troubleshooting Quick Fixes

### 502 Bad Gateway
```bash
# Check PM2 status
pm2 status

# If errored, restart
./scripts/server-fix.sh full-fix

# Check Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Database Connection Issues
```bash
# Test database connectivity
psql -h localhost -U mp_game_user mp_game_prod

# Check environment variables
pm2 show mp-base-game

# Restart with fresh environment
pm2 restart config/ecosystem.production.json --update-env
```

### Port Conflicts
```bash
# Check what's using ports
./scripts/server-fix.sh ports

# Kill conflicting processes
sudo kill -9 <PID>

# Restart clean
./scripts/server-fix.sh clean
./scripts/server-fix.sh start
```

## Monitoring Commands

```bash
# Real-time monitoring
pm2 monit

# Check logs
pm2 logs --lines 50

# Application health
curl http://localhost:3000/health  # test
curl http://localhost:3001/health  # production

# System status
./scripts/server-fix.sh status
```

## Backup Commands

```bash
# Create backup
./scripts/backup-manager.sh backup production

# List backups
./scripts/backup-manager.sh list

# Restore backup
./scripts/backup-manager.sh restore production backup_file.sql

# Clean old backups
./scripts/backup-manager.sh cleanup
```

## Emergency Recovery

If everything is broken:

```bash
# 1. Stop everything
pm2 delete all
sudo systemctl stop nginx

# 2. Clean processes
sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3001) 2>/dev/null || true

# 3. Restart from scratch
./scripts/server-fix.sh full-fix

# 4. Start Nginx
sudo systemctl start nginx

# 5. Verify
./scripts/server-fix.sh status
```
