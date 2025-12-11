const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController'); 

// GET /api/categories/roots
router.get('/roots', categoryController.getRoots);

// GET /api/categories/tree
router.get('/tree', categoryController.getTree);

// GET /api/categories
router.get('/', categoryController.getAllCategories);

// POST /api/categories
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id
router.delete('/:id', categoryController.deleteCategory);


module.exports = router;