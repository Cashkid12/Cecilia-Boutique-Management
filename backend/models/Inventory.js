const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Please add item name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add category'],
    enum: ['Dress', 'Shirt', 'Trousers', 'Skirt', 'Jacket', 'Blouse', 'Jeans', 'T-shirt', 'Sweater', 'Other']
  },
  buyingPrice: {
    type: Number,
    required: [true, 'Please add buying price']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Please add selling price']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    default: 0
  },
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
    default: 'M'
  },
  color: {
    type: String,
    trim: true
  },
  supplier: {
    type: String,
    trim: true
  },
  dateBought: {
    type: Date,
    default: Date.now
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual for checking low stock
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});

module.exports = mongoose.model('Inventory', inventorySchema);
