#!/bin/bash
# =============================================================================
# ROOTS MAGHREB — Deployment Package Builder (NestJS + Knex)
# Run this on your LOCAL machine — NOT on cPanel
# =============================================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
DEPLOY_FOLDER="roots-maghreb-deploy"

echo "=== Building deployment package ==="

echo "[1/6] Backend: npm install (installing devDeps for build)..."
cd backend && npm install && cd ..

echo "[2/6] Backend: Build NestJS App..."
cd backend && npm run build && cd ..

echo "[3/6] Frontend: Check install..."
cd frontend && npm install 2>/dev/null || npm ci && cd ..

echo "[4/6] Frontend: Build..."
cd frontend && npm run build && cd ..

echo "[5/6] Creating package..."
rm -rf "$DEPLOY_FOLDER"
mkdir -p "$DEPLOY_FOLDER/frontend" "$DEPLOY_FOLDER/backend"

# Frontend assets
cp -r frontend/dist/* "$DEPLOY_FOLDER/frontend/"

# Backend: Copy dist, package.json, and other essentials
echo "   -> Copying backend artifacts..."
cp backend/package.json "$DEPLOY_FOLDER/backend/"
cp backend/package-lock.json "$DEPLOY_FOLDER/backend/"
cp backend/passenger.js "$DEPLOY_FOLDER/backend/"
cp backend/server.js "$DEPLOY_FOLDER/backend/"
cp backend/knexfile.js "$DEPLOY_FOLDER/backend/"
cp -r backend/dist "$DEPLOY_FOLDER/backend/dist"
# Copy source checks/migrations just in case, but dist is primary
cp -r backend/src "$DEPLOY_FOLDER/backend/src"

# Install PROD dependencies only in the deploy folder (clean slate)
echo "   -> Installing production dependencies..."
cd "$DEPLOY_FOLDER/backend" && npm ci --omit=dev && cd ../..

echo "[6/6] Adding .htaccess (security headers + SPA)..."
cat > "$DEPLOY_FOLDER/frontend/.htaccess" << 'HTA'
<IfModule mod_headers.c>
  Header set Pragma "no-cache"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set X-XSS-Protection "1; mode=block"
  Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
  Header set Cache-Control "no-cache, no-store, must-revalidate"
  Header set Expires "0"
</IfModule>
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
HTA

# Create backend .htaccess for Passenger (server.rootsmaghreb.com, port 5000)
cat > "$DEPLOY_FOLDER/backend/.htaccess" << 'HTA'
<IfModule mod_headers.c>
  Header set Pragma "no-cache"
  Header set X-Frame-Options "DENY"
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Cache-Control "no-store, no-cache, must-revalidate"
  Header set Expires "0"
</IfModule>
PassengerAppRoot /home/YOUR_USER/backend_roots
PassengerBaseURI /
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs /home/YOUR_USER/nodevenv/backend_roots/20/bin/node
PassengerRestartDir /home/YOUR_USER/backend_roots/tmp
<IfModule mod_env.c>
  SetEnv NODE_ENV production
</IfModule>
<Files ".env">
  Require all denied
</Files>
Options -Indexes
HTA

mkdir -p "$DEPLOY_FOLDER/backend/tmp"
touch "$DEPLOY_FOLDER/backend/tmp/restart.txt"

echo ""
echo "=== DONE: $DEPLOY_FOLDER/ ==="
echo ""
echo "DEPLOYMENT INSTRUCTIONS:"
echo "------------------------------------------------------"
echo "1. Upload '$DEPLOY_FOLDER/backend' to '/home/YOUR_USER/backend_roots' (OUTSIDE public_html)"
echo "2. Upload '$DEPLOY_FOLDER/frontend/*' to '/home/YOUR_USER/public_html'"
echo "3. Update '/home/YOUR_USER/backend_roots/.env' with production secrets"
echo "4. In cPanel 'Application Manager':"
echo "   - Name: RootsAPI"
echo "   - Application Path: /home/YOUR_USER/backend_roots"
echo "   - Deployment Domain: api.rootsmaghreb.com (OR allow same domain with different PassengerBaseURI)"
echo "   - Base App URL: / (if subdomain) or /api (if same domain)"
echo "   - Version: 20.x"
echo "   - Ensure 'Ensure dependencies' is clicked initially."
echo ""
echo "NOTE: If you use the SAME domain (rootsmaghreb.com) for both:"
echo "   - You MUST put backend in 'backend_roots' (outside public_html)"
echo "   - You must map the Application Manager URL to '/api'"
echo "   - You might need to adjust .htaccess in public_html to proxy or let Passenger handle it."
echo ""

