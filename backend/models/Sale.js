const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    min: 1
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  buyingPrice: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerName: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'M-Pesa', 'Card', 'Bank Transfer'],
    default: 'Cash'
  },
  customerName: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['completed', 'refunded'],
    default: 'completed'
  },
  refundReason: {
    type: String,
    trim: true
  },
  refundDate: {
    type: Date
  },
  saleDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sale', saleSchema);
