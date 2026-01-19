// ============================================================
// ULTRA-LAZY PRISMA CLIENT - ZERO DB CONNECTION AT STARTUP
// ============================================================
// CRITICAL: NOTHING Prisma-related runs at module load time
// - PrismaClient class is lazy-loaded
// - PrismaClient instance is lazy-created
// - Database connection only happens when route handler executes
// - This allows server.js to start INSTANTLY without any DB dependency

// LAZY INITIALIZATION - Everything is deferred
let _prismaInstance = null;
let _PrismaClient = null;
let _DB_NAME = null;
let _isDbUnavailable = null;
let _markDbDown = null;
let _clearDbDown = null;

// Lazy-load PrismaClient class (ONLY when first accessed)
const getPrismaClientClass = () => {
  if (!_PrismaClient) {
    try {
      _PrismaClient = require("@prisma/client").PrismaClient;
    } catch (err) {
      console.error("❌ Failed to load PrismaClient:", err.message);
      throw err;
    }
  }
  return _PrismaClient;
};

// Lazy-load DB_NAME (ONLY when first accessed)
const getDBName = () => {
  if (_DB_NAME === null) {
    try {
      const envConfig = require("../config/env");
      _DB_NAME = envConfig.DB_NAME || null;
    } catch (err) {
      console.warn("⚠️ Could not load DB_NAME (app continues):", err.message);
      _DB_NAME = null;
    }
  }
  return _DB_NAME;
};

// Lazy-load dbState utils (ONLY when first accessed)
const getDbStateUtils = () => {
  if (!_isDbUnavailable) {
    try {
      const dbState = require("../utils/dbState");
      _isDbUnavailable = dbState.isDbUnavailable || (() => false);
      _markDbDown = dbState.markDbDown || (() => {});
      _clearDbDown = dbState.clearDbDown || (() => {});
    } catch (err) {
      console.warn("⚠️ Could not load dbState utils (app continues):", err.message);
      _isDbUnavailable = () => false;
      _markDbDown = () => {};
      _clearDbDown = () => {};
    }
  }
  return { isDbUnavailable: _isDbUnavailable, markDbDown: _markDbDown, clearDbDown: _clearDbDown };
};

const shouldBackoff = (err) => {
  const code = err?.code;
  if (["P1000", "P1001", "P1002", "P1003", "P2024"].includes(code)) {
    return true;
  }
  const msg = String(err?.message || "");
  return (
    msg.includes("Can't reach database server") ||
    msg.includes("Timed out fetching a new connection") ||
    msg.includes("connect ECONNREFUSED") ||
    msg.includes("connection pool")
  );
};

const backoffForError = (err) => {
  if (err?.code === "P2024") {
    return Number(process.env.DB_POOL_BACKOFF_MS || 3000) || 3000;
  }
  return null;
};

// Get Prisma client - ULTRA lazy initialization
// This function is ONLY called when a route handler accesses prisma.user, prisma.book, etc.
const getPrisma = () => {
  if (!_prismaInstance) {
    // Lazy-load PrismaClient class (not at module load time)
    const PrismaClient = getPrismaClientClass();
    
    // Lazy-load dbState utils
    const { isDbUnavailable, markDbDown, clearDbDown } = getDbStateUtils();
    
    // Create Prisma client ONLY when first accessed (inside route handler)
    _prismaInstance = new PrismaClient({
      log: process.env.DEBUG_PRISMA ? ["query", "warn", "error"] : ["error"],
    });

    // Set up middleware for connection handling
    _prismaInstance.$use(async (params, next) => {
      if (isDbUnavailable()) {
        const err = new Error("Database unavailable.");
        err.code = "P1001";
        throw err;
      }

      try {
        const result = await next(params);
        clearDbDown();
        return result;
      } catch (err) {
        if (shouldBackoff(err)) {
          markDbDown(err, backoffForError(err));
        }
        throw err;
      }
    });
  }
  return _prismaInstance;
};

// Export Proxy - Prisma client is created ONLY when property is accessed
// Routes can do: const { prisma } = require("../lib/prisma");
// Then: await prisma.user.findMany() - PrismaClient created at this moment
const prisma = new Proxy({}, {
  get(target, prop) {
    // This is called when route handler accesses prisma.user, prisma.book, etc.
    const instance = getPrisma();
    return instance[prop];
  }
});

// Export DB_NAME - loaded lazily but accessible as normal value
// Routes can use: const { DB_NAME } = require("../lib/prisma");
// DB_NAME is loaded when module is first required (but safely, won't crash)
// Since routes are loaded in try/catch in server.js, this is safe
const DB_NAME = getDBName();

module.exports = { prisma, DB_NAME };
