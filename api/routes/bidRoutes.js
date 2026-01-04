const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/bids/place - Place a bid (requires authentication)
router.post("/place", authMiddleware, bidController.placeBid);

// GET /api/bids/product/:productId - Get bid history
router.get("/product/:productId", bidController.getBidHistory);

// GET /api/bids/product/:productId/manage - Get bidders for management (product owner only)
router.get("/product/:productId/manage", authMiddleware, bidController.getBiddersForManagement);

// GET /api/bids/product/:productId/current - Get current bid info
router.get("/product/:productId/current", bidController.getCurrentBid);

// GET /api/bids/product/:productId/my-auto-bid - Get user's auto-bid for this product
router.get("/product/:productId/my-auto-bid", authMiddleware, bidController.getMyAutoBid);

// GET /api/bids/my-bidding-products - Get products user has bid on that are still active
router.get("/my-bidding-products", authMiddleware, bidController.getMyBiddingProducts);

// GET /api/bids/my-won-products - Get products user has won
router.get("/my-won-products", authMiddleware, bidController.getMyWonProducts);

module.exports = router;
