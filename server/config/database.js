import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cliphub', {
      // No need for useNewUrlParser and useUnifiedTopology in newer versions
    });

    console.log('✅ Connected to MongoDB:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    
    // Fallback message - don't exit, let app run without MongoDB
    console.log('⚠️  Continuing without MongoDB. File uploads will be disabled.');
  }
};

export default connectDB;