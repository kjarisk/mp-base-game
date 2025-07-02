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

## 📋 **Expected Result:**
```
┌─────┬──────────────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name                 │ namespace   │ version │ mode    │ pid      │
├─────┼──────────────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ mp-base-game-test    │ default     │ 1.0.0   │ fork    │ 12345    │
│ 1   │ mp-base-game         │ default     │ 1.0.0   │ cluster │ 12346    │
└─────┴──────────────────────┴─────────────┴─────────┴─────────┴──────────┘
```
