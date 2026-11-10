const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { getAiAdvice } = require("../controllers/ai.controller");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/", protect, aiLimiter, getAiAdvice);

module.exports = router;
