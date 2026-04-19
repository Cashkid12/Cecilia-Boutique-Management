const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');

// All 13 categories with their icons
const ALL_CATEGORIES = [
  "Men's Trousers",
  'Ladies Trousers',
  'Boys Trouser',
  'Girls Trouser',
  'Shorts',
  'T-Shirts',
  'T-Shirt Boys',
  'T-Shirt Girls',
  'Socks',
  'Vests',
  'Jackets Men',
  'Jackets Ladies',
  'Jackets Kids'
];

// Category colors for pie chart
const CATEGORY_COLORS = [
  '#D6C2A1', '#C4AD8D', '#B89B72', '#A88960', '#987A52',
  '#8B6F48', '#C9B99A', '#B8A582', '#D4C4A8', '#E0D2B8',
  '#BFA88C', '#A69274', '#968062'
];

// @desc    Get detailed category stats for dashboard grid
// @route   GET /api/dashboard/category-stats
// @access  Private
exports.getCategoryStats = async (req, res) => {
  try {
    // Get stock stats by category
    const categoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: '$category',
          category: { $first: '$category' },
          totalItems: { $sum: '$quantity' },
          productCount: { $sum: 1 },
          lowStockCount: {
            $sum: {
              $cond: [
                { $lte: ['$quantity', 5] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Create a map of category stats
    const statsMap = {};
    categoryStats.forEach(stat => {
      statsMap[stat.category] = stat;
    });

    // Build response with ALL 13 categories (even if no items)
    const result = ALL_CATEGORIES.map(category => {
      const stat = statsMap[category] || {
        category,
        totalItems: 0,
        productCount: 0,
        lowStockCount: 0
      };
      return {
        category: stat.category,
        totalItems: stat.totalItems,
        productCount: stat.productCount,
        lowStockCount: stat.lowStockCount
      };
    });

    res.json(result);
  } catch (error) {
    console.error('[Category Stats Error]:', error);
    // Return empty stats for all categories on error
    res.json(
      ALL_CATEGORIES.map(category => ({
        category,
        totalItems: 0,
        productCount: 0,
        lowStockCount: 0
      }))
    );
  }
};

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
    console.error('[Best Category Error]:', error);
    res.json({ category: 'N/A', totalRevenue: 0 });
  }
};

// @desc    Get stock distribution by category for pie chart
// @route   GET /api/dashboard/stock-distribution
// @access  Private
exports.getStockDistribution = async (req, res) => {
  try {
    // Get stock count by category
    const stockByCategory = await Inventory.aggregate([
      {
        $group: {
          _id: '$category',
          category: { $first: '$category' },
          count: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Calculate total stock
    const totalStock = stockByCategory.reduce((sum, cat) => sum + cat.count, 0);

    // Build response with ALL 13 categories
    const result = ALL_CATEGORIES.map((category, index) => {
      const stat = stockByCategory.find(c => c.category === category);
      const count = stat ? stat.count : 0;
      const percentage = totalStock > 0 ? ((count / totalStock) * 100).toFixed(1) : 0;
      
      return {
        category,
        count,
        percentage: parseFloat(percentage),
        color: CATEGORY_COLORS[index]
      };
    });

    res.json(result);
  } catch (error) {
    console.error('[Stock Distribution Error]:', error);
    // Return empty distribution on error
    res.json(
      ALL_CATEGORIES.map((category, index) => ({
        category,
        count: 0,
        percentage: 0,
        color: CATEGORY_COLORS[index]
      }))
    );
  }
};
