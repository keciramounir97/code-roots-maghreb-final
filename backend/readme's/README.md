# 📚 Backend Documentation

This folder contains all documentation files for the backend server.

## 📋 Available Documentation

- **CPANEL_CHECKLIST.md** - Checklist for cPanel deployment
- **DEBUG-STEPS.md** - Debugging steps for Passenger startup
- **DEPLOY_NOW.md** - Quick deployment guide
- **DEPLOYMENT_GUIDE.md** - Comprehensive deployment guide
- **ERR_CONNECTION_REFUSED_FIX.md** - Fix for connection refused errors
- **FINAL_VERIFICATION.md** - Final verification steps
- **NEXT_STEPS.md** - Next steps after setup
- **PASSENGER_CHANGES.md** - Changes made for Passenger compatibility
- **PASSENGER_SAFETY.md** - Passenger safety guidelines
- **PRISMA_SAFETY_VERIFICATION.md** - Prisma safety verification
- **QUICK_START.md** - Quick start guide
- **ROUTE_AUDIT_FIXES.md** - Route audit fixes documentation
- **ROUTE_AUDIT.md** - Route audit documentation
- **ROUTES_STRUCTURE.md** - Routes structure documentation
- **START_SERVER.md** - How to start the server
- **SUBDOMAIN_CONFIG.md** - Subdomain configuration guide
- **TROUBLESHOOTING.md** - Troubleshooting guide

## 🚀 Quick Start

To start the server:

```bash
cd backend
npm start
```

The server will start on port 5000 (or the port specified in your `.env` file).

## 📁 Project Structure

```
backend/
├── server.js              # Main server file (only file in root)
├── package.json           # Dependencies and scripts
├── src/                   # Source code
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── lib/              # Library files (Prisma, mailer)
│   ├── middlewares/       # Express middlewares
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
├── prisma/               # Prisma schema
├── scripts/              # Utility scripts
├── readme's/             # Documentation (this folder)
└── uploads/              # File uploads directory
```

## 🔧 Server Configuration

The server is configured to work in both development and production modes:

- **Development**: Server starts with `app.listen()` on port 5000
- **Production (Passenger)**: Server exports the app, Passenger manages the lifecycle

## 📝 Notes

- All documentation has been moved to this `readme's` folder for better organization
- The main server file is `server.js` in the backend root
- All other files are organized in folders
