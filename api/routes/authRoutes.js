const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public: Login
router.post('/login', authController.login);

// Protected: get current user profile
router.get('/me', authMiddleware, (req, res) => {
	return res.json({ success: true, user: req.user });
});

module.exports = router;
