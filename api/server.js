const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Import configuration
const config = require('./config/config');
const connectDatabase = require('./config/database');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Import routes
const exampleRoutes = require('./routes/exampleRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bidRoutes = require('./routes/bidRoutes');
const questionRoutes = require('./routes/questionRoutes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(cors());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Online Auction API',
    info: 'This is a template backend structure. Check /api/examples for example endpoints.'
  });
});

// Example routes - use this pattern for your own routes
app.use('/api/examples', exampleRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Category routes
app.use('/api/categories', categoryRoutes);

// Bid routes
app.use('/api/bids', bidRoutes);
// Question routes
app.use('/api/questions', questionRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = config.port || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDatabase();
    
    // Start server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${config.env}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
