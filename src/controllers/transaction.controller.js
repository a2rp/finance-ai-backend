const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const supportedFields = ["type", "amount", "category", "description", "date"];

const validateTransaction = (body, partial = false) => {
    if (!isObject(body)) return { error: "A JSON object is required." };

    const updates = {};
    for (const field of supportedFields) {
        if (has(body, field)) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
        return { error: "Provide at least one supported transaction field." };
    }

    if ((!partial || has(updates, "type")) && !["income", "expense"].includes(updates.type)) {
        return { error: "Type must be income or expense." };
    }
    if ((!partial || has(updates, "amount")) && (typeof updates.amount !== "number" || !Number.isFinite(updates.amount) || updates.amount <= 0)) {
        return { error: "Amount must be a finite number greater than zero." };
    }
    if ((!partial || has(updates, "category")) && (typeof updates.category !== "string" || !updates.category.trim() || updates.category.trim().length > 80)) {
        return { error: "Category must be between 1 and 80 characters." };
    }
    if (has(updates, "description")) {
        if (typeof updates.description !== "string" || updates.description.length > 500) {
            return { error: "Description must be a string of at most 500 characters." };
        }
        updates.description = updates.description.trim();
    }
    if (has(updates, "date")) {
        if (typeof updates.date !== "string" || !updates.date.trim() || !Number.isFinite(Date.parse(updates.date))) {
            return { error: "Date must be a valid date string." };
        }
        updates.date = new Date(updates.date);
    }
    if (has(updates, "category")) updates.category = updates.category.trim();

    return { updates };
};

const addTransaction = async (req, res) => {
    const { updates, error } = validateTransaction(req.body);
    if (error) return res.status(400).json({ message: error });

    const transaction = await Transaction.create({ ...updates, user: req.user._id });
    return res.status(201).json(transaction);
};

const getTransactions = async (req, res) => {
    const transactions = await Transaction.find({ user: req.user._id })
        .sort({ date: -1 })
        .lean();
    return res.json(transactions);
};

const deleteTransaction = async (req, res) => {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        return res.status(404).json({ message: "Transaction not found." });
    }

    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });

    await transaction.deleteOne();
    return res.json({ message: "Deleted successfully." });
};

const getSummary = async (req, res) => {
    const [summary] = await Transaction.aggregate([
        { $match: { user: req.user._id } },
        {
            $group: {
                _id: null,
                totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
            },
        },
    ]);

    const totalIncome = summary?.totalIncome || 0;
    const totalExpense = summary?.totalExpense || 0;
    return res.json({ totalIncome, totalExpense, netSavings: totalIncome - totalExpense });
};

const updateTransaction = async (req, res) => {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        return res.status(404).json({ message: "Transaction not found." });
    }

    const { updates, error } = validateTransaction(req.body, true);
    if (error) return res.status(400).json({ message: error });

    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });

    Object.assign(transaction, updates);
    await transaction.save();
    return res.json(transaction);
};

const clearAllTransactions = async (req, res) => {
    const result = await Transaction.deleteMany({ user: req.user._id });
    return res.json({ message: "All transactions cleared.", deletedCount: result.deletedCount });
};

module.exports = {
    addTransaction,
    getTransactions,
    deleteTransaction,
    getSummary,
    updateTransaction,
    clearAllTransactions,
};
