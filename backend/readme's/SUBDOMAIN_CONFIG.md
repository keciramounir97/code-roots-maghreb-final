# 🌐 Subdomain Configuration Guide

## ✅ **RECOMMENDED: Use `backend.rootsmaghreb.com`**

### **Why `backend` and not `server`?**

1. ✅ **Frontend is already configured** - Your `frontend/src/api/client.js` uses `https://backend.rootsmaghreb.com` in production
2. ✅ **Standard convention** - `backend` is more descriptive than `server`
3. ✅ **Clear separation** - Frontend on `rootsmaghreb.com`, backend on `backend.rootsmaghreb.com`

---

## 📋 **Configuration Summary**

### **Frontend Configuration:**
```js
// frontend/src/api/client.js (Line 28)
return "https://backend.rootsmaghreb.com";
```

### **Backend CORS Configuration:**
```js
// backend/src/config/env.js
allowedOrigins: [
  "https://rootsmaghreb.com",
  "https://www.rootsmaghreb.com",
  "https://backend.rootsmaghreb.com", // ✅ Added
  // ... localhost for dev
]
```

---

## 🚀 **Deployment Steps**

### **1. Create Subdomain in cPanel:**
- Go to **Subdomains** in cPanel
- Create: `backend`
- Document Root: `/public_html/backend` (or your backend folder)
- ✅ This creates: `backend.rootsmaghreb.com`

### **2. Deploy Backend:**
- Upload backend files to `/public_html/backend/`
- Set up Passenger (Node.js app)
- Point Passenger to `backend/` directory

### **3. Configure Environment Variables:**
```bash
# In cPanel or .env file
CORS_ORIGIN=https://rootsmaghreb.com,https://www.rootsmaghreb.com,https://backend.rootsmaghreb.com
PORT=5000  # Or let Passenger handle it
NODE_ENV=production
```

### **4. SSL Certificate:**
- cPanel usually auto-configures SSL for subdomains
- Verify: `https://backend.rootsmaghreb.com` works

---

## ✅ **Verification Checklist**

- [ ] Subdomain `backend.rootsmaghreb.com` created in cPanel
- [ ] Backend deployed to subdomain directory
- [ ] Passenger configured for Node.js app
- [ ] SSL certificate active (https://)
- [ ] CORS includes `https://rootsmaghreb.com` and `https://www.rootsmaghreb.com`
- [ ] Frontend API client points to `https://backend.rootsmaghreb.com`
- [ ] Test: `curl https://backend.rootsmaghreb.com/` returns HTML
- [ ] Test: `curl https://backend.rootsmaghreb.com/api/info` returns JSON

---

## 🔍 **Alternative: If You Want `server.rootsmaghreb.com`**

If you prefer `server` instead of `backend`, you need to:

1. **Update Frontend:**
   ```js
   // frontend/src/api/client.js (Line 28)
   return "https://server.rootsmaghreb.com";
   ```

2. **Update CORS:**
   ```js
   // backend/src/config/env.js
   "https://server.rootsmaghreb.com",
   ```

3. **Create subdomain:** `server` in cPanel

---

## 🎯 **RECOMMENDATION**

**Use `backend.rootsmaghreb.com`** because:
- ✅ Already configured in your frontend
- ✅ More descriptive and professional
- ✅ Standard naming convention
- ✅ Less confusion (server could mean anything)

---

**Status:** ✅ Ready to deploy with `backend.rootsmaghreb.com`
