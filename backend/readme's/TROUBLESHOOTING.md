# 🔧 Troubleshooting ERR_CONNECTION_REFUSED

## Understanding the Error

`ERR_CONNECTION_REFUSED` means:
- ❌ The backend server is **not running**
- ❌ The server **crashed** or **stopped**
- ❌ The **port is blocked** or **in use by another process**
- ❌ **Firewall** is blocking the connection

---

## ✅ Quick Fix

### Step 1: Start the Server
```bash
cd backend
npm start
```

**Expected Output:**
```
═══════════════════════════════════════════════════════
🚀  BACKEND SERVER STARTED SUCCESSFULLY
═══════════════════════════════════════════════════════
📡  Server running on: http://localhost:5000
🌐  API available at: http://localhost:5000/api
❤️   Health check: http://localhost:5000/api/health
💾  DB Health: http://localhost:5000/api/db-health
═══════════════════════════════════════════════════════

✅ Server is ready to accept connections
⚠️  Press Ctrl+C to stop the server
```

### Step 2: Verify Server is Running
Open a **new terminal** and run:
```bash
npm run check
```

Or test manually:
```bash
curl http://localhost:5000/
```

Should return: `OK`

---

## 🐛 Common Issues & Solutions

### Issue 1: Port Already in Use

**Error:**
```
❌ ERROR: Port 5000 is already in use!
```

**Solution:**

**Windows:**
```powershell
# Find the process
netstat -ano | findstr :5000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find the process
lsof -i :5000

# Kill the process
kill -9 <PID>
```

**OR** change the port in `.env`:
```env
PORT=5001
```

Then restart the server.

---

### Issue 2: Server Crashes Immediately

**Symptoms:**
- Server starts then immediately exits
- No error messages

**Solution:**

1. **Check for missing dependencies:**
```bash
cd backend
npm install
```

2. **Check for syntax errors:**
```bash
node -c server.js
node -c dev-server.js
```

3. **Check environment variables:**
```bash
# Make sure .env file exists
cat .env
```

4. **Run with verbose logging:**
```bash
NODE_ENV=development npm start
```

---

### Issue 3: Module Not Found

**Error:**
```
Cannot find module 'express'
```

**Solution:**
```bash
cd backend
npm install
```

---

### Issue 4: Database Connection Errors

**Note:** The server will **still start** even if the database is unavailable (lazy loading).

**Symptoms:**
- Server starts successfully
- `/api/health` works
- `/api/db-health` returns error
- API routes return 503

**Solution:**
- Check `.env` file for correct `DATABASE_URL`
- Verify database server is running
- Check database credentials

**The server will NOT crash** - it will just return errors for database-dependent routes.

---

### Issue 5: Routes Fail to Load

**Error:**
```
API lazy-load failed: ...
```

**Solution:**
1. Check console for specific error
2. Verify all route files exist in `src/routes/`
3. Check for syntax errors in route files
4. Verify controller files exist

**The server will still run** - API will return 503 but server won't crash.

---

## 🔍 Diagnostic Commands

### Check if Server is Running

**Windows:**
```powershell
Get-Process node
netstat -ano | findstr :5000
```

**Linux/Mac:**
```bash
ps aux | grep node
lsof -i :5000
```

### Test Server Connection

```bash
# Test root endpoint
curl http://localhost:5000/

# Test health endpoint
curl http://localhost:5000/api/health

# Test with verbose output
curl -v http://localhost:5000/api/health
```

### Check Server Logs

Look at the terminal where you ran `npm start` for error messages.

---

## ✅ Prevention Measures

The server is now configured to:

1. ✅ **Not crash on errors** - Handles all errors gracefully
2. ✅ **Check port availability** - Warns if port is in use
3. ✅ **Keep running** - Even if routes or database fail
4. ✅ **Show clear errors** - Helpful error messages
5. ✅ **Graceful shutdown** - Only exits on Ctrl+C

---

## 🚀 Quick Start Checklist

- [ ] Navigate to backend directory: `cd backend`
- [ ] Install dependencies: `npm install` (if needed)
- [ ] Check `.env` file exists with PORT=5000
- [ ] Start server: `npm start`
- [ ] Verify server shows startup message
- [ ] Test connection: `curl http://localhost:5000/`
- [ ] Check frontend can connect

---

## 📞 Still Having Issues?

1. **Check the terminal** where server is running for error messages
2. **Run diagnostic:** `npm run check`
3. **Check port:** Make sure nothing else is using port 5000
4. **Verify .env:** Make sure PORT is set correctly
5. **Check Node version:** Should be Node 18+ (check with `node -v`)

---

**The server is now configured to run continuously and handle errors gracefully!**
