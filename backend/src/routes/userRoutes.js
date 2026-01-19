const express = require("express");
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { authMiddleware, requirePermission } = require("../middlewares/auth");

const router = express.Router();

// Health check endpoint
router.get("/users/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "users",
    time: new Date().toISOString(),
  });
});

router.get(
  "/admin/users",
  authMiddleware,
  requirePermission("manage_users"),
  listUsers
);
router.get(
  "/admin/users/:id",
  authMiddleware,
  requirePermission("manage_users"),
  getUser
);
router.post(
  "/admin/users",
  authMiddleware,
  requirePermission("manage_users"),
  createUser
);
router.patch(
  "/admin/users/:id",
  authMiddleware,
  requirePermission("manage_users"),
  updateUser
);
router.delete(
  "/admin/users/:id",
  authMiddleware,
  requirePermission("manage_users"),
  deleteUser
);

module.exports = router;
