# 🚀 GUIDE DE DÉPLOIEMENT - ÉTAPE PAR ÉTAPE

## 📋 **PRÉPARATION (Sur votre ordinateur)**

### **1. Vérifier que tout est prêt:**

```bash
# Dans le dossier backend/
cd backend
ls -la server.js          # ✅ Doit exister
ls -la src/routes/index.js # ✅ Doit exister
cat package.json          # ✅ Vérifier les dépendances
```

### **2. Tester localement (optionnel mais recommandé):**

```bash
# Tester que server.js se charge sans erreur
node -e "const app = require('./server.js'); console.log('✅ OK');"
```

---

## 🌐 **DÉPLOIEMENT SUR CPANEL**

### **ÉTAPE 1: Créer le sous-domaine**

1. Connectez-vous à **cPanel**
2. Allez dans **Subdomains** (Sous-domaines)
3. Créez un nouveau sous-domaine:
   - **Subdomain:** `backend`
   - **Document Root:** `/public_html/backend` (ou votre choix)
   - Cliquez sur **Create**
4. ✅ Résultat: `backend.rootsmaghreb.com` est créé

---

### **ÉTAPE 2: Uploader les fichiers backend**

#### **Option A: Via File Manager (cPanel)**

1. Allez dans **File Manager**
2. Naviguez vers `/public_html/backend/` (ou votre dossier)
3. **Upload** tous les fichiers du dossier `backend/`:
   ```
   backend/
   ├── server.js
   ├── package.json
   ├── .env (si vous l'avez)
   ├── src/
   │   ├── routes/
   │   ├── controllers/
   │   ├── lib/
   │   └── ...
   └── (mais PAS node_modules - on l'installera après)
   ```

#### **Option B: Via FTP/SFTP**

```bash
# Utilisez FileZilla, WinSCP, ou votre client FTP
# Connectez-vous et upload vers /public_html/backend/
```

**⚠️ IMPORTANT:** Ne pas uploader `node_modules/` - on l'installera sur le serveur

---

### **ÉTAPE 3: Installer les dépendances Node.js**

#### **Via cPanel Terminal:**

1. Allez dans **Terminal** (ou **SSH Access**)
2. Naviguez vers votre dossier:
   ```bash
   cd ~/public_html/backend
   ```
3. Installez les dépendances:
   ```bash
   npm install --production
   ```
4. ✅ Attendez que l'installation se termine

#### **Si Terminal n'est pas disponible:**

Utilisez **cPanel → Setup Node.js App** (voir étape suivante) - il installera automatiquement

---

### **ÉTAPE 4: Configurer l'application Node.js**

1. Dans cPanel, allez dans **Setup Node.js App** (ou **Node.js Selector**)
2. Cliquez sur **Create Application**
3. Remplissez les champs:

   ```
   Node.js version: 18.x ou 20.x (choisissez la plus récente disponible)
   
   Application mode: production
   
   Application root: /home/votrenom/public_html/backend
     (ou le chemin exact de votre dossier backend)
   
   Application URL: backend.rootsmaghreb.com
     (ou laissez cPanel le détecter automatiquement)
   
   Application startup file: server.js
     ⚠️ CRITIQUE: Doit être exactement "server.js"
   ```

4. Cliquez sur **Create**

---

### **ÉTAPE 5: Configurer les variables d'environnement**

1. Dans **Setup Node.js App**, trouvez votre application
2. Cliquez sur **Edit** (ou l'icône crayon)
3. Dans **Environment Variables**, ajoutez:

   ```
   NODE_ENV=production
   
   DATABASE_URL=mysql://user:password@host:3306/dbname
     (ou utilisez DB_HOST, DB_USER, DB_PASSWORD, DB_NAME séparément)
   
   JWT_SECRET=votre-secret-jwt-tres-long-et-securise
   
   CORS_ORIGIN=https://rootsmaghreb.com,https://www.rootsmaghreb.com
   ```

4. ⚠️ **IMPORTANT:** Ne pas ajouter `PORT` ou `HOST` - Passenger les gère automatiquement

5. Cliquez sur **Save**

---

### **ÉTAPE 6: Démarrer l'application**

1. Dans **Setup Node.js App**, trouvez votre application
2. Cliquez sur **Run NPM Install** (si pas déjà fait)
3. Cliquez sur **Restart App** (ou **Start**)

---

### **ÉTAPE 7: Vérifier les logs**

1. Dans **Setup Node.js App**, cliquez sur **View Logs**
2. Ou via Terminal:
   ```bash
   tail -f ~/logs/passenger.log
   ```
3. Cherchez:
   ```
   ✅ "Passenger boot OK"
   ✅ "Routes loaded successfully" (après première requête API)
   ```

---

### **ÉTAPE 8: Tester l'application**

#### **Test 1: Root endpoint (health check Passenger)**
```bash
curl https://backend.rootsmaghreb.com/
```
**Attendu:** `<!doctype html><html><body><h1>OK</h1></body></html>`

#### **Test 2: API health**
```bash
curl https://backend.rootsmaghreb.com/api/health
```
**Attendu:** `{"ok":true}`

#### **Test 3: API info (charge les routes)**
```bash
curl https://backend.rootsmaghreb.com/api/info
```
**Attendu:** JSON avec info API

#### **Test 4: Dans le navigateur**
Ouvrez: `https://backend.rootsmaghreb.com/`
- Devrait afficher: **OK**

---

## 🔧 **PROBLÈMES COURANTS & SOLUTIONS**

### **❌ Erreur: "Application check failed"**

**Cause:** Le serveur prend trop de temps à démarrer

**Solutions:**
1. Vérifiez les logs: `tail -f ~/logs/passenger.log`
2. Vérifiez que `server.js` n'a pas `app.listen()`
3. Vérifiez qu'il n'y a pas de `PORT` dans les variables d'environnement

---

### **❌ Erreur: "EADDRINUSE" (port déjà utilisé)**

**Cause:** Variable `PORT` définie ou `app.listen()` présent

**Solutions:**
1. Supprimez `PORT` des variables d'environnement dans cPanel
2. Vérifiez que `server.js` n'a pas `app.listen()`
3. Redémarrez l'application

---

### **❌ Erreur: "Cannot find module './src/routes'**

**Cause:** Fichier `src/routes/index.js` manquant

**Solutions:**
1. Vérifiez que `src/routes/index.js` existe
2. Vérifiez les permissions du fichier
3. Re-upload le fichier si nécessaire

---

### **❌ Erreur: "PrismaClientInitializationError"**

**Cause:** Routes chargent trop tôt (ne devrait plus arriver)

**Solutions:**
1. Vérifiez que Prisma est lazy-loaded (déjà fait ✅)
2. Vérifiez que routes chargent lazy (déjà fait ✅)
3. Vérifiez `DATABASE_URL` dans les variables d'environnement

---

### **❌ L'application ne démarre pas**

**Checklist:**
- [ ] `server.js` existe dans le bon dossier
- [ ] `package.json` existe
- [ ] `npm install` a été exécuté
- [ ] Startup file = `server.js` (exactement)
- [ ] Application root = bon chemin
- [ ] Logs ne montrent pas d'erreurs

---

## ✅ **CHECKLIST FINALE**

Avant de considérer le déploiement terminé:

- [ ] Sous-domaine `backend.rootsmaghreb.com` créé
- [ ] Fichiers backend uploadés
- [ ] `npm install` exécuté
- [ ] Application Node.js créée dans cPanel
- [ ] Startup file = `server.js`
- [ ] Variables d'environnement configurées
- [ ] `PORT` et `HOST` supprimés (si présents)
- [ ] Application démarrée
- [ ] Logs montrent "Passenger boot OK"
- [ ] `curl https://backend.rootsmaghreb.com/` retourne HTML
- [ ] `curl https://backend.rootsmaghreb.com/api/health` retourne JSON
- [ ] SSL actif (https://)

---

## 🎯 **PROCHAINES ÉTAPES**

Une fois le backend déployé:

1. **Déployer le frontend** sur `rootsmaghreb.com`
2. **Vérifier CORS** - Le frontend doit pouvoir appeler le backend
3. **Tester l'authentification** - Login/signup
4. **Tester les API** - Vérifier que tout fonctionne

---

## 📞 **BESOIN D'AIDE?**

Si vous rencontrez des problèmes:

1. **Vérifiez les logs:** `tail -f ~/logs/passenger.log`
2. **Vérifiez la structure:** `ls -la ~/public_html/backend/`
3. **Testez localement:** `node server.js` (devrait afficher "Passenger boot OK" et se terminer)

---

**Status:** ✅ Prêt pour le déploiement!
