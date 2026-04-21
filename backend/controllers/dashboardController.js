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
    console.error('[Dashboard Error]:', error);
    // Return safe default data instead of breaking
    res.json({
      today: { sales: 0, profit: 0, items: 0, transactions: 0, expenses: 0 },
      weekly: { sales: 0, profit: 0, items: 0, transactions: 0 },
      monthly: { sales: 0, profit: 0, items: 0, transactions: 0, expenses: 0 },
      allTime: { sales: 0, profit: 0, items: 0, transactions: 0, netProfit: 0 },
      inventory: { totalProducts: 0, totalStock: 0, totalValue: 0 },
      lowStockItems: [],
      recentSales: [],
      workers: 0
    });
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

    // Get total stock from inventory
    const totalStock = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' }
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
      lowStockCount,
      totalStock: totalStock[0]?.totalQuantity || 0,
      // TODO: Add trend calculations (salesTrend, profitTrend)
      salesTrend: 0,
      profitTrend: 0
    });
  } catch (error) {
    console.error('[Quick Stats Error]:', error);
    // Return safe defaults on error
    res.json({
      todaySales: 0,
      todayProfit: 0,
      todayTransactions: 0,
      todayExpenses: 0,
      lowStockCount: 0,
      totalStock: 0,
      salesTrend: 0,
      profitTrend: 0
    });
  }
};

// @desc    Get sales chart data by period
// @route   GET /api/dashboard/sales-chart?period=today|week|month
// @access  Private
exports.getSalesChart = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let startDate = new Date();
    let dateFormat = '%Y-%m-%d';

    // Calculate date range based on period
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        dateFormat = '%H:00';
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
    }

    // Get sales data
    const salesData = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$saleDate' } },
          amount: { $sum: '$totalAmount' },
          profit: { $sum: '$profit' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create a map of the sales data
    const dataMap = {};
    salesData.forEach(item => {
      dataMap[item._id] = item;
    });

    // Generate labels based on period
    const result = [];
    if (period === 'today') {
      for (let hour = 0; hour < 24; hour++) {
        const label = `${hour.toString().padStart(2, '0')}:00`;
        result.push({
          date: label,
          amount: dataMap[label]?.amount || 0,
          profit: dataMap[label]?.profit || 0,
          count: dataMap[label]?.count || 0
        });
      }
    } else if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const label = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        result.push({
          date: dayName,
          fullDate: label,
          amount: dataMap[label]?.amount || 0,
          profit: dataMap[label]?.profit || 0,
          count: dataMap[label]?.count || 0
        });
      }
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const label = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        result.push({
          date: dayName,
          fullDate: label,
          amount: dataMap[label]?.amount || 0,
          profit: dataMap[label]?.profit || 0,
          count: dataMap[label]?.count || 0
        });
      }
    }

    // Calculate total and trend
    const totalAmount = result.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate trend vs previous period
    let previousStartDate = new Date(startDate);
    let previousEndDate = new Date(startDate);
    
    if (period === 'today') {
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
    } else if (period === 'week') {
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
    } else if (period === 'month') {
      previousStartDate.setDate(previousStartDate.getDate() - 30);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
    }

    const previousData = await Sale.aggregate([
      { $match: { 
        saleDate: { $gte: previousStartDate, $lt: previousEndDate },
        status: 'completed'
      }},
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const previousTotal = previousData[0]?.total || 0;
    const trend = previousTotal > 0 ? ((totalAmount - previousTotal) / previousTotal * 100).toFixed(1) : 0;

    res.json({
      data: result,
      total: totalAmount,
      trend: parseFloat(trend),
      trendUp: totalAmount >= previousTotal
    });
  } catch (error) {
    console.error('[Sales Chart Error]:', error);
    res.json({
      data: [],
      total: 0,
      trend: 0,
      trendUp: true
    });
  }
};

// @desc    Get recent sales for dashboard
// @route   GET /api/dashboard/recent-sales?limit=10
// @access  Private
exports.getRecentSales = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let query = { saleDate: { $gte: startOfDay }, status: 'completed' };
    
    // Employees only see their own sales
    if (req.user.role === 'employee') {
      query.worker = req.user._id;
    }

    const recentSales = await Sale.find(query)
      .sort({ saleDate: -1 })
      .limit(limit)
      .select('itemName quantity totalAmount saleDate');

    // Format the response
    const result = recentSales.map(sale => ({
      id: sale._id,
      itemName: sale.itemName,
      quantity: sale.quantity,
      amount: sale.totalAmount,
      time: sale.saleDate
    }));

    res.json(result);
  } catch (error) {
    console.error('[Recent Sales Error]:', error);
    res.json([]);
  }
};

// @desc    Get low stock alerts grouped by category
// @route   GET /api/dashboard/low-stock
// @access  Private
exports.getLowStockAlerts = async (req, res) => {
  try {
    // Get items with quantity < 5
    const lowStockItems = await Inventory.find({
      quantity: { $lt: 5 }
    }).select('category itemName buyingPrice quantity');

    // Group by category
    const groupedByCategory = {};
    lowStockItems.forEach(item => {
      if (!groupedByCategory[item.category]) {
        groupedByCategory[item.category] = {
          category: item.category,
          items: []
        };
      }
      groupedByCategory[item.category].items.push({
        itemName: item.itemName,
        buyingPrice: item.buyingPrice,
        quantity: item.quantity
      });
    });

    // Convert to array
    const result = Object.values(groupedByCategory);

    res.json(result);
  } catch (error) {
    console.error('[Low Stock Alerts Error]:', error);
    res.json([]);
  }
};

// @desc    Get all dashboard data in single request
// @route   GET /api/dashboard/all
// @access  Private
exports.getAllDashboardData = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const previousWeekStart = new Date();
    previousWeekStart.setDate(previousWeekStart.getDate() - 14);
    
    const previousWeekEnd = new Date();
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

    let query = {};
    // Employees only see their own data
    if (req.user.role === 'employee') {
      query.worker = req.user._id;
    }

    // Fetch all data in parallel
    const [
      todayStats,
      previousStats,
      profitStats,
      inventoryStats,
      lowStockCount,
      categoryStats,
      salesChart,
      stockDistribution,
      recentSales,
      lowStockItems,
      workers,
      expenses,
      bestSellers
    ] = await Promise.all([
      // Today's stats
      Sale.aggregate([
        { $match: { 
          ...query, 
          saleDate: { $gte: startOfDay, $lt: endOfDay }, 
          status: 'completed' 
        } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            totalProfit: { $sum: '$profit' },
            totalItems: { $sum: '$quantity' },
            count: { $sum: 1 }
          }
        }
      ]),

      // Previous week stats (for trend calculation)
      Sale.aggregate([
        { $match: { 
          ...query, 
          saleDate: { $gte: previousWeekStart, $lt: previousWeekEnd }, 
          status: 'completed' 
        } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            totalProfit: { $sum: '$profit' }
          }
        }
      ]),

      // Total profit (all time)
      Sale.aggregate([
        { $match: { ...query, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalProfit: { $sum: '$profit' }
          }
        }
      ]),

      // Total stock
      Inventory.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: '$quantity' }
          }
        }
      ]),

      // Low stock count
      Inventory.countDocuments({
        $expr: { $lte: ['$quantity', { $ifNull: ['$lowStockThreshold', 5] }] }
      }),

      // Category stats
      Inventory.aggregate([
        {
          $group: {
            _id: '$category',
            category: { $first: '$category' },
            totalItems: { $sum: '$quantity' },
            productCount: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$quantity', '$buyingPrice'] } },
            lowStockCount: {
              $sum: {
                $cond: [
                  { $lte: ['$quantity', { $ifNull: ['$lowStockThreshold', 5] }] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Sales chart data (this week)
      Sale.aggregate([
        { $match: { 
          ...query, 
          saleDate: { $gte: startOfWeek }, 
          status: 'completed' 
        } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
            amount: { $sum: '$totalAmount' },
            profit: { $sum: '$profit' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Stock distribution by category
      Inventory.aggregate([
        {
          $group: {
            _id: '$category',
            category: { $first: '$category' },
            count: { $sum: '$quantity' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Recent sales (today)
      Sale.find({ 
        saleDate: { $gte: startOfDay }, 
        status: 'completed',
        ...query 
      })
        .sort({ saleDate: -1 })
        .limit(10)
        .select('itemName quantity totalAmount saleDate'),

      // Low stock items grouped by category
      Inventory.find({ quantity: { $lt: 5 } }).select('category itemName buyingPrice quantity'),

      // Workers with today's sales (admin only)
      req.user.role === 'admin' ? (async () => {
        const workers = await User.find({ role: 'employee', isActive: true }).select('name email phone');
        
        // Add today's sales for each worker
        const workersWithSales = await Promise.all(
          workers.map(async (worker) => {
            const todaySales = await Sale.aggregate([
              { $match: { worker: worker._id, saleDate: { $gte: startOfDay }, status: 'completed' } },
              {
                $group: {
                  _id: null,
                  totalSales: { $sum: '$totalAmount' },
                  count: { $sum: 1 }
                }
              }
            ]);
            
            return {
              _id: worker._id,
              name: worker.name,
              email: worker.email,
              phone: worker.phone,
              todaySales: todaySales[0] || { totalSales: 0, count: 0 }
            };
          })
        );
        
        return workersWithSales;
      })() : [],

      // Recent expenses (admin only)
      req.user.role === 'admin' ? Expense.find().sort({ expenseDate: -1 }).limit(5) : [],

      // Best sellers (this week)
      Sale.aggregate([
        { $match: { 
          saleDate: { $gte: startOfWeek }, 
          status: 'completed',
          ...query 
        } },
        {
          $group: {
            _id: '$item',
            itemName: { $first: '$itemName' },
            totalQuantity: { $sum: '$quantity' },
            totalRevenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 3 }
      ])
    ]);

    // Calculate trends
    const todaySales = todayStats[0]?.totalSales || 0;
    const todayProfit = todayStats[0]?.totalProfit || 0;
    const previousSales = previousStats[0]?.totalSales || 0;
    const previousProfit = previousStats[0]?.totalProfit || 0;

    const salesTrend = previousSales > 0 
      ? (((todaySales - previousSales) / previousSales) * 100).toFixed(1) 
      : 0;
    
    const profitTrend = previousProfit > 0 
      ? (((todayProfit - previousProfit) / previousProfit) * 100).toFixed(1) 
      : 0;

    // Format sales chart data
    const formattedSalesChart = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toISOString().split('T')[0];
      const dayData = salesChart.find(item => item._id === label);
      
      formattedSalesChart.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayData?.amount || 0
      });
    }

    // Calculate stock distribution with percentages
    const totalStockValue = stockDistribution.reduce((sum, cat) => sum + cat.count, 0);
    const formattedStockDistribution = stockDistribution.map(cat => ({
      category: cat.category,
      count: cat.count,
      percentage: totalStockValue > 0 
        ? parseFloat(((cat.count / totalStockValue) * 100).toFixed(1)) 
        : 0
    }));

    // Group low stock items by category
    const groupedLowStock = {};
    lowStockItems.forEach(item => {
      if (!groupedLowStock[item.category]) {
        groupedLowStock[item.category] = {
          category: item.category,
          items: []
        };
      }
      groupedLowStock[item.category].items.push({
        itemName: item.itemName,
        buyingPrice: item.buyingPrice,
        quantity: item.quantity
      });
    });

    res.json({
      stats: {
        todaySales,
        totalProfit: profitStats[0]?.totalProfit || 0,
        totalStock: inventoryStats[0]?.totalStock || 0,
        lowStockCount,
        salesTrend: parseFloat(salesTrend),
        profitTrend: parseFloat(profitTrend)
      },
      categoryStats,
      salesChart: formattedSalesChart,
      stockDistribution: formattedStockDistribution,
      bestSellers,
      recentSales: recentSales.map(sale => ({
        id: sale._id,
        itemName: sale.itemName,
        quantity: sale.quantity,
        amount: sale.totalAmount,
        time: sale.saleDate
      })),
      lowStockItems: Object.values(groupedLowStock),
      workers: workers || [],
      expenses: expenses || []
    });
  } catch (error) {
    console.error('[All Dashboard Data Error]:', error);
    res.status(500).json({ message: error.message });
  }
};
