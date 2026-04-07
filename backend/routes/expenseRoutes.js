const express = require('express');
const router = express.Router();
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin'), getExpenses)
  .post(protect, authorize('admin'), addExpense);

router.route('/:id')
  .put(protect, authorize('admin'), updateExpense)
  .delete(protect, authorize('admin'), deleteExpense);

router.get('/summary', protect, authorize('admin'), getExpenseSummary);

module.exports = router;
