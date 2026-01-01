import mongoose from 'mongoose';

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

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;