const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add expense title'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add expense category'],
    enum: ['Rent', 'Salary', 'Electricity', 'Transport', 'Packaging', 'Supplies', 'Maintenance', 'Other']
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add amount']
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'M-Pesa', 'Card', 'Bank Transfer'],
    default: 'Cash'
  },
  expenseDate: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
