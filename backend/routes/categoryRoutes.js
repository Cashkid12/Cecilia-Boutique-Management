const express = require('express');
const router = express.Router();
const { getCategorySummary, getBestSellingCategory, getCategoryStats, getStockDistribution } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/category-stats', getCategoryStats);
router.get('/category-summary', getCategorySummary);
router.get('/best-category', getBestSellingCategory);
router.get('/stock-distribution', getStockDistribution);

module.exports = router;
