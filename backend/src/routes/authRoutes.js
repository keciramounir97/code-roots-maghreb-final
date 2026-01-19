const express = require("express");
const {
  signup,
  login,
  logout,
  requestReset,
  verifyReset,
  me,
  updateMe,
} = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "auth",
    time: new Date().toISOString(),
  });
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/reset", requestReset);
router.post("/reset/verify", verifyReset);
router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, updateMe);

module.exports = router;
