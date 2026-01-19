const express = require("express");
const { getStats } = require("../controllers/statsController");
const { authMiddleware, requirePermission } = require("../middlewares/auth");

const router = express.Router();

// Health check endpoint
router.get("/stats/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "stats",
    time: new Date().toISOString(),
  });
});

router.get(
  "/admin/stats",
  authMiddleware,
  requirePermission("view_dashboard"),
  getStats
);

module.exports = router;
