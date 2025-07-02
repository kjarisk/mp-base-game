# 🎮 Multiplayer Game - Quick Start

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start development server (in-memory storage)
npm run dev

# Visit http://localhost:3000
```

## 🖥️ Server Deployment (PM2 + Nginx)

### Quick Fix Everything:
```bash
# On your server
cd /path/to/project
./scripts/server-fix.sh full-fix
```

### Manual Setup:
```bash
# Install dependencies
npm install

# Start applications
pm2 start config/ecosystem.test.json     # Port 3001
pm2 start config/ecosystem.production.json # Port 3000

# Check status
pm2 status
curl http://localhost:3001/health
curl http://localhost:3000/health
```

## 🗄️ Database Setup (Optional)

### Development (In-Memory)
Leave `DATABASE_URL` commented out in `.env` - uses in-memory storage.

### Production (PostgreSQL)
```bash
# 1. Install PostgreSQL
sudo apt install postgresql

# 2. Create database and user
sudo -u postgres psql
CREATE DATABASE mp_game_prod;
CREATE USER mp_game_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE mp_game_prod TO mp_game_user;

# 3. Update config/.env.production
DATABASE_URL=postgresql://mp_game_user:your-password@localhost:5432/mp_game_prod
```

## 🔧 Configuration

### Environment Files (Server/Database):
- `config/.env.test` - Test environment
- `config/.env.production` - Production environment

### Game Configuration (Rules/Balance):
- `shared/gameConfig.js` - All game settings
- Frontend gets config from `/api/game/config`

## 📂 Project Structure

```
├── backend/         # Server code
├── frontend/public/ # Client code  
├── config/         # Environment configs
├── shared/         # Shared constants
└── scripts/        # Management scripts
```

## 🛠️ Management Scripts

```bash
# Server management
npm run server:fix        # Fix all server issues
npm run server:status     # Check status

# Database backups
npm run backup:init       # Setup backup system
npm run backup:create     # Create backup
```

## 🆘 Common Issues

### PM2 Process Errors:
```bash
pm2 delete all
pm2 start config/ecosystem.test.json
pm2 start config/ecosystem.production.json
```

### 502 Bad Gateway:
1. Check PM2 processes are running
2. Verify Nginx points to correct ports
3. Run `./scripts/server-fix.sh full-fix`

### Module Not Found:
```bash
cd /path/to/project
npm install
pm2 restart all
```

## 🚢 Deployment Workflow

1. **Local Development** → Test features
2. **Push to main** → Auto-deploys to test server
3. **Manual promotion** → Deploy to production when ready

---

That's it! This covers 90% of what you need. For detailed setup, check the individual files in `/docs/` if needed.
