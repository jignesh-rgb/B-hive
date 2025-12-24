const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  // Store product snapshot for historical data
  productSnapshot: {
    title: String,
    price: Number,
    mainImage: String
  }
}, { _id: false });

const customerOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  adress: { // Note: keeping original field name for compatibility
    type: String,
    required: true
  },
  apartment: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    default: 'pending'
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  orderNotice: {
    type: String,
    trim: true
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  products: [orderProductSchema] // Embedded order items
}, {
  timestamps: true
});

// Indexes for faster queries
customerOrderSchema.index({ email: 1 });
customerOrderSchema.index({ status: 1 });
customerOrderSchema.index({ createdAt: -1 });
customerOrderSchema.index({ total: 1 });

module.exports = mongoose.model('CustomerOrder', customerOrderSchema);