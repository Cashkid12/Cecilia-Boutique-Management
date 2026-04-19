const express = require('express');
const router = express.Router();
const { getDashboardData, getQuickStats, getSalesChart, getRecentSales, getLowStockAlerts, getAllDashboardData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboardData);
router.get('/all', protect, getAllDashboardData);
router.get('/stats', protect, getQuickStats);
router.get('/sales-chart', protect, getSalesChart);
router.get('/recent-sales', protect, getRecentSales);
router.get('/low-stock', protect, getLowStockAlerts);

module.exports = router;
