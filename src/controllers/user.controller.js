const User = require("../models/User");
const jwt = require("jsonwebtoken");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const isValidPassword = (password) =>
    typeof password === "string" &&
    password.length >= 8 &&
    Buffer.byteLength(password, "utf8") <= 72;

const generateToken = (userId) => jwt.sign(
    { id: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
);

const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
});

const registerUser = async (req, res) => {
    if (!isObject(req.body)) {
        return res.status(400).json({ message: "A JSON object is required." });
    }

    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body.password;
    const phone = req.body.phone;

    if (name.length < 2 || name.length > 80) {
        return res.status(400).json({ message: "Name must be between 2 and 80 characters." });
    }
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({ message: "Password must be at least 8 characters and no more than 72 UTF-8 bytes." });
    }
    if (phone !== undefined && phone !== null && (typeof phone !== "string" || phone.trim().length > 32)) {
        return res.status(400).json({ message: "Phone must be a string of at most 32 characters." });
    }

    try {
        const user = await User.create({
            name,
            email,
            password,
            phone: typeof phone === "string" ? phone.trim() : undefined,
        });

        return res.status(201).json({
            ...publicUser(user),
            token: generateToken(user._id),
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        throw error;
    }
};

const loginUser = async (req, res) => {
    if (!isObject(req.body)) {
        return res.status(400).json({ message: "A JSON object is required." });
    }

    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body.password;
    if (!EMAIL_PATTERN.test(email) || typeof password !== "string" || Buffer.byteLength(password, "utf8") > 72) {
        return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({ ...publicUser(user), token: generateToken(user._id) });
};

const getUserProfile = (req, res) => res.json(publicUser(req.user));

const updateUserProfile = async (req, res) => {
    if (!isObject(req.body)) {
        return res.status(400).json({ message: "A JSON object is required." });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found." });

    if (has(req.body, "name")) {
        if (typeof req.body.name !== "string" || req.body.name.trim().length < 2 || req.body.name.trim().length > 80) {
            return res.status(400).json({ message: "Name must be between 2 and 80 characters." });
        }
        user.name = req.body.name.trim();
    }

    if (has(req.body, "email")) {
        if (typeof req.body.email !== "string") {
            return res.status(400).json({ message: "Enter a valid email address." });
        }
        const email = req.body.email.trim().toLowerCase();
        if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
            return res.status(400).json({ message: "Enter a valid email address." });
        }
        user.email = email;
    }

    if (has(req.body, "phone")) {
        if (req.body.phone !== null && typeof req.body.phone !== "string") {
            return res.status(400).json({ message: "Phone must be a string or null." });
        }
        const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
        if (phone.length > 32) {
            return res.status(400).json({ message: "Phone must be at most 32 characters." });
        }
        user.phone = phone;
    }

    if (has(req.body, "password")) {
        if (!isValidPassword(req.body.password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters and no more than 72 UTF-8 bytes." });
        }
        user.password = req.body.password;
    }

    if (!["name", "email", "phone", "password"].some((field) => has(req.body, field))) {
        return res.status(400).json({ message: "Provide at least one supported profile field." });
    }

    try {
        await user.save();
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        throw error;
    }

    return res.json({ ...publicUser(user), token: generateToken(user._id) });
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
