/**
 * ROOTS MAGHREB — BACKEND
 * Production-safe (cPanel / Passenger + Prisma)
 */

const express = require("express");
const cors = require("cors");
const { prisma, DB_NAME } = require("./src/lib/prisma");
const { PORT: ENV_PORT } = require("./src/config/env");

const app = express();

/**
 * =====================================
 * GLOBAL ERROR PROTECTION
 * =====================================
 */
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error("Stack:", err.stack);
  }
  // Only exit in extreme cases
  if (err.code === "EADDRINUSE" || err.code === "MODULE_NOT_FOUND") {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ UNHANDLED REJECTION:", reason);
  if (process.env.NODE_ENV === "development") {
    console.error("Promise:", promise);
  }
});

/**
 * =====================================
 * PRISMA — LAZY INITIALIZATION (IMPORTANT)
 * =====================================
 * Prisma is loaded lazily from src/lib/prisma.js
 * No database connection at startup
 */
function getPrisma() {
  return prisma;
}

/**
 * =====================================
 * BASIC MIDDLEWARE
 * =====================================
 */
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

/**
 * =====================================
 * CORS — API ONLY
 * =====================================
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Production domains
      "https://rootsmaghreb.com",
      "https://www.rootsmaghreb.com",
      "https://frontend.rootsmaghreb.com",
      "https://admin.rootsmaghreb.com",
      "https://server.rootsmaghreb.com",
      "https://backend.rootsmaghreb.com",
      // HTTP versions (for development/testing)
      "http://rootsmaghreb.com",
      "http://www.rootsmaghreb.com",
      "http://frontend.rootsmaghreb.com",
      "http://admin.rootsmaghreb.com",
      "http://server.rootsmaghreb.com",
      "http://backend.rootsmaghreb.com",
      // Local development
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      // Network IPs (from esbuild output)
      "http://192.168.56.1:5173",
      "http://10.160.87.239:5173",
    ];
    
    // In development, allow all localhost and local network origins
    if (process.env.NODE_ENV === "development") {
      if (
        origin.includes("localhost") || 
        origin.includes("127.0.0.1") ||
        origin.includes("192.168.") ||
        origin.includes("10.160.") ||
        origin.includes("10.0.") ||
        origin.includes("172.16.") ||
        origin.includes("172.17.") ||
        origin.includes("172.18.") ||
        origin.includes("172.19.") ||
        origin.includes("172.20.") ||
        origin.includes("172.21.") ||
        origin.includes("172.22.") ||
        origin.includes("172.23.") ||
        origin.includes("172.24.") ||
        origin.includes("172.25.") ||
        origin.includes("172.26.") ||
        origin.includes("172.27.") ||
        origin.includes("172.28.") ||
        origin.includes("172.29.") ||
        origin.includes("172.30.") ||
        origin.includes("172.31.")
      ) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log for debugging
      if (process.env.NODE_ENV === "development") {
        console.log(`⚠️  CORS: Origin not in allowed list: ${origin}`);
      }
      callback(null, true); // Allow for now, can be restricted in production
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Authorization"],
  maxAge: 86400, // 24 hours
};

app.use("/api", cors(corsOptions));
app.use("/api", express.json({ limit: "50mb" }));
app.use("/api", express.urlencoded({ extended: true, limit: "50mb" }));

/**
 * =====================================
 * PASSENGER HEALTH CHECK
 * =====================================
 */
app.get("/", (req, res) => {
  res.type("text/plain").send("OK");
});

/**
 * =====================================
 * SAFE API LOADER (LAZY)
 * =====================================
 */
let apiLoaded = false;

app.use("/api", (req, res, next) => {
  if (!apiLoaded) {
    try {
      const loadRoutes = require("./src/routes");
      loadRoutes(app);
      apiLoaded = true;
      console.log("✅ API routes loaded successfully");
      
      // Collect and store routes for display on startup
      try {
        const { collectRoutes } = require("./src/utils/routeCollector");
        app._collectedRoutes = collectRoutes(app);
      } catch (err) {
        // Route collection is optional, don't fail if it doesn't work
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️  Could not collect routes:", err.message);
        }
      }
    } catch (err) {
      console.error("❌ API lazy-load failed:", err.message);
      if (process.env.NODE_ENV === "development") {
        console.error("Stack:", err.stack);
      }
      return res.status(503).json({
        error: "API unavailable",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Service temporarily unavailable",
      });
    }
  }
  next();
});

/**
 * =====================================
 * API HEALTH (NO DB)
 * =====================================
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "UP",
    node: process.version,
    env: process.env.NODE_ENV || "production",
    time: new Date().toISOString(),
  });
});

/**
 * =====================================
 * DATABASE HEALTH (PRISMA)
 * =====================================
 */
app.get("/api/db-health", async (req, res) => {
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    res.json({ db: "OK", dbName: DB_NAME || null });
  } catch (err) {
    console.error("❌ DB health check failed:", err.message);
    res.status(500).json({
      db: "FAIL",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Database connection failed",
      dbName: DB_NAME || null,
    });
  }
});

/**
 * =====================================
 * USERS — EXAMPLE SAFE QUERY
 * =====================================
 */
app.get("/api/users/count", async (req, res) => {
  try {
    const count = await getPrisma().user.count();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * =====================================
 * GLOBAL ERROR HANDLER
 * =====================================
 */
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("Route error:", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error("Stack:", err.stack);
  }

  if (err.status) {
    return res.status(err.status).json({ message: err.message || "Error occurred" });
  }

  res.status(500).json({
    message:
      process.env.NODE_ENV === "development"
        ? err.message || "Internal server error"
        : "Internal server error",
  });
});

/**
 * =====================================
 * API 404 (EXPRESS)
 * =====================================
 */
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

/**
 * =====================================
 * SERVER START (DEV & PRODUCTION)
 * =====================================
 */
const PORT = process.env.PORT || ENV_PORT || 5000;
const isPassengerMode = process.env.PASSENGER_APP_ENV || process.env.PASSENGER_ENABLED === "true";

// Only start listening if not in Passenger mode
// Passenger manages the server lifecycle
if (!isPassengerMode) {
  // Pre-load routes to collect them for display (Passenger-safe: no DB queries)
  try {
    const loadRoutes = require("./src/routes");
    loadRoutes(app);
    // Collect routes for display (optional, won't fail if it doesn't work)
    try {
      const { collectRoutes } = require("./src/utils/routeCollector");
      app._collectedRoutes = collectRoutes(app);
    } catch (collectErr) {
      // Route collection is optional, don't fail startup
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️  Could not collect routes:", collectErr.message);
      }
    }
  } catch (err) {
    // If route loading fails, log but don't crash (routes will load on first request)
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Could not pre-load routes:", err.message);
    }
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    const baseUrl = `http://localhost:${PORT}`;
    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("🚀  BACKEND SERVER STARTED SUCCESSFULLY");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`📡  Server running on: ${baseUrl}`);
    console.log(`🌐  API available at: ${baseUrl}/api`);
    console.log("");
    console.log("📋  AVAILABLE ROUTES:");
    console.log("───────────────────────────────────────────────────────");
    
    // Display health endpoints
    console.log("❤️   Health Endpoints:");
    console.log(`     GET    ${baseUrl}/api/health`);
    console.log(`     GET    ${baseUrl}/api/db-health`);
    console.log(`     GET    ${baseUrl}/api/users/count`);
    console.log("");
    
    // Display route-specific health endpoints
    console.log("🏥  Route Health Checks:");
    const healthRoutes = [
      { method: "GET", path: "/api/auth/health" },
      { method: "GET", path: "/api/books/health" },
      { method: "GET", path: "/api/trees/health" },
      { method: "GET", path: "/api/users/health" },
      { method: "GET", path: "/api/gallery/health" },
      { method: "GET", path: "/api/persons/health" },
      { method: "GET", path: "/api/contact/health" },
      { method: "GET", path: "/api/newsletter/health" },
      { method: "GET", path: "/api/search/health" },
      { method: "GET", path: "/api/settings/health" },
      { method: "GET", path: "/api/stats/health" },
      { method: "GET", path: "/api/activity/health" },
      { method: "GET", path: "/api/roles/health" },
      { method: "GET", path: "/api/diagnostics/health" },
    ];
    healthRoutes.forEach((route) => {
      console.log(`     ${route.method.padEnd(6)} ${baseUrl}${route.path}`);
    });
    console.log("");
    
    // Display main API routes
    console.log("📚  Main API Routes:");
    const mainRoutes = [
      { methods: "GET", path: "/api/books", desc: "List public books" },
      { methods: "GET", path: "/api/trees", desc: "List public trees" },
      { methods: "GET", path: "/api/gallery", desc: "List public gallery" },
      { methods: "POST", path: "/api/auth/login", desc: "User login" },
      { methods: "POST", path: "/api/auth/signup", desc: "User signup" },
      { methods: "GET", path: "/api/search", desc: "Search" },
      { methods: "POST", path: "/api/contact", desc: "Contact form" },
      { methods: "POST", path: "/api/newsletter", desc: "Newsletter subscribe" },
    ];
    mainRoutes.forEach((route) => {
      console.log(`     ${route.methods.padEnd(6)} ${baseUrl}${route.path} - ${route.desc}`);
    });
    console.log("");
    
    // Display CRUD routes
    console.log("📖  Books CRUD Routes:");
    const booksRoutes = [
      { method: "GET", path: "/api/books", desc: "List public" },
      { method: "GET", path: "/api/books/:id", desc: "Get public" },
      { method: "GET", path: "/api/my/books", desc: "List my books" },
      { method: "GET", path: "/api/my/books/:id", desc: "Get my book" },
      { method: "POST", path: "/api/my/books", desc: "Create my book" },
      { method: "PUT", path: "/api/my/books/:id", desc: "Update my book" },
      { method: "DELETE", path: "/api/my/books/:id", desc: "Delete my book" },
      { method: "GET", path: "/api/admin/books", desc: "List all (admin)" },
      { method: "GET", path: "/api/admin/books/:id", desc: "Get any (admin)" },
      { method: "POST", path: "/api/admin/books", desc: "Create (admin)" },
      { method: "PUT", path: "/api/admin/books/:id", desc: "Update (admin)" },
      { method: "DELETE", path: "/api/admin/books/:id", desc: "Delete (admin)" },
    ];
    booksRoutes.forEach((route) => {
      console.log(`     ${route.method.padEnd(6)} ${baseUrl}${route.path} - ${route.desc}`);
    });
    console.log("");
    
    console.log("🌳  Trees CRUD Routes:");
    const treesRoutes = [
      { method: "GET", path: "/api/trees", desc: "List public" },
      { method: "GET", path: "/api/trees/:id", desc: "Get public" },
      { method: "GET", path: "/api/my/trees", desc: "List my trees" },
      { method: "GET", path: "/api/my/trees/:id", desc: "Get my tree" },
      { method: "POST", path: "/api/my/trees", desc: "Create my tree" },
      { method: "PUT", path: "/api/my/trees/:id", desc: "Update my tree" },
      { method: "DELETE", path: "/api/my/trees/:id", desc: "Delete my tree" },
      { method: "GET", path: "/api/admin/trees", desc: "List all (admin)" },
      { method: "GET", path: "/api/admin/trees/:id", desc: "Get any (admin)" },
      { method: "PUT", path: "/api/admin/trees/:id", desc: "Update (admin)" },
      { method: "DELETE", path: "/api/admin/trees/:id", desc: "Delete (admin)" },
    ];
    treesRoutes.forEach((route) => {
      console.log(`     ${route.method.padEnd(6)} ${baseUrl}${route.path} - ${route.desc}`);
    });
    console.log("");
    
    console.log("🖼️   Gallery CRUD Routes:");
    const galleryRoutes = [
      { method: "GET", path: "/api/gallery", desc: "List public" },
      { method: "GET", path: "/api/gallery/:id", desc: "Get public" },
      { method: "GET", path: "/api/my/gallery", desc: "List my gallery" },
      { method: "GET", path: "/api/my/gallery/:id", desc: "Get my item" },
      { method: "POST", path: "/api/my/gallery", desc: "Create my item" },
      { method: "PUT", path: "/api/my/gallery/:id", desc: "Update my item" },
      { method: "DELETE", path: "/api/my/gallery/:id", desc: "Delete my item" },
      { method: "GET", path: "/api/admin/gallery", desc: "List all (admin)" },
      { method: "GET", path: "/api/admin/gallery/:id", desc: "Get any (admin)" },
      { method: "POST", path: "/api/admin/gallery", desc: "Create (admin)" },
      { method: "PUT", path: "/api/admin/gallery/:id", desc: "Update (admin)" },
      { method: "DELETE", path: "/api/admin/gallery/:id", desc: "Delete (admin)" },
    ];
    galleryRoutes.forEach((route) => {
      console.log(`     ${route.method.padEnd(6)} ${baseUrl}${route.path} - ${route.desc}`);
    });
    console.log("");
    
    console.log("👥  Users CRUD Routes:");
    const usersRoutes = [
      { method: "GET", path: "/api/admin/users", desc: "List all users" },
      { method: "GET", path: "/api/admin/users/:id", desc: "Get user" },
      { method: "POST", path: "/api/admin/users", desc: "Create user" },
      { method: "PATCH", path: "/api/admin/users/:id", desc: "Update user" },
      { method: "DELETE", path: "/api/admin/users/:id", desc: "Delete user" },
    ];
    usersRoutes.forEach((route) => {
      console.log(`     ${route.method.padEnd(6)} ${baseUrl}${route.path} - ${route.desc}`);
    });
    console.log("");
    
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("✅ Server is ready to accept connections");
    console.log("⚠️  Press Ctrl+C to stop the server");
    console.log("");
  });

  // Error handling for server
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n${"=".repeat(55)}`);
      console.error(`❌ ERROR: Port ${PORT} is already in use!`);
      console.error(`${"=".repeat(55)}\n`);
      console.error("To fix this:");
      console.error("  1. Find the process using port 5000:");
      console.error("     Windows: netstat -ano | findstr :5000");
      console.error("     Linux/Mac: lsof -i :5000");
      console.error("  2. Stop that process, or");
      console.error("  3. Change PORT in .env file to a different port\n");
      process.exit(1);
    } else {
      console.error("❌ Server error:", err.message);
      if (process.env.NODE_ENV === "development") {
        console.error("Stack:", err.stack);
      }
    }
  });

  // Keep-alive settings
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  // Graceful shutdown
  let isShuttingDown = false;
  process.on("SIGINT", () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log("\n⚠️  SIGINT received, shutting down gracefully...");
    console.log("Closing server...");

    server.close(() => {
      console.log("✅ Server closed successfully");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("⚠️  Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  });
} else {
  console.log("✅ Passenger + Prisma ready (Passenger mode)");
}

/**
 * =====================================
 * EXPORT — REQUIRED BY PASSENGER
 * =====================================
 */
module.exports = app;
