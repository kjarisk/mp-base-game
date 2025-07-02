# 🚀 Linode Server Setup Checklist

You need to do **initial setup once** on your Linode server before GitHub Actions can work. After this, everything is automated!

## ✅ Step-by-Step Setup (Do Once)

### Step 1: Server Prerequisites
```bash
# SSH into your Linode server
ssh root@your-server-ip

# Update system packages
apt update && apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Verify Node.js installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install PM2 globally
npm install -g pm2

# Install Git (if not already installed)
apt install git -y
```

### Step 2: Create Directory Structure
```bash
# Create your deployment directories
mkdir -p /root/mp-base-game-test
mkdir -p /root/mp-base-game
mkdir -p /root/logs
```

### Step 3: Initial Repository Clone
```bash
# Clone your repository to test environment
cd /root/mp-base-game-test
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git .

# Clone your repository to production environment  
cd /root/mp-base-game
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git .
```

### Step 4: Install Dependencies
```bash
# Install dependencies in test environment
cd /root/mp-base-game-test
npm install

# Install dependencies in production environment
cd /root/mp-base-game
npm install
```

### Step 5: Create Environment Files

**Test Environment (.env):**
```bash
# Create test environment file
cat > /root/mp-base-game-test/.env << 'EOF'
NODE_ENV=test
PORT=3000
SESSION_SECRET=your-test-secret-change-me
# DATABASE_URL=postgresql://testuser:testpass@localhost:5432/testgame
# Leave DATABASE_URL commented for in-memory storage
EOF
```

**Production Environment (.env):**
```bash
# Create production environment file
cat > /root/mp-base-game/.env << 'EOF'
NODE_ENV=production
PORT=3001
SESSION_SECRET=your-super-strong-production-secret-here
# DATABASE_URL=postgresql://produser:prodpass@localhost:5432/prodgame
# Leave DATABASE_URL commented for in-memory storage initially
EOF
```

### Step 6: Setup SSH Key for GitHub Actions
```bash
# On your LOCAL machine (not server), generate deploy key
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""

# Copy public key to your server
ssh-copy-id -i ~/.ssh/deploy_key.pub root@your-server-ip

# Display private key to copy to GitHub secrets
cat ~/.ssh/deploy_key
# Copy this output to GitHub secrets as DEPLOY_KEY
```

### Step 7: Test Manual Deployment
```bash
# On server: Test that everything works manually
cd /root/mp-base-game-test
npm start &

# Check if it starts (wait 5 seconds)
sleep 5
curl http://localhost:3000/health

# If successful, stop it
pkill -f "node backend/server.js"
```

### Step 8: Setup GitHub Secrets
In your GitHub repository, add these secrets (Settings → Secrets and variables → Actions):

```
DEPLOY_KEY   = [Content of ~/.ssh/deploy_key from step 6]
LINODE_HOST  = [Your server IP address]
LINODE_USER  = root
TEST_PATH    = /root/mp-base-game-test
PROD_PATH    = /root/mp-base-game
```

## 🎯 What GitHub Actions Will Handle (Automated)

After your initial setup, GitHub Actions will automatically:

✅ **On every push to main:**
- Pull latest code to test environment
- Install/update dependencies
- Restart test application
- Perform health checks
- Create backups before deployment

✅ **On manual production promotion:**
- Pull latest code to production environment
- Install production dependencies
- Restart production application
- Perform health checks with retries
- Create production backups

## 🔧 Optional: PostgreSQL Setup

If you want persistent database storage (recommended for production):

```bash
# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Setup databases
sudo -u postgres psql << 'EOF'
CREATE DATABASE testgame;
CREATE USER testuser WITH PASSWORD 'strong_test_password';
GRANT ALL PRIVILEGES ON DATABASE testgame TO testuser;

CREATE DATABASE prodgame;
CREATE USER produser WITH PASSWORD 'very_strong_prod_password';
GRANT ALL PRIVILEGES ON DATABASE prodgame TO produser;
\q
EOF

# Update environment files with real DATABASE_URL values
# Test: postgresql://testuser:strong_test_password@localhost:5432/testgame
# Prod: postgresql://produser:very_strong_prod_password@localhost:5432/prodgame
```

## 🚦 Test Your Setup

1. **Complete steps 1-8 above**
2. **Push a commit to main branch** → Should trigger test deployment
3. **Check deployment**: `ssh root@your-ip "pm2 status"`
4. **Test application**: `http://your-server-ip:3000`
5. **Check logs**: `ssh root@your-ip "pm2 logs mp-base-game-test"`

## 🆘 If Something Goes Wrong

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs mp-base-game-test
pm2 logs mp-base-game

# Restart applications
pm2 restart mp-base-game-test
pm2 restart mp-base-game

# Check if ports are available
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
```

## ✨ After Initial Setup

Once you complete this checklist **once**, everything else is automated:

- **Development**: Work locally, push to main
- **Testing**: Automatic deployment to test environment  
- **Production**: Manual promotion via GitHub Actions
- **Monitoring**: PM2 handles process management
- **Backups**: Automatic before each deployment

**You only need to do this setup once!** 🎉
