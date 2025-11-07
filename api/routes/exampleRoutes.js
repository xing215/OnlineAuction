/**
 * EXAMPLE ROUTES
 * 
 * This is an example route file to demonstrate the architecture.
 * Use this as a template when creating your own routes.
 * 
 * Routes define the API endpoints and connect them to controllers.
 * They can also apply middleware for authentication, validation, etc.
 */

const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/', exampleController.getAll);
router.get('/:id', exampleController.getById);

// Protected routes (require authentication)
router.post('/', authMiddleware, exampleController.create);
router.put('/:id', authMiddleware, exampleController.update);
router.delete('/:id', authMiddleware, exampleController.delete);

module.exports = router;
