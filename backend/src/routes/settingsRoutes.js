const express = require("express");
const {
  getSettings,
  saveSettings,
} = require("../controllers/settingsController");
const { injectMockData } = require("../controllers/mockDataController");
const { authMiddleware, requireAnyPermission } = require("../middlewares/auth");

const router = express.Router();

// Health check endpoint
router.get("/settings/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "settings",
    time: new Date().toISOString(),
  });
});

router.get(
  "/admin/settings",
  authMiddleware,
  requireAnyPermission(["manage_users"]),
  getSettings
);
router.put(
  "/admin/settings",
  authMiddleware,
  requireAnyPermission(["manage_users"]),
  saveSettings
);

router.post(
  "/admin/settings/mock-data",
  authMiddleware,
  requireAnyPermission(["manage_users"]),
  injectMockData
);

module.exports = router;
