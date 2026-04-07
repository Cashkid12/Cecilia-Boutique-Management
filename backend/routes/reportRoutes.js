const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getProfitAndLoss,
  getSalesTrends,
  getBestSellers,
  getComprehensiveReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardOverview);
router.get('/profit-loss', protect, authorize('admin'), getProfitAndLoss);
router.get('/sales-trends', protect, getSalesTrends);
router.get('/best-sellers', protect, getBestSellers);
router.get('/comprehensive', protect, authorize('admin'), getComprehensiveReport);

module.exports = router;
