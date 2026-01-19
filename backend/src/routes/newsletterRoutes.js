const express = require("express");
const { subscribeNewsletter } = require("../controllers/newsletterController");

const router = express.Router();

// Health check endpoint
router.get("/newsletter/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "newsletter",
    time: new Date().toISOString(),
  });
});

router.post("/newsletter", subscribeNewsletter);

module.exports = router;
