const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createProduct } = require('../controllers/productController');
const productController = require('../controllers/productController');

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

// GET /api/products - must be last to avoid route conflicts
router.get('/', productController.getProducts);

// GET /api/products/:id - get product by ID
router.get('/:id', productController.getProductById);

// GET /api/products/seller/:id - get ratingSummary by user ID
router.get('/seller/:id', productController.getSellerRatingSummary);


module.exports = router;
