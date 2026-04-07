const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItem,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getLowStockAlerts
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getInventory)
  .post(protect, authorize('admin'), addInventoryItem);

router.route('/:id')
  .get(protect, getInventoryItem)
  .put(protect, authorize('admin'), updateInventoryItem)
  .delete(protect, authorize('admin'), deleteInventoryItem);

router.patch('/:id/stock', protect, updateStock);
router.get('/alerts/low-stock', protect, getLowStockAlerts);

module.exports = router;
