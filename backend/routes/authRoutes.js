const express = require('express');
const router = express.Router();
const { 
  checkAdminExists, 
  setupAdmin, 
  register, 
  login, 
  getProfile, 
  updateProfile,
  resetPassword 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.get('/check-admin', checkAdminExists);
router.post('/setup-admin', setupAdmin);
router.post('/login', login);
router.post('/register', protect, authorize('admin'), register);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/reset-password/:id', protect, authorize('admin'), resetPassword);

module.exports = router;
