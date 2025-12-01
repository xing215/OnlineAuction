const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createProduct } = require('../controllers/productController');
const productController = require('../controllers/productController');

// Multer setup - store in api/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { files: 10 }
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

module.exports = router;
