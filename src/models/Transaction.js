const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: { type: String, enum: ["income", "expense"], required: true },
        amount: { type: Number, required: true },
        category: { type: String, required: true },
        description: { type: String },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
