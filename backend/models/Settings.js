const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  emailEnabled: {
    type: Boolean,
    default: true
  },
  lowStockEmailEnabled: {
    type: Boolean,
    default: true
  },
  weeklyReportEnabled: {
    type: Boolean,
    default: true
  },
  monthlyReportEnabled: {
    type: Boolean,
    default: true
  },
  adminEmail: {
    type: String,
    required: true,
    default: 'admin@ceciliaboutique.com'
  },
  emailPassword: {
    type: String,
    default: ''
  },
  lowStockThreshold: {
    type: Number,
    default: 3
  },
  lastLowStockEmailSent: {
    type: Date,
    default: null
  },
  lastWeeklyReportSent: {
    type: Date,
    default: null
  },
  lastMonthlyReportSent: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
