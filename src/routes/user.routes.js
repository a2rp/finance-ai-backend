const express = require("express");
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { registerLimiter, loginLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.get("/me", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router;
