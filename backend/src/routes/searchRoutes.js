const express = require("express");
const { search } = require("../controllers/searchController");
const { suggest } = require("../controllers/searchPageController");

const router = express.Router();

// Health check endpoint
router.get("/search/health", (_req, res) => {
  res.json({
    status: "ok",
    route: "search",
    time: new Date().toISOString(),
  });
});

router.get("/search", search);
router.get("/search/suggest", suggest);

module.exports = router;
