import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        // Validate that MONGODB_URI is present
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is required');
        }

        // Parse MONGODB_URI to check configuration
        const mongoUri = process.env.MONGODB_URI;

        // Log connection details for debugging
        if (process.env.NODE_ENV === "development") {
            const url = new URL(mongoUri);
            console.log(`📦 MongoDB connection: ${url.protocol}//${url.hostname}:${url.port || '27017'}`);
            console.log(`📊 Database: ${url.pathname.slice(1) || 'default'}`);
        }

        // Connect to MongoDB
        await mongoose.connect(mongoUri, {
            // Add connection options for better error handling
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            bufferCommands: false, // Disable mongoose buffering
        });

        console.log("✅ MongoDB connected successfully");

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('📡 MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

export { connectDB };
export default mongoose;