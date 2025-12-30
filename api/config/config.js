// Load environment variables from .env file
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  database: {
    // MongoDB Atlas connection string
    // Format: mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
    uri: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/online_auction?retryWrites=true&w=majority',
    options: {
      // useNewUrlParser: true,  // These are now default in mongoose 6+
      // useUnifiedTopology: true,
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'online-auction'
  }
};
