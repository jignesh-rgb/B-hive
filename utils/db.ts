import mongoose from 'mongoose';

const mongooseClientSingleton = () => {
    // Validate that MONGODB_URI is present
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is required');
    }

    // Parse MONGODB_URI for logging
    const mongoUri = process.env.MONGODB_URI;

    // Log connection details for debugging
    if (process.env.NODE_ENV === "development") {
        const url = new URL(mongoUri);
        console.log(` Database connection: ${url.protocol}//${url.hostname}:${url.port || '27017'}`);
        console.log(`🔒 SSL Mode: ${mongoUri.includes('ssl=true') ? 'enabled' : 'disabled'}`);
    }

    return mongoose.connect(mongoUri, {
        // Add connection options
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
    });
}

type MongooseConnection = ReturnType<typeof mongooseClientSingleton>;

const globalForMongoose = globalThis as unknown as {
    mongooseConnection: MongooseConnection | undefined;
}

const mongooseConnection = globalForMongoose.mongooseConnection ?? mongooseClientSingleton();

export default mongooseConnection;

if(process.env.NODE_ENV !== "production") globalForMongoose.mongooseConnection = mongooseConnection;