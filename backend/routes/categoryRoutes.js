const express = require('express');
const router = express.Router();
const { getCategorySummary, getBestSellingCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/category-summary', getCategorySummary);
router.get('/best-category', getBestSellingCategory);

module.exports = router;
