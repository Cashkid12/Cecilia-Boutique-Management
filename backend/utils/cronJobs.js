const cron = require('node-cron');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { sendWeeklyReport, sendMonthlyReport } = require('../utils/emailService');

// Weekly Report - Every Monday at 8 AM
cron.schedule('0 8 * * 1', async () => {
  console.log('Running weekly report cron job...');
  
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.weeklyReportEnabled) {
      console.log('Weekly reports are disabled');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Get weekly sales data
    const salesData = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    // Get weekly expenses
    const expenseData = await Expense.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]);

    // Get best seller
    const bestSeller = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$item',
          itemName: { $first: '$itemName' },
          quantity: { $sum: '$quantity' },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 1 }
    ]);

    // Get low stock count
    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', settings.lowStockThreshold || 3] }
    });

    const reportData = {
      weekStart: startDate.toLocaleDateString(),
      weekEnd: endDate.toLocaleDateString(),
      totalSales: salesData[0]?.totalSales || 0,
      totalProfit: salesData[0]?.totalProfit || 0,
      totalTransactions: salesData[0]?.totalTransactions || 0,
      totalExpenses: expenseData[0]?.totalExpenses || 0,
      netProfit: (salesData[0]?.totalProfit || 0) - (expenseData[0]?.totalExpenses || 0),
      bestSeller: bestSeller[0] || null,
      lowStockCount
    };

    await sendWeeklyReport(reportData);
    console.log('Weekly report completed');
  } catch (error) {
    console.error('Error in weekly report cron job:', error.message);
  }
});

// Monthly Report - 1st day of every month at 8 AM
cron.schedule('0 8 1 * *', async () => {
  console.log('Running monthly report cron job...');
  
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.monthlyReportEnabled) {
      console.log('Monthly reports are disabled');
      return;
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Current month data
    const currentMonthData = await Sale.aggregate([
      { $match: { saleDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    // Last month data for growth calculation
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const lastMonthData = await Sale.aggregate([
      { $match: { saleDate: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Calculate growth
    const currentSales = currentMonthData[0]?.totalSales || 0;
    const lastSales = lastMonthData[0]?.totalSales || 0;
    const growthPercentage = lastSales > 0 ? Math.round(((currentSales - lastSales) / lastSales) * 100) : null;

    // Get expenses
    const expenseData = await Expense.aggregate([
      { $match: { date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]);

    // Top categories
    const topCategories = await Sale.aggregate([
      { $match: { saleDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      {
        $group: {
          _id: '$category',
          category: { $first: '$category' },
          quantity: { $sum: '$quantity' },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Top workers
    const topWorkers = await Sale.aggregate([
      { $match: { saleDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }, worker: { $ne: null } } },
      {
        $group: {
          _id: '$worker',
          name: { $first: '$workerName' },
          salesCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    const reportData = {
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalSales: currentSales,
      totalProfit: currentMonthData[0]?.totalProfit || 0,
      totalTransactions: currentMonthData[0]?.totalTransactions || 0,
      totalExpenses: expenseData[0]?.totalExpenses || 0,
      netProfit: (currentMonthData[0]?.totalProfit || 0) - (expenseData[0]?.totalExpenses || 0),
      growthPercentage,
      topCategories,
      topWorkers
    };

    await sendMonthlyReport(reportData);
    console.log('Monthly report completed');
  } catch (error) {
    console.error('Error in monthly report cron job:', error.message);
  }
});

console.log('Cron jobs initialized successfully');
