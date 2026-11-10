const rateLimit = require("express-rate-limit");

const createLimiter = (windowMs, limit, message) => rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
});

exports.registerLimiter = createLimiter(
    60 * 60 * 1000,
    5,
    "Too many registration attempts. Try again later.",
);

exports.loginLimiter = createLimiter(
    15 * 60 * 1000,
    10,
    "Too many login attempts. Try again later.",
);

exports.transactionLimiter = createLimiter(
    5 * 60 * 1000,
    100,
    "Too many transaction requests. Try again later.",
);

exports.aiLimiter = createLimiter(
    60 * 1000,
    5,
    "Too many AI requests. Try again later.",
);
