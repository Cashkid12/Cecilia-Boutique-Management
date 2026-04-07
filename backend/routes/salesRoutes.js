const express = require('express');
const router = express.Router();
const {
  recordSale,
  getSales,
  getTodaysSales,
  getSalesStats,
  deleteSale,
  refundSale
} = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getSales)
  .post(protect, recordSale);

router.get('/today', protect, getTodaysSales);
router.get('/stats', protect, getSalesStats);
router.delete('/:id', protect, authorize('admin'), deleteSale);
router.post('/:id/refund', protect, authorize('admin'), refundSale);

module.exports = router;