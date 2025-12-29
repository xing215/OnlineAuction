const express = require('express');
const router = express.Router();
const {
    getAuctionSettings,
    updateAuctionSettings,
} = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/settings/auction
router.get('/auction', getAuctionSettings);

// PUT /api/settings/auction
router.put('/auction', authMiddleware, authMiddleware.adminMiddleware, updateAuctionSettings);

module.exports = router;
