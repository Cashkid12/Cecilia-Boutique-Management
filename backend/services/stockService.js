const Inventory = require('../models/Inventory');
const Settings = require('../models/Settings');
const { createNotification } = require('../controllers/notificationController');
const { sendLowStockEmail } = require('../utils/emailService');

/**
 * Centralized Stock Management Service
 * Handles all stock-related operations and triggers system-wide updates
 */

// Update stock and trigger all related updates
exports.updateStock = async (itemId, newQuantity, actionType = 'manual', userId = null) => {
  try {
    const item = await Inventory.findById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    // Validate quantity
    if (newQuantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const oldQuantity = item.quantity;
    item.quantity = newQuantity;
    
    // Update stock status
    const settings = await Settings.findOne();
    const threshold = settings?.lowStockThreshold || 3;
    
    if (newQuantity === 0) {
      item.stockStatus = 'out_of_stock';
    } else if (newQuantity <= threshold) {
      item.stockStatus = 'low_stock';
    } else {
      item.stockStatus = 'in_stock';
    }

    await item.save();

    // Create activity log
    const activityLog = {
      itemId: item._id,
      itemName: item.itemName,
      action: actionType,
      oldQuantity,
      newQuantity,
      change: newQuantity - oldQuantity,
      userId,
      timestamp: new Date()
    };

    // Check and trigger low stock alerts
    if (newQuantity <= threshold && oldQuantity > threshold) {
      await this.handleLowStock(item);
    }

    // Check if restocked
    if (newQuantity > threshold && oldQuantity <= threshold) {
      await createNotification(
        'system',
        `Restocked: ${item.itemName} (${newQuantity} units)`,
        item._id,
        'Inventory'
      );
    }

    return {
      item,
      activityLog,
      metrics: await this.calculateStockMetrics()
    };
  } catch (error) {
    console.error('Error in updateStock:', error.message);
    throw error;
  }
};

// Handle low stock detection and notifications
exports.handleLowStock = async (item) => {
  try {
    // Create notification
    await createNotification(
      'low_stock',
      `Low stock: ${item.itemName} (${item.quantity} left)`,
      item._id,
      'Inventory'
    );

    // Get all low stock items for email
    const settings = await Settings.findOne();
    const threshold = settings?.lowStockThreshold || 3;
    
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', threshold] }
    }).select('itemName category subcategory quantity');

    // Send email if enabled
    if (settings?.lowStockEmailEnabled && lowStockItems.length > 0) {
      await sendLowStockEmail(lowStockItems);
    }

    return true;
  } catch (error) {
    console.error('Error in handleLowStock:', error.message);
    return false;
  }
};

// Calculate comprehensive stock metrics
exports.calculateStockMetrics = async () => {
  try {
    const settings = await Settings.findOne();
    const threshold = settings?.lowStockThreshold || 3;

    const metrics = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: '$quantity' },
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$buyingPrice'] } },
          expectedRevenue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } }
        }
      }
    ]);

    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', threshold] }
    });

    const outOfStockCount = await Inventory.countDocuments({ quantity: 0 });

    return {
      totalItems: metrics[0]?.totalItems || 0,
      totalProducts: metrics[0]?.totalProducts || 0,
      totalValue: metrics[0]?.totalValue || 0,
      expectedRevenue: metrics[0]?.expectedRevenue || 0,
      lowStockCount,
      outOfStockCount
    };
  } catch (error) {
    console.error('Error calculating stock metrics:', error.message);
    return {
      totalItems: 0,
      totalProducts: 0,
      totalValue: 0,
      expectedRevenue: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    };
  }
};

// Get stock by category
exports.getStockByCategory = async () => {
  try {
    const categoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: '$category',
          category: { $first: '$category' },
          totalItems: { $sum: '$quantity' },
          productCount: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$buyingPrice'] } }
        }
      },
      { $sort: { totalItems: -1 } }
    ]);

    return categoryStats;
  } catch (error) {
    console.error('Error getting stock by category:', error.message);
    return [];
  }
};

// Validate stock availability for sale
exports.validateStockForSale = async (itemId, requestedQuantity) => {
  try {
    const item = await Inventory.findById(itemId);
    
    if (!item) {
      return {
        available: false,
        message: 'Item not found'
      };
    }

    if (item.quantity === 0) {
      return {
        available: false,
        message: `${item.itemName} is out of stock`,
        item
      };
    }

    if (item.quantity < requestedQuantity) {
      return {
        available: false,
        message: `Only ${item.quantity} ${item.itemName}(s) available`,
        item
      };
    }

    return {
      available: true,
      message: 'Stock available',
      item
    };
  } catch (error) {
    console.error('Error validating stock:', error.message);
    return {
      available: false,
      message: 'Error validating stock'
    };
  }
};

// Deduct stock after sale
exports.deductStock = async (itemId, quantity, saleId) => {
  try {
    const item = await Inventory.findById(itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.quantity < quantity) {
      throw new Error(`Insufficient stock. Only ${item.quantity} available`);
    }

    const newQuantity = item.quantity - quantity;
    
    return await this.updateStock(itemId, newQuantity, 'sale', null);
  } catch (error) {
    console.error('Error deducting stock:', error.message);
    throw error;
  }
};

// Bulk update stock (for imports or major restocks)
exports.bulkUpdateStock = async (updates) => {
  try {
    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const result = await this.updateStock(
          update.itemId,
          update.quantity,
          update.actionType || 'bulk_update',
          update.userId
        );
        results.push(result);
      } catch (error) {
        errors.push({ itemId: update.itemId, error: error.message });
      }
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors
    };
  } catch (error) {
    console.error('Error in bulk update:', error.message);
    throw error;
  }
};
