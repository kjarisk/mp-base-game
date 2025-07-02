# 🔧 Server Commands for Linode

## 🚀 **Quick Fix on Your Server:**

### **1. Navigate and Clean Up:**
```bash
# Navigate to your project
cd mp-base-game-test

# Clean PM2 processes
pm2 delete all
pm2 list  # Should show empty
```

### **2. Install Dependencies:**
```bash
npm install
```

### **3. Start Applications:**
```bash
# Start test environment (port 3001)
pm2 start config/ecosystem.test.json

# Start production environment (port 3000) 
cd ../mp-base-game
npm install
pm2 start config/ecosystem.production.json
```

### **4. Check Status:**
```bash
pm2 list
curl http://localhost:3001/health  # test
curl http://localhost:3000/health  # production
```

## 🛠️ **Auto-Fix Script:**
```bash
cd mp-base-game-test
chmod +x scripts/server-fix.sh
./scripts/server-fix.sh full-fix
```

## 🆘 **Common Issues:**

### **"Invalid package config" / Corrupted node_modules**
```bash
cd mp-base-game-test
pm2 delete all

# Remove corrupted node_modules
rm -rf node_modules package-lock.json

# Clean install
npm install

# Start again
pm2 start config/ecosystem.test.json
pm2 logs --lines 5
```

### **502 Bad Gateway (Nginx)**
```bash
# Check if app is actually running
curl http://localhost:3001/health

# If app is running but Nginx shows 502, check Nginx config
sudo nginx -t

# Check what port Nginx expects vs what app runs on
sudo cat /etc/nginx/sites-available/test-multiplayer.kjarisk.com | grep proxy_pass
sudo cat /etc/nginx/sites-available/multiplayer.kjarisk.com | grep proxy_pass

# Fix wrong port in test site (common issue)
sudo nano /etc/nginx/sites-available/test-multiplayer.kjarisk.com
# Change: proxy_pass http://localhost:4000;
# To:     proxy_pass http://localhost:3001;

# Then reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### **"Cannot find module 'dotenv'"**
```bash
cd mp-base-game-test
npm install
pm2 restart all
```

### **"Process not found"**
```bash
pm2 delete all
pm2 start config/ecosystem.test.json
pm2 start config/ecosystem.production.json
```

### **"Port already in use"**
```bash
sudo netstat -tlnp | grep :3001
sudo kill -9 <PID>
pm2 restart all
```

### **PM2 Shows "errored"**
```bash
pm2 logs <app-name>  # Check error details
pm2 restart <app-name>
```

### **Backup Management**
```bash
# Create backups locally (stores in ./backups/)
cd mp-base-game-test
./scripts/backup-manager.sh init      # Initialize backup directory
./scripts/backup-manager.sh backup test      # Backup test database
./scripts/backup-manager.sh list      # List available backups
./scripts/backup-manager.sh cleanup   # Remove old backups
```

### **Clean Up Existing Backup Folders (On Server)**
```bash
# SSH into your Linode server first
ssh root@your-server-ip

# You should now be in /root/ where you can see the backup folders
ls -la | grep backup

# Method 1: Move backups into project backups directory
mkdir -p mp-base-game-test/backups
mv backup-20250702-* mp-base-game-test/backups/

# OR Method 2: Create a dedicated backups folder at root level
mkdir -p backups
mv backup-20250702-* backups/

# Method 3: Direct removal (if you don't need the old backups)
rm -rf backup-20250702-*

# Verify cleanup worked
ls -la | grep backup  # Should show no backup folders at root level
ls -la mp-base-game-test/backups/  # Check if moved to project
# OR
ls -la backups/  # Check if moved to root-level backups folder
```

## 📋 **Expected Result:**
```
┌─────┬──────────────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name                 │ namespace   │ version │ mode    │ pid      │
├─────┼──────────────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ mp-base-game-test    │ default     │ 1.0.0   │ fork    │ 12345    │
│ 1   │ mp-base-game         │ default     │ 1.0.0   │ cluster │ 12346    │
└─────┴──────────────────────┴─────────────┴─────────┴─────────┴──────────┘
```
