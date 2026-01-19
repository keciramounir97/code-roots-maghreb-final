# 🔥 CRITICAL CPANEL DEPLOYMENT CHECKLIST

## ⚠️ **DO THESE STEPS IN ORDER - DO NOT SKIP**

---

## 1️⃣ **cPanel → Setup Node.js App**

### **Required Settings:**

```
Application root: /home/username/public_html/backend
  (or wherever your backend folder is)

Startup file: server.js
  (MUST be exactly: server.js)

Application mode: production

Node.js version: 18.x or 20.x
  (Check: node --version in cPanel terminal)
```

### **⚠️ CRITICAL:**
- ✅ Startup file MUST be `server.js` (not `app.js`, not `index.js`)
- ✅ Application root MUST point to folder containing `server.js`
- ✅ Application mode MUST be `production`

---

## 2️⃣ **DELETE THESE ENVIRONMENT VARIABLES (IF THEY EXIST)**

### **In cPanel Node.js App Settings:**

**DELETE these if present:**
```
PORT=5000      ❌ DELETE
HOST=0.0.0.0   ❌ DELETE
```

### **Why?**
- Passenger **automatically injects PORT** - you don't set it
- Setting PORT manually causes `EADDRINUSE` errors
- Passenger manages the server - you don't call `app.listen()`

### **✅ KEEP these (if needed):**
```
NODE_ENV=production
DATABASE_URL=mysql://...
JWT_SECRET=your-secret
CORS_ORIGIN=https://rootsmaghreb.com,https://www.rootsmaghreb.com
```

---

## 3️⃣ **Check Passenger Logs**

### **Access logs:**
```bash
# In cPanel Terminal or SSH
cat ~/logs/passenger.log
# or
tail -f ~/logs/passenger.log
```

### **🔍 What to Look For:**

#### **✅ GOOD SIGNS:**
```
Passenger boot OK
✅ Routes loaded successfully
Application started
```

#### **❌ BAD SIGNS:**

**1. EADDRINUSE Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Cause:** You have `app.listen()` in server.js or PORT env var set
**Fix:** Remove `app.listen()` and PORT env var (Passenger manages server)

**2. PrismaClientInitializationError:**
```
PrismaClientInitializationError: Can't reach database server
```
**Cause:** Routes loading too early (before lazy-load)
**Fix:** Routes are now lazy-loaded - this should not happen

**3. Module not found:**
```
Error: Cannot find module './src/routes'
```
**Cause:** Missing `src/routes/index.js` file
**Fix:** Ensure `src/routes/index.js` exists and exports function

**4. Application check failed:**
```
Application check failed: The application did not respond in time
```
**Cause:** Server taking too long to start (async operations at top level)
**Fix:** All startup is now synchronous - this should not happen

---

## 4️⃣ **Verify Server Structure**

### **Required Files:**
```
backend/
├── server.js              ✅ MUST EXIST (startup file)
├── package.json           ✅ MUST EXIST
├── node_modules/          ✅ MUST EXIST (run npm install)
└── src/
    ├── routes/
    │   └── index.js        ✅ MUST EXIST (lazy routes loader)
    ├── lib/
    │   └── prisma.js      ✅ MUST EXIST (lazy Prisma)
    └── config/
        └── env.js         ✅ MUST EXIST
```

---

## 5️⃣ **Test Endpoints**

### **After deployment, test these:**

```bash
# 1. Root endpoint (Passenger health check)
curl https://backend.rootsmaghreb.com/
# Expected: <h1>OK</h1>

# 2. API health
curl https://backend.rootsmaghreb.com/api/health
# Expected: {"ok":true}

# 3. API info (after routes load)
curl https://backend.rootsmaghreb.com/api/info
# Expected: JSON with API info
```

---

## 6️⃣ **Common Issues & Fixes**

### **Issue: "Application check failed"**

**Symptoms:**
- cPanel shows "Application check failed"
- Passenger log shows timeout

**Causes:**
1. ❌ `app.listen()` in server.js
2. ❌ Async operations at top level
3. ❌ Prisma connecting at startup
4. ❌ Routes loading synchronously with DB connections

**Fixes:**
- ✅ Remove `app.listen()` (Passenger manages server)
- ✅ All startup code is synchronous
- ✅ Prisma is lazy-loaded (no connection at startup)
- ✅ Routes load lazily (on first API request)

---

### **Issue: "EADDRINUSE" Error**

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use
```

**Causes:**
1. ❌ `PORT=5000` in environment variables
2. ❌ `app.listen(PORT)` in server.js

**Fixes:**
- ✅ Delete `PORT` env var from cPanel
- ✅ Remove `app.listen()` from server.js
- ✅ Passenger injects PORT automatically

---

### **Issue: Routes Not Loading**

**Symptoms:**
- `/api/health` works
- `/api/auth/login` returns 503

**Causes:**
1. ❌ Missing `src/routes/index.js`
2. ❌ Routes file has syntax errors
3. ❌ Prisma import fails

**Fixes:**
- ✅ Ensure `src/routes/index.js` exists
- ✅ Check syntax: `node -c src/routes/index.js`
- ✅ Prisma is lazy-loaded (should not fail at startup)

---

## 7️⃣ **Final Verification**

### **Checklist:**

- [ ] Node.js app created in cPanel
- [ ] Startup file: `server.js`
- [ ] Application root: correct path
- [ ] `PORT` env var deleted (if existed)
- [ ] `HOST` env var deleted (if existed)
- [ ] `npm install` run in backend folder
- [ ] Passenger log shows "Passenger boot OK"
- [ ] Root endpoint returns HTML
- [ ] API health endpoint works
- [ ] API routes load on first request

---

## 8️⃣ **Quick Test Script**

```bash
# Run in cPanel Terminal (in backend folder)
node -e "
  console.log('Testing server.js...');
  const app = require('./server.js');
  console.log('✅ server.js loads successfully');
  console.log('✅ App exported:', typeof app);
  console.log('✅ No app.listen() call');
"
```

**Expected output:**
```
Testing server.js...
Passenger boot OK
✅ server.js loads successfully
✅ App exported: function
✅ No app.listen() call
```

---

## ✅ **SUCCESS INDICATORS**

When everything is correct, you should see:

1. ✅ cPanel shows "Application running"
2. ✅ Passenger log: "Passenger boot OK"
3. ✅ `curl https://backend.rootsmaghreb.com/` returns HTML
4. ✅ `curl https://backend.rootsmaghreb.com/api/health` returns JSON
5. ✅ First API request loads routes (check logs)
6. ✅ No errors in Passenger log

---

## 🚨 **IF STILL FAILING**

1. **Check Passenger log:**
   ```bash
   tail -50 ~/logs/passenger.log
   ```

2. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be 18.x or 20.x

3. **Verify file structure:**
   ```bash
   ls -la server.js
   ls -la src/routes/index.js
   ```

4. **Test locally first:**
   ```bash
   node server.js
   ```
   Should print "Passenger boot OK" and exit (no server start)

---

**Status:** ✅ Ready for deployment
