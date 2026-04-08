const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Inventory = require('../models/Inventory');

// @desc    Get dashboard overview
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardOverview = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfDay);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    let query = {};
    if (req.user.role === 'employee') {
      query.worker = req.user._id;
    }

    // Today's sales
    const todaySales = await Sale.aggregate([
      { $match: { ...query, saleDate: { $gte: startOfDay } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Yesterday's sales (for trend calculation)
    const yesterdaySales = await Sale.aggregate([
      { $match: { ...query, saleDate: { $gte: startOfYesterday, $lt: startOfDay } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate trends
    const todayTotal = todaySales[0]?.totalSales || 0;
    const yesterdayTotal = yesterdaySales[0]?.totalSales || 0;
    const todayProfit = todaySales[0]?.totalProfit || 0;
    const yesterdayProfit = yesterdaySales[0]?.totalProfit || 0;

    // Calculate percentage change
    const salesTrend = yesterdayTotal > 0 
      ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100)
      : 0;
    
    const profitTrend = yesterdayProfit > 0
      ? Math.round(((todayProfit - yesterdayProfit) / yesterdayProfit) * 100)
      : 0;

    // Total stock
    const totalStock = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: '$quantity' },
          totalProducts: { $sum: 1 }
        }
      }
    ]);

    // Low stock count
    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    });

    // Active workers
    const activeWorkers = await require('../models/User').countDocuments({
      role: 'employee',
      isActive: true
    });

    res.json({
      todaySales: {
        ...(todaySales[0] || { totalSales: 0, totalProfit: 0, count: 0 }),
        trend: salesTrend,
        profitTrend: profitTrend
      },
      totalStock: totalStock[0] || { totalItems: 0, totalProducts: 0 },
      lowStockCount,
      activeWorkers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get profit and loss report
// @route   GET /api/reports/profit-loss
// @access  Private (Admin only)
exports.getProfitAndLoss = async (req, res) => {
  try {
    const { period } = req.query; // daily, weekly, monthly, yearly
    let startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Calculate gross profit from sales
    const salesData = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: '$totalAmount' },
          grossProfit: { $sum: '$profit' },
          totalSales: { $sum: 1 }
        }
      }
    ]);

    // Calculate expenses
    const expenseData = await Expense.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]);

    const grossProfit = salesData[0]?.grossProfit || 0;
    const totalExpenses = expenseData[0]?.totalExpenses || 0;
    const netProfit = grossProfit - totalExpenses;

    res.json({
      period,
      grossRevenue: salesData[0]?.grossRevenue || 0,
      grossProfit,
      totalExpenses,
      netProfit,
      totalSales: salesData[0]?.totalSales || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sales trends
// @route   GET /api/reports/sales-trends
// @access  Private
exports.getSalesTrends = async (req, res) => {
  try {
    const { days } = req.query;
    const daysBack = parseInt(days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const salesTrend = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          sales: { $sum: '$totalAmount' },
          profit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(salesTrend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get best selling items
// @route   GET /api/reports/best-sellers
// @access  Private
exports.getBestSellers = async (req, res) => {
  try {
    const bestSellers = await Sale.aggregate([
      {
        $group: {
          _id: '$item',
          itemName: { $first: '$itemName' },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    res.json(bestSellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comprehensive report
// @route   GET /api/reports/comprehensive
// @access  Private (Admin only)
exports.getComprehensiveReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const salesData = await Sale.aggregate([
      { $match: { saleDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          totalItemsSold: { $sum: '$quantity' },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    const expenseData = await Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]);

    const inventoryData = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } }
        }
      }
    ]);

    res.json({
      period: { start, end },
      sales: salesData[0] || { totalRevenue: 0, totalProfit: 0, totalItemsSold: 0, salesCount: 0 },
      expenses: expenseData[0] || { totalExpenses: 0 },
      inventory: inventoryData[0] || { totalStock: 0, totalValue: 0 },
      netProfit: (salesData[0]?.totalProfit || 0) - (expenseData[0]?.totalExpenses || 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
