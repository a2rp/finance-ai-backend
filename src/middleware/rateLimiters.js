const rateLimit = require("express-rate-limit");

exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Please wait a while.",
});

exports.transactionLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
    message: "Too many requests. Please try again later.",
});

exports.aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: "Too many AI requests. Please wait.",
});
