# 🚀 Next Steps - Deployment Checklist

## ✅ **CURRENT STATUS**

Your server is now **100% Passenger-safe** and ready for deployment.

---

## 📋 **STEP-BY-STEP DEPLOYMENT GUIDE**

### **STEP 1: Test Locally (VERIFY IT WORKS)**

```bash
cd "D:\Nouveau dossier\projet-kamel\backend"
npm start
```

**Expected Output:**
```
Passenger boot OK on port 5000
✅ Routes loaded successfully
```

**Test the root route:**
```bash
curl http://localhost:5000/
```

**Expected:** `<h1>Application OK</h1>`

**Test health:**
```bash
curl http://localhost:5000/health
```

**Expected:** JSON with status "ok"

**If these work → Proceed to Step 2**

---

### **STEP 2: Prepare Files for Upload**

1. **Ensure `.env` file exists** with:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_jwt_secret
   ```

2. **Generate Prisma client** (if not done):
   ```bash
   npx prisma generate
   ```

3. **Test that routes load** (should see "✅ Routes loaded successfully")

---

### **STEP 3: Upload to Server**

Upload your entire `backend/` directory to:
```
/home/USERNAME/newbackend/backend
```

**Files to upload:**
- ✅ `server.js` (Passenger-safe)
- ✅ `package.json`
- ✅ `src/` directory
- ✅ `.env` file (with your config)
- ✅ `prisma/` directory
- ✅ `node_modules/` (or run `npm install` on server)

---

### **STEP 4: Configure in cPanel**

1. **Go to cPanel → Node.js App Manager**
2. **Create/Edit Application** with these settings:

   | Field | Value |
   |-------|-------|
   | **Node.js version** | `24.6.0` (or available 24.x) |
   | **Application mode** | `Production` |
   | **Application root** | `newbackend/backend` |
   | **Application URL** | `backend.rootsmaghreb.com` |
   | **Application startup file** | `server.js` |
   | **Passenger log file** | `/home/USERNAME/logs/passenger.log` |

3. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `5000`

4. **Click "CREATE" or "SAVE"**

---

### **STEP 5: Install Dependencies on Server**

**SSH into your server:**
```bash
ssh USERNAME@your-server.com
cd ~/newbackend/backend
npm install --production
npx prisma generate
```

**OR use nodevenv:**
```bash
cd ~/newbackend/backend
~/nodevenv/newbackend/backend/24/bin/npm install --production
~/nodevenv/newbackend/backend/24/bin/npx prisma generate
```

---

### **STEP 6: Restart Application**

**In cPanel:**
- Click **"RESTART"** button

**OR via SSH:**
```bash
cd ~/newbackend/backend
mkdir -p tmp
touch tmp/restart.txt
```

---

### **STEP 7: Verify Deployment**

**Test root route:**
```bash
curl https://backend.rootsmaghreb.com/
```

**Expected:** `<h1>Application OK</h1>` with HTTP 200

**Test health:**
```bash
curl https://backend.rootsmaghreb.com/health
```

**Expected:** JSON with status "ok"

**Test API:**
```bash
curl https://backend.rootsmaghreb.com/api/info
```

**Expected:** JSON with API information

---

### **STEP 8: Check Logs (If Issues)**

**View Passenger logs:**
```bash
tail -50 ~/logs/passenger.log
```

**Look for:**
- ✅ "Passenger boot OK"
- ✅ "Routes loaded successfully"
- ❌ NO "process.exit"
- ❌ NO database connection errors at startup

---

## 🎯 **SUCCESS INDICATORS**

You'll know it's working when:

1. ✅ cPanel shows **"Application Status: Running"**
2. ✅ Root URL returns `<h1>Application OK</h1>`
3. ✅ No 500 errors on startup
4. ✅ Health endpoint returns JSON
5. ✅ API routes work (when DB is available)

---

## 🐛 **TROUBLESHOOTING**

### If you get 500 error:

1. **Check Passenger logs:**
   ```bash
   tail -50 ~/logs/passenger.log
   ```

2. **Common fixes:**
   - Missing `npx prisma generate` → Run it
   - Wrong application root → Check cPanel config
   - Missing `.env` file → Create it
   - Node version mismatch → Check cPanel Node.js version

3. **Verify Prisma is lazy:**
   - Server should start without DB connection
   - Only connects when API route is accessed

---

## 📊 **QUICK REFERENCE**

### **Local Development:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### **Production (Passenger):**
- Server managed by Passenger
- Port set via `PORT` environment variable
- Root route: `https://backend.rootsmaghreb.com/`

---

## ✅ **READY TO DEPLOY**

Your server is now:
- ✅ Passenger-safe
- ✅ Never crashes on startup
- ✅ Lazy-loads database
- ✅ Returns HTML on root route
- ✅ Handles all errors gracefully

**Next action:** Test locally, then deploy to server!

---

**Last Updated:** 2025-01-18
