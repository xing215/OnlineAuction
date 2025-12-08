const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/bids/place - Place a bid (requires authentication)
router.post("/place", authMiddleware, bidController.placeBid);

// GET /api/bids/product/:productId - Get bid history
router.get("/product/:productId", bidController.getBidHistory);

// GET /api/bids/product/:productId/current - Get current bid info
router.get("/product/:productId/current", bidController.getCurrentBid);

module.exports = router;
