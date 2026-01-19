# 🚀 How to Start the Backend Server

## Quick Start

```bash
cd backend
npm start
```

**The server will now:**
- ✅ Start on port 5000 (or PORT from .env)
- ✅ Stay running (won't stop on errors)
- ✅ Handle all errors gracefully
- ✅ Show clear startup messages
- ✅ Check if port is already in use

---

## ✅ What Was Fixed

### 1. **Server Won't Stop on Errors** ✅
- Enhanced error handling prevents crashes
- Uncaught exceptions are logged but don't exit
- Unhandled rejections are logged but don't exit
- Server keeps running even if routes fail to load

### 2. **Port Conflict Detection** ✅
- Checks if port 5000 is already in use
- Shows helpful error message if port is busy
- Provides commands to find the process using the port

### 3. **Better Startup Messages** ✅
- Clear visual indicators when server starts
- Shows all available endpoints
- Better error messages

### 4. **Graceful Shutdown** ✅
- Only exits on explicit Ctrl+C
- Graceful shutdown with 10-second timeout
- Proper cleanup

---

## 🔧 Troubleshooting ERR_CONNECTION_REFUSED

### Problem: `ERR_CONNECTION_REFUSED`
This means the backend server is not running or not accessible.

### Solution Steps:

#### 1. **Start the Server**
```bash
cd backend
npm start
```

You should see:
```
═══════════════════════════════════════════════════════
🚀  BACKEND SERVER STARTED SUCCESSFULLY
═══════════════════════════════════════════════════════
📡  Server running on: http://localhost:5000
🌐  API available at: http://localhost:5000/api
❤️   Health check: http://localhost:5000/api/health
💾  DB Health: http://localhost:5000/api/db-health
═══════════════════════════════════════════════════════
```

#### 2. **Check if Port is Already in Use**

**Windows:**
```powershell
netstat -ano | findstr :5000
```

**Linux/Mac:**
```bash
lsof -i :5000
```

If port is in use, either:
- Stop the other process
- Or change PORT in `.env` file

#### 3. **Check if Server is Running**

**Windows:**
```powershell
Get-Process node
```

**Linux/Mac:**
```bash
ps aux | grep node
```

#### 4. **Test Server Connection**

Open a new terminal and test:
```bash
curl http://localhost:5000/
```

Should return: `OK`

Or test API:
```bash
curl http://localhost:5000/api/health
```

Should return JSON with status.

---

## 🛠️ Common Issues & Fixes

### Issue 1: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Fix:**
1. Find the process: `netstat -ano | findstr :5000` (Windows)
2. Kill it: `taskkill /PID <PID> /F` (Windows)
3. Or change PORT in `.env` to a different port (e.g., 5001)

### Issue 2: Module Not Found
**Error:** `Cannot find module 'express'`

**Fix:**
```bash
cd backend
npm install
```

### Issue 3: Database Connection Errors
**Error:** Database connection fails

**Fix:**
- Server will still start (lazy loading)
- API routes may fail, but server won't crash
- Check `.env` file for correct DATABASE_URL

### Issue 4: Routes Fail to Load
**Error:** `API lazy-load failed`

**Fix:**
- Check console for specific error
- Verify all route files exist
- Check for syntax errors in route files
- Server will still run, but API will return 503

---

## 📋 Environment Variables

Create/check `.env` file in `backend/` directory:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="your-secret-key-here"
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

---

## ✅ Verification Checklist

After starting the server, verify:

- [ ] Server shows startup message
- [ ] No errors in console
- [ ] `curl http://localhost:5000/` returns `OK`
- [ ] `curl http://localhost:5000/api/health` returns JSON
- [ ] Frontend can connect to `http://localhost:5000/api`
- [ ] Server stays running (doesn't exit)

---

## 🎯 Quick Commands

```bash
# Start server
npm start

# Start in development mode (same as npm start)
npm run dev

# Check if server is running
curl http://localhost:5000/api/health

# Stop server
# Press Ctrl+C in the terminal where server is running
```

---

**Status:** ✅ Server is now configured to run continuously and handle errors gracefully!
