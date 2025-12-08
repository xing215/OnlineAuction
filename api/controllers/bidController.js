const Bid = require("../models/Bid");
const Product = require("../models/Product");
const mongoose = require("mongoose");

/**
 * Place a manual bid on a product
 * TODO: Auto-bid mechanism will be implemented later
 */
exports.placeBid = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { productId, bidAmount, isAutoBid } = req.body;
        const userId = req.user._id; // From JWT middleware

        // Validate input
        if (!productId || bidAmount === undefined) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Product ID and bid amount are required",
            });
        }

        // Check product exists
        const product = await Product.findById(productId).session(session);
        if (!product) {
            await session.abortTransaction();
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        // Check product is active
        if (product.status !== "active") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "This product is no longer active",
            });
        }

        // Check product hasn't ended
        if (product.end_date < new Date()) {
            await session.abortTransaction();
            return res
                .status(400)
                .json({ success: false, message: "This auction has ended" });
        }

        // Seller cannot bid on their own product
        if (product.seller.toString() === userId.toString()) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: "Sellers cannot bid on their own products",
            });
        }

        // Check if user is banned
        if (product.banned_bidders && product.banned_bidders.includes(userId)) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: "You are banned from bidding on this product",
            });
        }

        // Get current highest bid
        const highestBid = await Bid.findOne({ product: productId })
            .sort({ price: -1 })
            .session(session);

        const currentPrice = highestBid
            ? highestBid.price
            : product.start_price;
        const minimumBid = currentPrice + product.step_price;

        // Validate bid amount
        const bidAmountNum = parseFloat(bidAmount);
        if (isNaN(bidAmountNum) || bidAmountNum < minimumBid) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Minimum bid is ${minimumBid.toLocaleString(
                    "vi-VN"
                )}đ`,
            });
        }

        // TODO: Auto-bid logic will be implemented here
        // For now, only handle manual bids

        // Create new bid
        const newBid = new Bid({
            product: productId,
            user: userId,
            price: bidAmountNum,
            is_auto_bid: false, // Currently only manual
            created_at: new Date(),
        });

        await newBid.save({ session });

        // Update product bid count and current price
        product.bid_count = (product.bid_count || 0) + 1;
        product.current_price = bidAmountNum; // Store current price in product

        // Auto-extend if within 5 minutes of end
        const timeRemaining = product.end_date - new Date();
        if (timeRemaining > 0 && timeRemaining < 5 * 60 * 1000) {
            product.end_date = new Date(
                product.end_date.getTime() + 10 * 60 * 1000
            );
        }

        await product.save({ session });
        await session.commitTransaction();

        // Get updated highest bidder info
        const updatedHighestBid = await Bid.findOne({ product: productId })
            .sort({ price: -1 })
            .populate("user", "full_name");

        return res.status(201).json({
            success: true,
            message: "Bid placed successfully",
            data: {
                currentPrice: updatedHighestBid.price,
                bidCount: product.bid_count,
                highestBidder: updatedHighestBid.user.full_name,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Place bid error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while placing bid",
            error: error.message,
        });
    } finally {
        session.endSession();
    }
};

/**
 * Get bid history for a product
 */
exports.getBidHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bids = await Bid.find({ product: productId })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("user", "full_name email")
            .lean();

        const total = await Bid.countDocuments({ product: productId });

        // Mask user names for privacy
        const maskedBids = bids.map((bid) => ({
            ...bid,
            user: {
                ...bid.user,
                full_name: maskUserName(bid.user.full_name),
            },
        }));

        return res.status(200).json({
            success: true,
            data: maskedBids,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Get bid history error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching bid history",
            error: error.message,
        });
    }
};

/**
 * Get current bid info for a product
 */
exports.getCurrentBid = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        // Use current_price from product, or start_price as fallback
        const currentPrice = product.current_price || product.start_price;
        const minimumBid = currentPrice + product.step_price;

        // Get highest bidder info
        const highestBid = await Bid.findOne({ product: productId })
            .sort({ price: -1 })
            .populate("user", "full_name");

        return res.status(200).json({
            success: true,
            data: {
                currentPrice,
                minimumBid,
                stepPrice: product.step_price,
                bidCount: product.bid_count,
                highestBidder: highestBid
                    ? {
                          name: maskUserName(highestBid.user.full_name),
                          isAutoBid: highestBid.is_auto_bid,
                      }
                    : null,
            },
        });
    } catch (error) {
        console.error("Get current bid error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching current bid",
            error: error.message,
        });
    }
};

// Helper function to mask user name
function maskUserName(fullName) {
    if (!fullName) return "****User";
    const name = fullName.trim();
    const parts = name.split(" ");
    const lastName = parts[parts.length - 1];
    return `****${lastName}`;
}

module.exports = exports;
