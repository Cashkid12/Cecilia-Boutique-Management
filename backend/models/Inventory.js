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
    enum: [
      "Men's Trousers",
      "Ladies Trousers",
      "Boys Trouser",
      "Girls Trouser",
      "Shorts",
      "T-Shirts",
      "T-Shirt Boys",
      "T-Shirt Girls",
      "Socks",
      "Vests",
      "Jackets Men",
      "Jackets Ladies",
      "Jackets Kids"
    ]
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
  dateBought: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual for checking low stock (threshold < 5)
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity < 5;
});

module.exports = mongoose.model('Inventory', inventorySchema);
