const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const Inventory = require('../models/Inventory');
const { sendLowStockEmail } = require('../utils/emailService');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = unreadOnly === 'true' ? { isRead: false } : {};
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create notification and check for low stock
// @route   Internal helper function
exports.createNotification = async (type, message, relatedItem = null, relatedModel = null) => {
  try {
    const notification = await Notification.create({
      type,
      message,
      relatedItem,
      relatedModel
    });

    // If it's a low stock notification, check if we should send email
    if (type === 'low_stock') {
      await checkAndSendLowStockEmail();
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

// Helper function to check and send low stock email
const checkAndSendLowStockEmail = async () => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings || !settings.lowStockEmailEnabled) return;

    const threshold = settings.lowStockThreshold || 3;

    // Get all low stock items
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', threshold] }
    }).select('itemName category subcategory quantity');

    if (lowStockItems.length > 0) {
      await sendLowStockEmail(lowStockItems);
    }
  } catch (error) {
    console.error('Error checking low stock:', error.message);
  }
};

// @desc    Get notification stats
// @route   GET /api/notifications/stats
// @access  Private
exports.getNotificationStats = async (req, res) => {
  try {
    const total = await Notification.countDocuments();
    const unread = await Notification.countDocuments({ isRead: false });
    const lowStock = await Notification.countDocuments({ type: 'low_stock', isRead: false });
    const newSales = await Notification.countDocuments({ type: 'new_sale', isRead: false });

    res.json({
      total,
      unread,
      lowStock,
      newSales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
