const express = require("express");
const { contact } = require("../controllers/contactController");

const router = express.Router();

// Health check endpoint
router.get("/contact/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "contact",
    time: new Date().toISOString(),
  });
});

router.post("/contact", contact);

module.exports = router;
