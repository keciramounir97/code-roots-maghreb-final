const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "health",
    time: new Date().toISOString(),
    node: process.version,
    env: process.env.NODE_ENV || "production",
  });
});

module.exports = router;
