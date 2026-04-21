const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getAllNotificationsGrouped,
  clearAllNotifications,
  toggleReadStatus
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getNotifications);
router.get('/all', getAllNotificationsGrouped);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/:id/toggle-read', toggleReadStatus);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/clear-all', clearAllNotifications);
router.post('/create', createNotification); // Admin only

module.exports = router;
