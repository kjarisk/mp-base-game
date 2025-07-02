# Your Specific Server Setup

## GitHub Secrets Configuration

Set these **exact values** in your GitHub repository settings:

| Secret Name | Value |
|-------------|-------|
| `DEPLOY_KEY` | Your SSH private key content |
| `LINODE_HOST` | Your Linode server IP address |
| `LINODE_USER` | `root` |
| `TEST_PATH` | `/root/mp-base-game-test` |
| `PROD_PATH` | `/root/mp-base-game` |

## Server Directory Structure

```
/root/
├── mp-base-game-test/     # Test environment (auto-deploys on main push)
├── mp-base-game/          # Production environment (manual deploy)
├── backup-*/              # Automatic test backups
└── prod-backup-*/         # Automatic production backups
```

## Environment Files to Create

### `/root/mp-base-game-test/.env` (Test)
```bash
NODE_ENV=test
PORT=3000
SESSION_SECRET=your-test-secret-here
# DATABASE_URL=postgresql://testuser:testpass@localhost:5432/testgame
# Leave DATABASE_URL commented out to use in-memory storage
```

### `/root/mp-base-game/.env` (Production)
```bash
NODE_ENV=production
PORT=3001
SESSION_SECRET=your-strong-production-secret-here
# DATABASE_URL=postgresql://produser:prodpass@localhost:5432/prodgame
# Leave DATABASE_URL commented out to use in-memory storage initially
```

## Quick Setup Commands

Run these on your Linode server:

```bash
# Ensure directories exist
mkdir -p /root/mp-base-game-test /root/mp-base-game

# Clone your repo to both locations (replace with your actual repo URL)
cd /root/mp-base-game-test
git clone https://github.com/yourusername/your-repo-name.git .

cd /root/mp-base-game
git clone https://github.com/yourusername/your-repo-name.git .

# Install dependencies in both
cd /root/mp-base-game-test && npm install
cd /root/mp-base-game && npm install

# Create environment files with the content above
nano /root/mp-base-game-test/.env
nano /root/mp-base-game/.env
```

## Test Your Setup

1. **Add the 5 GitHub secrets** with your actual values
2. **Push a commit to main branch** → Should auto-deploy to test
3. **Check test deployment**: `ssh root@your-ip "pm2 status"`
4. **Manually trigger production** when ready via GitHub Actions

## Access Your Applications

- **Test**: `http://your-server-ip:3000`
- **Production**: `http://your-server-ip:3001`
- **Health Check**: `http://your-server-ip:3000/health` (test) or `:3001/health` (prod)

Your setup is now configured for your specific server paths! 🚀
