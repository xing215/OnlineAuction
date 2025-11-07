const mongoose = require('mongoose');
const config = require('./config');

/**
 * Connect to MongoDB Atlas
 * Make sure to set your MONGODB_URI environment variable with your actual connection string
 * Example: mongodb+srv://username:password@cluster.mongodb.net/online_auction?retryWrites=true&w=majority
 */
const connectDatabase = async () => {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    
    console.log('MongoDB Atlas connected successfully');
    console.log(`Database: ${mongoose.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
