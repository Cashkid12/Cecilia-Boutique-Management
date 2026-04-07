const express = require('express');
const router = express.Router();
const { getDashboardData, getQuickStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboardData);
router.get('/stats', protect, getQuickStats);

module.exports = router;
