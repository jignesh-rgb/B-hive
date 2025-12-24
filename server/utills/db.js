const mongoose = require('mongoose');

// Validate that MONGODB_URI is present
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern Mongoose doesn't need these options, but keeping for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log('MongoDB connection successful!');
    if (process.env.NODE_ENV === "development") {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      console.log(`Database: ${conn.connection.name}`);
    }

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Re-throw so the promise rejects
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  if (process.env.NODE_ENV === "development") {
    console.log('Mongoose connected to MongoDB');
  }
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV === "development") {
    console.log('Mongoose disconnected');
  }
});

// Close connection on app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = { connectDB, mongoose };