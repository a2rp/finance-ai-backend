const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: { type: String, enum: ["income", "expense"], required: true },
        amount: {
            type: Number,
            required: true,
            validate: {
                validator: (amount) => Number.isFinite(amount) && amount > 0,
                message: "Amount must be a finite number greater than zero.",
            },
        },
        category: { type: String, required: true, trim: true, maxlength: 80 },
        description: { type: String, trim: true, maxlength: 500 },
        date: { type: Date, default: Date.now, required: true },
    },
    { timestamps: true },
);

transactionSchema.index({ user: 1, date: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
