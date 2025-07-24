require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/user.routes");
const transactionRoutes = require("./src/routes/transaction.routes");
const aiRoutes = require("./src/routes/ai.routes");
const helmet = require("helmet");

connectDB();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const {
    authLimiter,
    transactionLimiter,
    aiLimiter,
} = require("./src/middleware/rateLimiters");

// ✅ Apply rate limiters per route
app.use("/api/users", authLimiter, userRoutes);
app.use("/api/transactions", transactionLimiter, transactionRoutes);
app.use("/api/ai-advice", aiLimiter, aiRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
