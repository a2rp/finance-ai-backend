const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { getAiAdvice } = require("../controllers/ai.controller");

const router = express.Router();

router.post("/", protect, getAiAdvice);

module.exports = router;
