const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');

// @desc    Get stock summary by category
// @route   GET /api/dashboard/category-summary
// @access  Private
exports.getCategorySummary = async (req, res) => {
  try {
    // Get stock count by category
    const stockByCategory = await Inventory.aggregate([
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
                { $lte: ['$quantity', { $ifNull: ['$lowStockThreshold', 3] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { totalItems: -1 } }
    ]);

    // Get sales by category (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const salesByCategory = await Sale.aggregate([
      { $match: { saleDate: { $gte: startOfMonth } } },
      {
        $group: {
          _id: '$category',
          category: { $first: '$category' },
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          itemsSold: { $sum: '$quantity' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Get low stock items grouped by category
    const lowStockByCategory = await Inventory.aggregate([
      {
        $match: {
          $expr: { $lte: ['$quantity', { $ifNull: ['$lowStockThreshold', 3] }] }
        }
      },
      {
        $group: {
          _id: '$category',
          category: { $first: '$category' },
          items: {
            $push: {
              itemName: '$itemName',
              quantity: '$quantity',
              subcategory: '$subcategory'
            }
          }
        }
      },
      { $sort: { category: 1 } }
    ]);

    res.json({
      stockByCategory,
      salesByCategory,
      lowStockByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get best selling category
// @route   GET /api/dashboard/best-category
// @access  Private
exports.getBestSellingCategory = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const categoryPerformance = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate } } },
      {
        $group: {
          _id: '$category',
          category: { $first: '$category' },
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          itemsSold: { $sum: '$quantity' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 1 }
    ]);

    res.json(categoryPerformance[0] || { category: 'N/A', totalRevenue: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
