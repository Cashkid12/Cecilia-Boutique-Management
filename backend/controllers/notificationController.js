const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly = 'false', limit = 20, page = 1, type } = req.query;
    
    const query = { userId: req.user._id };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    if (type) {
      query.type = type;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    
    res.json({
      notifications,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ message: 'Notification marked as read', notification });
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
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notification.deleteOne();
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create notification (internal use)
// @route   POST /api/notifications/create
// @access  Private/Admin
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data } = req.body;
    
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
      
      await Notification.insertMany(notifications);
      
      return res.json({ 
        message: `Notification sent to ${admins.length} admin(s)`,
        count: notifications.length
      });
    }
    
    // Create single notification
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data: data || {}
    });
    
    await notification.save();
    
    res.status(201).json({ message: 'Notification created', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create notification helper (for internal use in other controllers)
exports.createNotificationHelper = async ({ userId, type, title, message, data }) => {
  try {
    // If no userId, send to all admins
    if (!userId) {
      const admins = await User.find({ role: 'admin' });
      
      const notifications = admins.map(admin => ({
        userId: admin._id,
        type,
        title,
        message,
        data: data || {}
      }));
      
      await Notification.insertMany(notifications);
      return notifications;
    }
    
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data: data || {}
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

// @desc    Get all notifications grouped by date
// @route   GET /api/notifications/all
// @access  Private
exports.getAllNotificationsGrouped = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, search } = req.query;
    
    const query = { userId: req.user._id };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) * parseInt(page))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    
    // Group notifications by date
    const grouped = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfDay);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    
    notifications.forEach(notification => {
      const notifDate = new Date(notification.createdAt);
      
      if (notifDate >= startOfDay) {
        grouped.today.push(notification);
      } else if (notifDate >= startOfYesterday) {
        grouped.yesterday.push(notification);
      } else if (notifDate >= startOfWeek) {
        grouped.thisWeek.push(notification);
      } else {
        grouped.older.push(notification);
      }
    });
    
    res.json({
      grouped,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('[Get All Notifications Error]:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all notifications for user
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user._id
    });
    
    res.json({ 
      message: 'All notifications cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('[Clear All Notifications Error]:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle notification read status
// @route   PUT /api/notifications/:id/toggle-read
// @access  Private
exports.toggleReadStatus = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.read = !notification.read;
    await notification.save();
    
    res.json({ 
      message: `Notification marked as ${notification.read ? 'read' : 'unread'}`,
      notification 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
