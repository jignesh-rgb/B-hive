const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  mainImage: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  description: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true
  },
  inStock: {
    type: Number,
    default: 1,
    min: 0
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries (slug is already indexed due to unique constraint)
productSchema.index({ categoryId: 1 });
productSchema.index({ merchantId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: 1 });
productSchema.index({ inStock: 1 });
productSchema.index({ title: 'text', description: 'text' }); // Text search

module.exports = mongoose.model('Product', productSchema);