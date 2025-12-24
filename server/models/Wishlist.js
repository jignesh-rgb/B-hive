const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-product pairs
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });
wishlistSchema.index({ productId: 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);