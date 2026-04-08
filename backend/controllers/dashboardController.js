const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Expense = require('../models/Expense');
const User = require('../models/User');
const stockService = require('../services/stockService');

// @desc    Get comprehensive dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let query = {};
    // Employees only see their own data
    if (req.user.role === 'employee') {
      query.worker = req.user._id;
    }

    // Today's sales
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

    // Weekly sales
    const weeklySales = await Sale.aggregate([
      { $match: { ...query, saleDate: { $gte: startOfWeek }, status: 'completed' } },
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

    // Monthly sales
    const monthlySales = await Sale.aggregate([
      { $match: { ...query, saleDate: { $gte: startOfMonth }, status: 'completed' } },
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

    // All time sales
    const allTimeSales = await Sale.aggregate([
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

    // Today's expenses (admin only sees all, employees see none)
    let todayExpenses = [{ totalExpenses: 0 }];
    let monthlyExpenses = [{ totalExpenses: 0 }];
    
    if (req.user.role === 'admin') {
      const todayExpResult = await Expense.aggregate([
        { $match: { expenseDate: { $gte: startOfDay } } },
        { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
      ]);
      todayExpenses = todayExpResult.length > 0 ? todayExpResult : [{ totalExpenses: 0 }];

      const monthExpResult = await Expense.aggregate([
        { $match: { expenseDate: { $gte: startOfMonth } } },
        { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
      ]);
      monthlyExpenses = monthExpResult.length > 0 ? monthExpResult : [{ totalExpenses: 0 }];
    }

    // Inventory stats
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$buyingPrice'] } }
        }
      }
    ]);

    // Low stock items
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', { $ifNull: ['$lowStockThreshold', 5] }] }
    }).limit(5);

    // Recent sales
    const recentSales = await Sale.find(query)
      .sort({ saleDate: -1 })
      .limit(5)
      .populate('worker', 'name');

    // Worker count (admin only)
    let workerCount = 0;
    if (req.user.role === 'admin') {
      workerCount = await User.countDocuments({ role: 'employee', isActive: true });
    }

    // Calculate net profit
    const grossProfit = allTimeSales[0]?.totalProfit || 0;
    const totalExpenses = monthlyExpenses[0]?.totalExpenses || 0;
    const netProfit = req.user.role === 'admin' ? grossProfit - totalExpenses : grossProfit;

    res.json({
      today: {
        sales: todaySales[0]?.totalSales || 0,
        profit: todaySales[0]?.totalProfit || 0,
        items: todaySales[0]?.totalItems || 0,
        transactions: todaySales[0]?.count || 0,
        expenses: todayExpenses[0]?.totalExpenses || 0
      },
      weekly: {
        sales: weeklySales[0]?.totalSales || 0,
        profit: weeklySales[0]?.totalProfit || 0,
        items: weeklySales[0]?.totalItems || 0,
        transactions: weeklySales[0]?.count || 0
      },
      monthly: {
        sales: monthlySales[0]?.totalSales || 0,
        profit: monthlySales[0]?.totalProfit || 0,
        items: monthlySales[0]?.totalItems || 0,
        transactions: monthlySales[0]?.count || 0,
        expenses: monthlyExpenses[0]?.totalExpenses || 0
      },
      allTime: {
        sales: allTimeSales[0]?.totalSales || 0,
        profit: allTimeSales[0]?.totalProfit || 0,
        items: allTimeSales[0]?.totalItems || 0,
        transactions: allTimeSales[0]?.count || 0,
        netProfit
      },
      inventory: {
        totalProducts: inventoryStats[0]?.totalProducts || 0,
        totalStock: inventoryStats[0]?.totalStock || 0,
        totalValue: inventoryStats[0]?.totalValue || 0
      },
      lowStockItems,
      recentSales,
      workers: workerCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get real-time stats (lightweight endpoint for frequent polling)
// @route   GET /api/dashboard/stats
// @access  Private
exports.getQuickStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let query = {};
    if (req.user.role === 'employee') {
      query.worker = req.user._id;
    }

    const todayStats = await Sale.aggregate([
      { $match: { ...query, saleDate: { $gte: startOfDay }, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      }
    ]);

    let expenses = 0;
    if (req.user.role === 'admin') {
      const expResult = await Expense.aggregate([
        { $match: { expenseDate: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      expenses = expResult[0]?.total || 0;
    }

    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', { $ifNull: ['$lowStockThreshold', 5] }] }
    });

    res.json({
      todaySales: todayStats[0]?.totalSales || 0,
      todayProfit: todayStats[0]?.totalProfit || 0,
      todayTransactions: todayStats[0]?.count || 0,
      todayExpenses: expenses,
      lowStockCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
