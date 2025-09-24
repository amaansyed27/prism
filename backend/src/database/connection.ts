import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/prism';

export async function connectDatabase(): Promise<void> {
    try {
        console.log('🔗 Connecting to MongoDB...');
        console.log('🔍 MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in logs
        
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully');
        console.log('📍 Database:', mongoose.connection.db?.databaseName);
        
        // Listen for connection events
        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('🔌 MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🛑 MongoDB connection closed due to app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

export async function disconnectDatabase(): Promise<void> {
    try {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error);
    }
}

// Legacy export for compatibility
const connectDB = connectDatabase;
export default connectDB;
