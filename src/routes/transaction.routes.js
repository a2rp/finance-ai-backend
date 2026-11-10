const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const {
    addTransaction,
    getTransactions,
    deleteTransaction,
    getSummary,
    updateTransaction,
    clearAllTransactions,
} = require("../controllers/transaction.controller");

const router = express.Router();

router.get("/summary", protect, getSummary);
router.delete("/clear", protect, clearAllTransactions);

router.route("/").post(protect, addTransaction).get(protect, getTransactions);

router
    .route("/:id")
    .delete(protect, deleteTransaction)
    .put(protect, updateTransaction);

module.exports = router;
