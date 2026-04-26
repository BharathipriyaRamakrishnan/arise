const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect with URI:', process.env.MONGO_URI?.substring(0, 50) + '...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Add timeout for debugging
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error:`, error.message);
    process.exit(1);
  }
};

module.exports = connectDB;