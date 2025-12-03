const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController'); 

// GET /api/categories/roots
router.get('/roots', categoryController.getRoots);
router.get('/', categoryController.getAllCategories);
module.exports = router;