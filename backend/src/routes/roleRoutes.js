const express = require("express");
const { listRoles } = require("../controllers/roleController");
const { authMiddleware, requirePermission } = require("../middlewares/auth");

const router = express.Router();

// Health check endpoint
router.get("/roles/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "roles",
    time: new Date().toISOString(),
  });
});

router.get(
  "/admin/roles",
  authMiddleware,
  requirePermission("manage_users"),
  listRoles
);

module.exports = router;
