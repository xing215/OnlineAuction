const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController'); 
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/categories/roots
router.get('/roots', categoryController.getRoots);

// GET /api/categories/tree
router.get('/tree', categoryController.getTree);

// GET /api/categories
router.get('/', categoryController.getAllCategories);

// POST /api/categories
router.post('/', authMiddleware, authMiddleware.adminMiddleware, categoryController.createCategory);

// PUT /api/categories/:id
router.put('/:id', authMiddleware, authMiddleware.adminMiddleware, categoryController.updateCategory);

// DELETE /api/categories/:id
router.delete('/:id', authMiddleware, authMiddleware.adminMiddleware, categoryController.deleteCategory);


module.exports = router;