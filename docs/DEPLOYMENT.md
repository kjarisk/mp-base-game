# Deployment Guide

This guide covers the complete setup for automated deployments using GitHub Actions for your multiplayer game.

## Prerequisites

### 1. Server Setup
- Linode server with Ubuntu/Debian
- Node.js 18+ installed
- PM2 installed globally: `npm install -g pm2`
- PostgreSQL installed (optional - will fall back to in-memory storage)
- Git configured with repository access

### 2. GitHub Repository Setup
- Fork/clone this repository
- Add required secrets in GitHub repository settings

## Required GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions and add:

```
DEPLOY_KEY          # SSH private key for accessing your Linode server
LINODE_HOST         # Your Linode server IP address
LINODE_USER         # root (since you're using root directory)
TEST_PATH           # /root/mp-base-game-test
PROD_PATH           # /root/mp-base-game
```

## Server Directory Structure

Your server structure:
```
/root/
├── mp-base-game-test/  # Test environment
├── mp-base-game/       # Production environment
├── backup-*/           # Automatic backups
└── prod-backup-*/      # Production backups
```

## Environment Files Setup

Create environment files on your server for each deployment:

### Test Environment (`/root/mp-base-game-test/.env`)
```bash
NODE_ENV=test
PORT=3000
DATABASE_URL=postgresql://testuser:testpass@localhost:5432/testgame
SESSION_SECRET=your-test-session-secret-here
# Leave DATABASE_URL empty to use in-memory storage during development
```

### Production Environment (`/root/mp-base-game/.env`)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://produser:prodpass@localhost:5432/prodgame
SESSION_SECRET=your-production-session-secret-here
```

## SSH Key Setup

1. Generate an SSH key pair on your local machine:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key
```

2. Add the public key to your server's authorized_keys:
```bash
ssh-copy-id -i ~/.ssh/deploy_key.pub root@your-server-ip
```

3. Add the private key content to GitHub secrets as `DEPLOY_KEY`:
```bash
cat ~/.ssh/deploy_key
```

## PostgreSQL Setup (Optional)

If you want persistent database storage instead of in-memory:

### 1. Install PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Create Databases and Users
```bash
sudo -u postgres psql

-- Create test database
CREATE DATABASE testgame;
CREATE USER testuser WITH PASSWORD 'testpass';
GRANT ALL PRIVILEGES ON DATABASE testgame TO testuser;

-- Create production database
CREATE DATABASE prodgame;
CREATE USER produser WITH PASSWORD 'prodpass';
GRANT ALL PRIVILEGES ON DATABASE prodgame TO produser;

\q
```

### 3. Update Environment Files
Update the `DATABASE_URL` in your environment files with the correct credentials.

## Deployment Workflows

### 1. Automated Test Deployment
- **Trigger**: Every push to `main` branch
- **Target**: Test server at `TEST_PATH`
- **Process**:
  - Creates backup
  - Updates code
  - Installs dependencies
  - Runs migrations
  - Restarts test application
  - Performs health check

### 2. Manual Production Deployment
- **Trigger**: Manual GitHub Actions dispatch
- **Target**: Production server at `PROD_PATH`
- **Safety**: Requires typing "CONFIRM" to proceed
- **Process**:
  - Creates production backup
  - Updates code
  - Installs production dependencies
  - Runs production migrations
  - Restarts production application
  - Performs health checks with retries

### 3. Continuous Testing
- **Trigger**: Push to main/develop or pull requests
- **Process**:
  - Tests on multiple Node.js versions
  - Validates project structure
  - Tests server startup

## Manual Deployment Commands

If you need to deploy manually:

### Test Environment
```bash
cd /root/mp-base-game-test
git pull origin main
npm ci
npm run migrate:test
npm run deploy:test
```

### Production Environment
```bash
cd /root/mp-base-game
git pull origin main
NODE_ENV=production npm ci --only=production
npm run migrate:prod
npm run deploy:prod
```

## Monitoring and Maintenance

### Check Application Status
```bash
pm2 status
pm2 logs multiplayer-test    # Test logs
pm2 logs multiplayer-game    # Production logs
```

### Health Checks
```bash
curl http://localhost:3000/health  # Test environment
curl http://localhost:3001/health  # Production environment
```

### Database Backups
Set up automated PostgreSQL backups:
```bash
# Add to crontab (crontab -e)
0 2 * * * pg_dump testgame > /var/backups/testgame-$(date +\%Y\%m\%d).sql
0 3 * * * pg_dump prodgame > /var/backups/prodgame-$(date +\%Y\%m\%d).sql
```

## Rollback Procedures

### If Test Deployment Fails
The workflow automatically creates backups. To rollback:
```bash
cd /root
rm -rf mp-base-game-test
mv backup-YYYYMMDD-HHMMSS mp-base-game-test
cd mp-base-game-test
pm2 restart config/ecosystem.test.json
```

### If Production Deployment Fails
```bash
cd /root
rm -rf mp-base-game
mv prod-backup-YYYYMMDD-HHMMSS mp-base-game
cd mp-base-game
pm2 restart config/ecosystem.production.json
```

## Security Considerations

1. **SSH Keys**: Use dedicated deploy keys with limited permissions
2. **Environment Variables**: Never commit secrets to git
3. **Database Access**: Use strong passwords and limit network access
4. **Server Security**: Keep server updated and use firewall rules
5. **Backups**: Regular backups of both code and database

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check SSH key setup and server permissions
2. **Port Already in Use**: Check if applications are already running
3. **Database Connection Failed**: Verify PostgreSQL is running and credentials are correct
4. **Health Check Failed**: Check application logs with `pm2 logs`

### Debug Commands
```bash
# Check if processes are running
pm2 status

# View recent logs
pm2 logs --lines 50

# Restart applications
pm2 restart all

# Check server resources
htop
df -h
```

## Next Steps

1. Set up your GitHub secrets
2. Configure your server with the required directory structure
3. Test the deployment by pushing to main branch
4. Monitor the test deployment
5. When ready, manually trigger production deployment

Your multiplayer game is now ready for automated, production-grade deployments! 🚀
