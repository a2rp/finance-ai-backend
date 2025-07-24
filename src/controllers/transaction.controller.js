const Transaction = require("../models/Transaction");

// @desc    Add transaction
const addTransaction = async (req, res) => {
    const { type, amount, category, description, date } = req.body;
    const transaction = new Transaction({
        user: req.user._id,
        type,
        amount,
        category,
        description,
        date,
    });
    const saved = await transaction.save();
    res.status(201).json(saved);
};

// @desc    Get all transactions for logged-in user
const getTransactions = async (req, res) => {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
        date: -1,
    });
    res.json(transactions);
};

// @desc    Delete transaction
const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const transaction = await Transaction.findOne({
        _id: id,
        user: req.user._id,
    });

    if (!transaction)
        return res.status(404).json({ message: "Transaction not found" });

    await transaction.deleteOne();
    res.json({ message: "Deleted successfully" });
};

// @desc   Get financial summary (income, expense, savings)
// @route  GET /api/transactions/summary
// @access Private
const getSummary = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((txn) => {
            if (txn.type === "income") totalIncome += txn.amount;
            else if (txn.type === "expense") totalExpense += txn.amount;
        });

        const netSavings = totalIncome - totalExpense;

        res.json({ totalIncome, totalExpense, netSavings });
    } catch (error) {
        res.status(500).json({ message: "Failed to calculate summary" });
    }
};

const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;

    try {
        const transaction = await Transaction.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        transaction.type = type || transaction.type;
        transaction.amount = amount || transaction.amount;
        transaction.category = category || transaction.category;
        transaction.description = description || transaction.description;
        transaction.date = date || transaction.date;

        const updated = await transaction.save();
        res.status(200).json(updated);
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ message: "Failed to update transaction" });
    }
};

// @desc Delete all transactions of user
const clearAllTransactions = async (req, res) => {
    // console.log("Clearing all transactions for user:", req.user._id);

    try {
        await Transaction.deleteMany({ user: req.user._id });
        res.json({ message: "All transactions cleared" });
    } catch (err) {
        res.status(500).json({ message: "Failed to clear transactions" });
    }
};

module.exports = {
    addTransaction,
    getTransactions,
    deleteTransaction,
    getSummary,
    updateTransaction,
    clearAllTransactions,
};
