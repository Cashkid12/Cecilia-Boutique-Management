const Inventory = require('../models/Inventory');
const { createNotification } = require('./notificationController');
const Settings = require('../models/Settings');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } }
      ];
    }
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
    }

    const inventory = await Inventory.find(query).sort({ createdAt: -1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private (Admin only)
exports.addInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    
    // Check if item is low stock
    const settings = await Settings.findOne();
    const threshold = settings?.lowStockThreshold || 3;
    
    if (item.quantity <= threshold) {
      await createNotification(
        'low_stock',
        `Low stock: ${item.itemName} (${item.quantity} left)`,
        item._id,
        'Inventory'
      );
    }
    
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Admin only)
exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Check if stock became low after update
    const settings = await Settings.findOne();
    const threshold = settings?.lowStockThreshold || 3;
    
    if (updatedItem.quantity <= threshold && item.quantity > threshold) {
      await createNotification(
        'low_stock',
        `Low stock alert: ${updatedItem.itemName} (${updatedItem.quantity} left)`,
        updatedItem._id,
        'Inventory'
      );
    }
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin only)
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update stock quantity
// @route   PATCH /api/inventory/:id/stock
// @access  Private
exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/alerts/low-stock
// @access  Private
exports.getLowStockAlerts = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    });
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
