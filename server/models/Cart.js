const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-product pairs
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });
cartSchema.index({ productId: 1 });

module.exports = mongoose.model('Cart', cartSchema);