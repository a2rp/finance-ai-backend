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

// ✅ Always define fixed routes BEFORE dynamic ones
router.route("/clear").delete(protect, clearAllTransactions); // 👈 MOVE THIS ABOVE

router.route("/").post(protect, addTransaction).get(protect, getTransactions);

router
    .route("/:id")
    .delete(protect, deleteTransaction)
    .put(protect, updateTransaction);

router.get("/summary", protect, getSummary);

module.exports = router;
