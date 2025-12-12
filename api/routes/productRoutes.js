const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createProduct } = require('../controllers/productController');
const productController = require('../controllers/productController');
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');

// Multer setup - use memory storage for Cloudinary upload
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { 
    files: 10,
    fileSize: 10 * 1024 * 1024 // 10MB per file
  },
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// POST /api/products - accept multipart/form-data with up to 10 images
router.post('/', upload.array('images', 10), createProduct);

// GET /api/products/top-expiring - get products expiring soon
router.get('/top-expiring', productController.getTopExpiring);

// GET /api/products/top-bidding - get products with most bids
router.get('/top-bidding', productController.getTopBidding);

// GET /api/products/top-price - get products with highest current price
router.get('/top-price', productController.getTopPrice);

// GET /api/products - must be last to avoid route conflicts
router.get('/', productController.getProducts);

// GET /api/products/:id - get product by ID
router.get('/:id', productController.getProductById);

// GET /api/products/seller/rating/:id - get ratingSummary by user ID
router.get('/seller/rating/:id', productController.getSellerRatingSummary);

// GET /api/products/seller/:sellerId - get seller name by seller ID
router.get('/seller/:sellerId', productController.getSellerById);

// GET /api/products/category/:categoryId - get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

// POST /api/products/:productId/questions 
router.post('/:productId/questions', authMiddleware, questionController.createQuestion);

// GET /api/products/:productId/questions 
router.get('/:productId/questions', questionController.getQuestions);

// POST /api/products/ban-bidder - ban a bidder from a product
router.post('/ban-bidder', productController.banBidder);

// POST /api/products/unban-bidder - unban a bidder from a product
router.post('/unban-bidder', productController.unbanBidder);

// POST /api/products/banned/:productId - get banned bidders for a product
router.get('/banned/:productId', productController.getBannedList);

// DELETE /api/products/:id
router.delete('/:id', productController.deleteProduct);

module.exports = router;
