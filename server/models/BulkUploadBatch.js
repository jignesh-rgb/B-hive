const mongoose = require('mongoose');

const bulkUploadItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  // Snapshot fields for auditing and re-commit edits
  title: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0
  },
  manufacturer: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  mainImage: {
    type: String
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  inStock: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['CREATED', 'UPDATED', 'ERROR'],
    default: 'CREATED'
  },
  error: {
    type: String
  }
}, { _id: true, timestamps: true });

const bulkUploadBatchSchema = new mongoose.Schema({
  fileName: {
    type: String
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'PARTIAL', 'FAILED'],
    default: 'PENDING'
  },
  itemCount: {
    type: Number,
    default: 0,
    min: 0
  },
  errorCount: {
    type: Number,
    default: 0,
    min: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [bulkUploadItemSchema] // Embedded items
}, {
  timestamps: true
});

// Indexes for faster queries
bulkUploadBatchSchema.index({ userId: 1 });
bulkUploadBatchSchema.index({ status: 1 });
bulkUploadBatchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BulkUploadBatch', bulkUploadBatchSchema);