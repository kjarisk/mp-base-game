# 🚨 Deployment Troubleshooting Guide

## Common GitHub Actions Errors & Solutions

### ❌ Error: "Cannot find module 'dotenv'"

**Problem**: Missing `dotenv` dependency
**Solution**: 
```bash
npm install dotenv
git add package.json package-lock.json
git commit -m "Add missing dotenv dependency"
git push
```
**Status**: ✅ **FIXED** - Added to dependencies

### ❌ Error: "Cannot find module 'pg'"

**Problem**: Missing PostgreSQL driver
**Solution**: Already included in dependencies
**Status**: ✅ **READY**

### ❌ Error: "Permission denied" during deployment

**Problem**: SSH key not set up correctly
**Solution**: 
1. Check GitHub secrets are set correctly
2. Verify SSH key has access to server
3. Test: `ssh root@your-server-ip "echo 'SSH works'"`

### ❌ Error: "Port already in use"

**Problem**: Previous process still running
**Solution**: 
```bash
# On server
pm2 kill
# Or find and kill specific process
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### ❌ Error: "Health check failed"

**Problem**: Server not starting properly
**Solution**:
```bash
# Check logs on server
pm2 logs
# Check if directories exist
ls -la /root/mp-base-game-test
ls -la /root/mp-base-game
```

### ❌ Error: "git pull failed"

**Problem**: Repository not cloned or wrong permissions
**Solution**:
```bash
# On server, re-clone if needed
cd /root
rm -rf mp-base-game-test mp-base-game
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git mp-base-game-test
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git mp-base-game
```

## 🔍 Debug Commands

### Check GitHub Actions Status
- Go to your repository → Actions tab
- Click on the failed workflow
- Check the logs for specific error messages

### Check Server Status
```bash
# SSH into server
ssh root@your-server-ip

# Check PM2 processes
pm2 status
pm2 logs

# Check if ports are free
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Check disk space
df -h

# Check if Node.js is installed
node --version
npm --version
```

### Test Manual Deployment
```bash
# On server
cd /root/mp-base-game-test
git pull origin main
npm ci
npm start &

# Wait and test
sleep 5
curl http://localhost:3000/health

# Stop test
pkill -f "node backend/server.js"
```

## 📋 Pre-Deployment Checklist

Before pushing to main, ensure:

- [ ] All dependencies installed (`npm install`)
- [ ] Tests passing locally (`npm test`)
- [ ] No syntax errors in code
- [ ] Environment files updated if needed
- [ ] GitHub secrets configured correctly

## 🛠️ Required GitHub Secrets

Verify these are set in your repository:

```
DEPLOY_KEY   = Your SSH private key
LINODE_HOST  = Your server IP address  
LINODE_USER  = root
TEST_PATH    = /root/mp-base-game-test
PROD_PATH    = /root/mp-base-game
```

## 🎯 Quick Fix Commands

### Reset Everything on Server
```bash
# Nuclear option - reset all processes and redeploy
pm2 kill
cd /root
rm -rf mp-base-game-test mp-base-game
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git mp-base-game-test
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git mp-base-game
cd mp-base-game-test && npm install
cd /root/mp-base-game && npm install
```

### Test Local Changes Before Pushing
```bash
# Always test locally first
npm test
npm start &
sleep 5
curl http://localhost:3000/health
pkill -f "node backend/server.js"
```

## 💡 Prevention Tips

1. **Test Locally First**: Always run `npm test` before pushing
2. **Check Dependencies**: Ensure all `require()` statements have corresponding packages
3. **Environment Variables**: Use in-memory storage for development
4. **Small Commits**: Push small changes to isolate issues
5. **Monitor Logs**: Check GitHub Actions logs immediately after pushing

Your deployment should now work smoothly! 🚀
