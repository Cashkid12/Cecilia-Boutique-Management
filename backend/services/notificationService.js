const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const { sendNotificationToUser } = require('../server');

/**
 * Centralized Notification Service
 * Handles all notification operations across the system
 */

// Create notification for all admins or specific user
exports.createNotification = async ({ userId, type, title, message, data }) => {
  try {
    // If no userId provided, send to all admins
    if (!userId) {
      const admins = await User.find({ role: 'admin' });
      
      const notifications = admins.map(admin => ({
        userId: admin._id,
        type,
        title,
        message,
        data: data || {}
      }));
      
      const createdNotifications = await Notification.insertMany(notifications);
      
      // Send real-time notifications to all connected admins
      admins.forEach(admin => {
        const notification = {
          _id: createdNotifications.find(n => n.userId.toString() === admin._id.toString())?._id,
          userId: admin._id,
          type,
          title,
          message,
          data: data || {},
          read: false,
          createdAt: new Date()
        };
        sendNotificationToUser(admin._id.toString(), notification);
      });
      
      return notifications;
    }
    
    // Create single notification
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data: data || {}
    });

    // Send real-time notification via WebSocket
    sendNotificationToUser(userId.toString(), {
      _id: notification._id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      read: false,
      createdAt: notification.createdAt
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

// Create sale notification with email
exports.createSaleNotification = async (sale) => {
  try {
    const title = 'New Sale Recorded!';
    const message = `Sale of KSh ${sale.totalAmount} recorded by ${sale.workerName}`;
    const data = {
      saleId: sale._id,
      amount: sale.totalAmount,
      workerName: sale.workerName,
      items: sale.itemName
    };
    
    // Create in-app notification
    const notification = await this.createNotification({
      type: 'sale',
      title,
      message,
      data
    });
    
    // Send email notification (rate limited)
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      await emailService.sendSaleEmail(admins[0]._id, {
        amount: sale.totalAmount,
        workerName: sale.workerName,
        itemCount: sale.quantity
      });
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating sale notification:', error.message);
    return null;
  }
};

// Create low stock notification with email
exports.createLowStockNotification = async (item) => {
  try {
    const title = 'Low Stock Alert!';
    const message = `${item.category} - KSh ${item.buyingPrice} has only ${item.quantity} left`;
    const data = {
      itemId: item._id,
      category: item.category,
      buyingPrice: item.buyingPrice,
      quantity: item.quantity
    };
    
    // Create in-app notification
    const notification = await this.createNotification({
      type: 'low_stock',
      title,
      message,
      data
    });
    
    // Send email notification (rate limited)
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      await emailService.sendLowStockEmail([item]);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating low stock notification:', error.message);
    return null;
  }
};

// Create expense notification with email
exports.createExpenseNotification = async (expense) => {
  try {
    const title = 'New Expense Added';
    const message = `${expense.category} expense of KSh ${expense.amount} added`;
    const data = {
      expenseId: expense._id,
      category: expense.category,
      amount: expense.amount
    };
    
    // Create in-app notification
    const notification = await this.createNotification({
      type: 'expense',
      title,
      message,
      data
    });
    
    // Send email notification
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      await emailService.sendExpenseEmail(admins[0]._id, {
        category: expense.category,
        amount: expense.amount,
        description: expense.description
      });
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating expense notification:', error.message);
    return null;
  }
};

// Create report notification
exports.createReportNotification = async ({ userId, type, title, message, data }) => {
  try {
    const notification = await this.createNotification({
      userId,
      type: 'report',
      title,
      message,
      data
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating report notification:', error.message);
    return null;
  }
};

// Get unread count for user
exports.getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({ userId, read: false });
  } catch (error) {
    console.error('Error getting unread count:', error.message);
    return 0;
  }
};

// Get recent notifications for user
exports.getRecentNotifications = async (userId, limit = 10) => {
  try {
    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting recent notifications:', error.message);
    return [];
  }
};

// Mark all as read for user
exports.markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
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
      read: true
    });

    console.log(`Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up notifications:', error.message);
    return 0;
  }
};
