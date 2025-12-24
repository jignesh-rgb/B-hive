const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imageID: {
    type: String,
    required: true,
    unique: true
  },
  productID: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries (imageID is already indexed due to unique constraint)
imageSchema.index({ productID: 1 });

module.exports = mongoose.model('Image', imageSchema);