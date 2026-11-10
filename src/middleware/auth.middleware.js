const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    const [scheme, token, ...extra] = (req.get("authorization") || "").trim().split(/\s+/);
    if (scheme !== "Bearer" || !token || extra.length) {
        return res.status(401).json({ message: "Authentication required." });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ message: "Invalid or expired token." });
    }

    if (!decoded || typeof decoded !== "object" || typeof decoded.id !== "string") {
        return res.status(401).json({ message: "Invalid or expired token." });
    }

    const user = await User.findById(decoded.id).select("_id name email phone");
    if (!user) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }

    req.user = user;
    return next();
};

module.exports = { protect };
