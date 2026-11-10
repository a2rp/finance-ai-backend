require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/user.routes");
const transactionRoutes = require("./src/routes/transaction.routes");
const aiRoutes = require("./src/routes/ai.routes");
const errorHandler = require("./src/middleware/errorHandler");
const { transactionLimiter } = require("./src/middleware/rateLimiters");

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
}

if (!MONGO_URI) {
    throw new Error("MONGO_URI must be set in the environment.");
}

if (!JWT_SECRET || Buffer.byteLength(JWT_SECRET, "utf8") < 32) {
    throw new Error("JWT_SECRET must contain at least 32 bytes of random data.");
}

const allowedOrigins = new Set(
    (process.env.CORS_ORIGINS || "http://localhost:3000")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
);

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
    origin(origin, callback) {
        callback(null, !origin || allowedOrigins.has(origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "64kb" }));

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionLimiter, transactionRoutes);
app.use("/api/ai-advice", aiRoutes);

app.get("/", (_req, res) => res.json({ message: "Finance AI API is running." }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use((_req, res) => res.status(404).json({ message: "Route not found." }));
app.use(errorHandler);

const startServer = async () => {
    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(`Finance AI API listening on port ${PORT}.`);
    });

    let shuttingDown = false;
    const shutdown = (signal) => {
        if (shuttingDown) return;
        shuttingDown = true;
        console.log(`${signal} received; closing the API.`);
        server.close((error) => {
            mongoose.disconnect()
                .catch((disconnectError) => console.error("MongoDB disconnect failed:", disconnectError.message))
                .finally(() => {
                    if (error) console.error("HTTP server shutdown failed:", error.message);
                    process.exitCode = error ? 1 : 0;
                });
        });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch(async (error) => {
    console.error("Finance AI API startup failed:", error.name || "Error", error.code || "");
    await mongoose.disconnect().catch(() => {});
    process.exitCode = 1;
});
