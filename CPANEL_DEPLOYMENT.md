# Roots Maghreb — cPanel Production Deployment

Production-ready setup for deploying the Roots Maghreb app (NestJS backend + React frontend) on cPanel with Phusion Passenger.

## Architecture

- **Frontend**: React (Vite) → static build → `public_html`
- **Backend**: NestJS (Node.js) → Phusion Passenger → subdomain (e.g. `server.rootsmaghreb.com`)
- **API prefix**: `/api` (routes: `/api/auth/login`, `/api/trees`, etc.)

---

## 1. Build Locally

```bash
# Backend
cd backend && npm install && npm run build && cd ..

# Frontend (set VITE_API_URL for production)
cd frontend && npm install && VITE_API_URL=https://server.rootsmaghreb.com npm run build && cd ..
```

- **Frontend output**: `frontend/dist/` — upload contents to `public_html`
- **Backend**: upload `backend/` (dist, node_modules, package.json, server.js, knexfile.js, .env)

---

## 2. Environment Variables

### Backend (.env in backend_roots)

Copy `backend/.env.example` to `/home/YOUR_USER/backend_roots/.env` and set:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (Passenger sets this) |
| `DATABASE_URL` | `mysql://user:pass@host:3306/dbname` |
| `JWT_SECRET` | Strong secret (e.g. `openssl rand -hex 64`) |
| `CORS_ORIGIN` | `https://rootsmaghreb.com,https://www.rootsmaghreb.com` |
| `FRONTEND_URL` | `https://rootsmaghreb.com` |

### Frontend (build-time)

Set `VITE_API_URL` before building:

```bash
# In frontend/.env
VITE_API_URL=https://server.rootsmaghreb.com
```

Or when building:

```bash
VITE_API_URL=https://server.rootsmaghreb.com npm run build
```

---

## 3. cPanel Setup

### A. Frontend (public_html)

1. Upload `frontend/dist/*` to `/home/YOUR_USER/public_html`
2. Ensure `.htaccess` is present (security headers + SPA fallback)
3. Domain: `rootsmaghreb.com` (or your domain)

### B. Backend (subdomain)

1. Create subdomain: `server.rootsmaghreb.com` (or `api.rootsmaghreb.com`)
2. Upload `backend/` (dist, node_modules, package.json, server.js, knexfile.js, .htaccess if needed) to `/home/YOUR_USER/backend_roots` (outside `public_html`)
3. cPanel → **Setup Node.js App** (or **Application Manager**)
   - **Application root**: `/home/YOUR_USER/backend_roots`
   - **Application URL**: `server.rootsmaghreb.com` (or your subdomain)
   - **Application startup file**: `server.js`
   - **Node version**: 20.x
4. Add `.env` file in `backend_roots/` with production values
5. Run `npm run knex migrate:latest` in backend_roots (if migrations needed)
6. Restart app: `touch tmp/restart.txt`

---

## 4. Verify

- **Frontend**: https://rootsmaghreb.com
- **API health**: https://server.rootsmaghreb.com/api/health
- **Login**: https://rootsmaghreb.com/login → POST `/api/auth/login` should succeed

---

## 5. Troubleshooting

### "Cannot POST /api/auth/login"

- Ensure API base is `/api` (no `/v1`)
- Check `VITE_API_URL` points to backend subdomain
- Verify backend is running (Application Manager → Restart)

### CORS errors

- Add your frontend domain to `CORS_ORIGIN` in backend `.env`

### 404 on API

- Confirm backend is on subdomain (not proxied through main domain)
- Check Application Manager shows app as running
