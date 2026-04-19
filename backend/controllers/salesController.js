const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const stockService = require('../services/stockService');
const notificationService = require('../services/notificationService');

// @desc    Record a new sale
// @route   POST /api/sales
// @access  Private
exports.recordSale = async (req, res) => {
  try {
    const { item, quantity, paymentMethod, customerName } = req.body;

    // Validate stock availability using stock service
    const validation = await stockService.validateStockForSale(item, quantity);
    
    if (!validation.available) {
      return res.status(400).json({ 
        message: validation.message,
        available: false 
      });
    }

    // Find inventory item
    const inventoryItem = validation.item;

    // Calculate sale details
    const sellingPrice = inventoryItem.sellingPrice;
    const buyingPrice = inventoryItem.buyingPrice;
    const totalAmount = sellingPrice * quantity;
    const profit = (sellingPrice - buyingPrice) * quantity;

    // Create sale record
    const sale = await Sale.create({
      item,
      itemName: inventoryItem.itemName,
      category: inventoryItem.category,
      quantity,
      sellingPrice,
      buyingPrice,
      totalAmount,
      profit,
      worker: req.user._id,
      workerName: req.user.name,
      paymentMethod: paymentMethod || 'Cash',
      customerName
    });

    // Update inventory using stock service (triggers notifications & alerts)
    await stockService.deductStock(item, quantity, sale._id);

    // Create sale notification
    await notificationService.createSaleNotification(sale);

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
exports.getSales = async (req, res) => {
  try {
    const { startDate, endDate, worker, paymentMethod } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (worker) query.worker = worker;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    // Employees can only see their own sales
    if (req.user.role === 'employee') {
      query.worker = req.user._id;
    }

    const sales = await Sale.find(query)
      .populate('item', 'itemName category')
      .populate('worker', 'name email')
      .sort({ saleDate: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's sales
// @route   GET /api/sales/today
// @access  Private
exports.getTodaysSales = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let query = {
      saleDate: { $gte: startOfDay, $lte: endOfDay }
    };

    if (req.user.role === 'employee') {
      query.worker = req.user._id;
    }

    const sales = await Sale.find(query).sort({ saleDate: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sales statistics
// @route   GET /api/sales/stats
// @access  Private
exports.getSalesStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let query = {};
    if (req.user.role === 'employee') {
      query.worker = req.user._id;
    }

    // Today's stats - ONLY count completed sales
    const todaySales = await Sale.aggregate([
      { $match: { ...query, saleDate: { $gte: startOfDay }, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          totalItems: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    // All time stats - ONLY count completed sales
    const allTimeStats = await Sale.aggregate([
      { $match: { ...query, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          totalItems: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    // ALWAYS return valid numbers, never null/undefined
    res.json({
      today: todaySales[0] || { totalSales: 0, totalProfit: 0, totalItems: 0, count: 0 },
      allTime: allTimeStats[0] || { totalSales: 0, totalProfit: 0, totalItems: 0, count: 0 }
    });
  } catch (error) {
    console.error('[Sales Stats Error]:', error);
    // Return zeros on error, don't break the frontend
    res.json({
      today: { totalSales: 0, totalProfit: 0, totalItems: 0, count: 0 },
      allTime: { totalSales: 0, totalProfit: 0, totalItems: 0, count: 0 }
    });
  }
};

// @desc    Delete a sale
// @route   DELETE /api/sales/:id
// @access  Private (Admin only)
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Restore stock
    const inventoryItem = await Inventory.findById(sale.item);
    if (inventoryItem) {
      inventoryItem.quantity += sale.quantity;
      await inventoryItem.save();
    }

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted and stock restored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refund a sale
// @route   POST /api/sales/:id/refund
// @access  Private (Admin only)
exports.refundSale = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Restore stock
    const inventoryItem = await Inventory.findById(sale.item);
    if (inventoryItem) {
      inventoryItem.quantity += sale.quantity;
      await inventoryItem.save();
    }

    // Mark sale as refunded
    sale.status = 'refunded';
    sale.refundReason = reason;
    sale.refundDate = new Date();
    await sale.save();

    res.json({ 
      message: 'Sale refunded successfully',
      sale 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
