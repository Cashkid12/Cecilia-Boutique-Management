const Notification = require('../models/Notification');

/**
 * Centralized Notification Service
 * Handles all notification operations across the system
 */

// Create notification
exports.createNotification = async (type, message, relatedItem = null, relatedModel = null) => {
  try {
    const notification = await Notification.create({
      type,
      message,
      relatedItem,
      relatedModel
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

// Create sale notification
exports.createSaleNotification = async (sale) => {
  try {
    const message = `New sale: ${sale.itemName} (${sale.quantity} units) - KSh ${sale.totalAmount}`;
    
    return await this.createNotification(
      'new_sale',
      message,
      sale._id,
      'Sale'
    );
  } catch (error) {
    console.error('Error creating sale notification:', error.message);
    return null;
  }
};

// Create expense notification
exports.createExpenseNotification = async (expense) => {
  try {
    const message = `Expense added: ${expense.category} - KSh ${expense.amount}`;
    
    return await this.createNotification(
      'expense_added',
      message,
      expense._id,
      'Expense'
    );
  } catch (error) {
    console.error('Error creating expense notification:', error.message);
    return null;
  }
};

// Create worker notification
exports.createWorkerNotification = async (worker) => {
  try {
    const message = `New worker added: ${worker.name}`;
    
    return await this.createNotification(
      'worker_created',
      message,
      worker._id,
      'User'
    );
  } catch (error) {
    console.error('Error creating worker notification:', error.message);
    return null;
  }
};

// Get unread count
exports.getUnreadCount = async () => {
  try {
    return await Notification.countDocuments({ isRead: false });
  } catch (error) {
    console.error('Error getting unread count:', error.message);
    return 0;
  }
};

// Get recent notifications
exports.getRecentNotifications = async (limit = 10) => {
  try {
    return await Notification.find()
      .sort({ createdAt: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting recent notifications:', error.message);
    return [];
  }
};

// Mark all as read
exports.markAllAsRead = async () => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { isRead: true }
    );
    return true;
  } catch (error) {
    console.error('Error marking all as read:', error.message);
    return false;
  }
};

// Delete old notifications (cleanup)
exports.cleanupOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });

    console.log(`Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up notifications:', error.message);
    return 0;
  }
};
