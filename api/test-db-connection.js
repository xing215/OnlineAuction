// Test MongoDB connection
// Run: npm run test:db

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config/config');

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...\n');
    
    await mongoose.connect(config.database.uri, config.database.options);
    
    console.log('✓ Connected to MongoDB');
    console.log(`✓ Database: ${mongoose.connection.name}\n`);
    
    await mongoose.connection.close();
    console.log('✓ Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    console.error('\nCheck your MONGODB_URI in .env file');
    process.exit(1);
  }
};

testConnection();
