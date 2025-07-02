# PM2 and Nginx Troubleshooting Guide

## Common Issues and Solutions

### 1. PM2 Process Errors

#### Problem: `mp-base-game-test` shows as "errored"
```bash
# Check PM2 logs for details
pm2 logs mp-base-game-test

# Common fixes:
pm2 delete mp-base-game-test
pm2 start config/ecosystem.test.json

# If port conflict:
pm2 delete all
pm2 start config/ecosystem.test.json
pm2 start config/ecosystem.production.json
```

#### Problem: Multiple processes with similar names
```bash
# List all processes
pm2 list

# Delete duplicates
pm2 delete mp-base-game-test
pm2 delete multiplayer-game

# Start with proper config
pm2 start config/ecosystem.test.json
pm2 start config/ecosystem.production.json
```

### 2. Nginx 502 Bad Gateway

#### Check if the app is running on the correct port
```bash
# Test direct access to the app
curl http://localhost:3001/health  # for test
curl http://localhost:3000/health  # for production

# If no response, check PM2 status
pm2 status
pm2 logs
```

#### Common Nginx Configuration Issues

1. **Incorrect upstream port**
   ```nginx
   # In /etc/nginx/sites-available/mp-game
   upstream backend {
       server 127.0.0.1:3001;  # Should match PORT in ecosystem file
   }
   ```

2. **Missing location blocks**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Serve static files directly
       location /static/ {
           alias /path/to/project/frontend/public/;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
       
       # Proxy API and socket requests
       location / {
           proxy_pass http://backend;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Test Nginx configuration**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 3. Environment and Path Issues

#### Ensure environment files are loaded correctly
```bash
# Check if environment variables are loaded
pm2 show mp-base-game-test
pm2 show mp-base-game

# Restart with fresh environment
pm2 restart config/ecosystem.test.json --update-env
pm2 restart config/ecosystem.production.json --update-env
```

#### Verify file paths in ecosystem config
```bash
# From project root, check paths exist:
ls -la backend/server.js
ls -la config/.env.test
ls -la config/.env.production
ls -la logs/
```

### 4. Port Conflicts

#### Check what's using the ports
```bash
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :3000

# Kill processes if needed
sudo kill -9 <PID>
```

#### Update ports if needed
```bash
# Edit ecosystem files
nano config/ecosystem.test.json    # PORT: 3001
nano config/ecosystem.production.json  # PORT: 3000

# Update Nginx upstream accordingly
sudo nano /etc/nginx/sites-available/mp-game
```

### 5. Complete Reset Procedure

If everything is broken, start fresh:

```bash
# 1. Stop all PM2 processes
pm2 delete all

# 2. Check no processes are listening
sudo netstat -tlnp | grep :300

# 3. Start fresh
pm2 start config/ecosystem.test.json
pm2 start config/ecosystem.production.json

# 4. Verify
pm2 status
curl http://localhost:3001/health
curl http://localhost:3000/health

# 5. Test Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Backup Folder Organization

All backups should go in the project's `/backups/` directory or a dedicated system location:

```bash
# Create system backup directory (recommended for production)
sudo mkdir -p /var/backups/mp-game

# Update backup paths in deployment scripts
# Point all backup operations to /var/backups/mp-game
```

### 7. Monitoring Commands

```bash
# Real-time monitoring
pm2 monit

# Check logs
pm2 logs --lines 50

# Check specific app
pm2 logs mp-base-game-test --lines 20

# Restart problematic app
pm2 restart mp-base-game-test

# Save PM2 configuration
pm2 save
```

### 8. Database Connection Issues

If registration isn't persisting:

```bash
# Check database connectivity
psql -h localhost -U mp_game_user mp_game_test
psql -h localhost -U mp_game_user mp_game_prod

# Test database status via API
curl http://localhost:3001/health
curl http://localhost:3000/health
```

## Quick Diagnostic Checklist

1. ✅ PM2 processes running without errors
2. ✅ Apps responding on correct ports (3001 test, 3000 prod)
3. ✅ Nginx configuration syntax valid
4. ✅ Nginx pointing to correct upstream ports
5. ✅ Environment files loaded correctly
6. ✅ Database connections working
7. ✅ No port conflicts
8. ✅ Logs showing no critical errors
