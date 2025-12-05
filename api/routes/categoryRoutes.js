const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController'); 

// GET /api/categories/roots
router.get('/roots', categoryController.getRoots);

// GET /api/categories/tree
router.get('/tree', categoryController.getTree);

router.get('/', categoryController.getAllCategories);
module.exports = router;