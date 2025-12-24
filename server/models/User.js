const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false // Allow null for OAuth users
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  }
}, {
  timestamps: true
});

// Indexes for faster queries (email is already indexed due to unique constraint)
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);