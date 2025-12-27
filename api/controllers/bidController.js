const Bid = require("../models/Bid");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const User = require("../models/User");
const {
    sendNewBidToSellerEmail,
    sendNewBidToCurrentBidderEmail,
    sendOutbidEmail,
} = require("../utils/emailService");

/**
 * Auto-bidding helper functions
 */

/**
 * Calculate new price based on proxy bidding rules
 * Formula: New Price = Loser's Max Bid + Bid Step
 * Constraint: New Price cannot exceed Winner's Max Bid
 */
function calculateNewPrice(winnerMaxBid, loserMaxBid, stepPrice) {
    const calculatedPrice = loserMaxBid + stepPrice;
    return Math.min(calculatedPrice, winnerMaxBid);
}

/**
 * Compare two bidders and determine winner
 * Returns: { winner, loser, newPrice }
 */
function compareAutoBids(bidderA, bidderB, stepPrice) {
    const maxBidA = bidderA.maxBid;
    const maxBidB = bidderB.maxBid;

    // Case 1: A has higher max bid - A wins
    if (maxBidA > maxBidB) {
        return {
            winner: bidderA,
            loser: bidderB,
            newPrice: calculateNewPrice(maxBidA, maxBidB, stepPrice),
        };
    }

    // Case 2: B has higher max bid - B wins
    if (maxBidB > maxBidA) {
        return {
            winner: bidderB,
            loser: bidderA,
            newPrice: calculateNewPrice(maxBidB, maxBidA, stepPrice),
        };
    }

    // Case 3: Tie (Equal max bids) - First-come, first-served
    // The bidder who placed their bid first wins
    if (bidderA.timestamp < bidderB.timestamp) {
        return {
            winner: bidderA,
            loser: bidderB,
            newPrice: maxBidA, // Price stays at the tied amount
        };
    } else {
        return {
            winner: bidderB,
            loser: bidderA,
            newPrice: maxBidB,
        };
    }
}

/**
 * Handle auto-bid placement logic
 * This function orchestrates the entire auto-bidding process
 */
async function processAutoBid(productId, newBidder, product, session) {
    const stepPrice = product.step_price;

    // Get current highest bid
    const currentHighestBid = await Bid.findOne({ product: productId })
        .sort({ price: -1 })
        .session(session);

    // Get current leader's auto-bid info (if exists)
    let currentLeaderAutoBid = null;
    if (currentHighestBid) {
        currentLeaderAutoBid = await Bid.findOne({
            product: productId,
            user: currentHighestBid.user,
            is_auto_bid: true,
        })
            .sort({ created_at: -1 })
            .session(session);
    }

    // Scenario 1: First bidder or no auto-bid competition
    if (
        !currentHighestBid ||
        !currentLeaderAutoBid ||
        !currentLeaderAutoBid.maximum_bid_limit
    ) {
        const initialPrice = product.start_price + stepPrice;
        const newPrice = Math.min(initialPrice, newBidder.maxBid);

        const newBid = new Bid({
            product: productId,
            user: newBidder.userId,
            price: newPrice,
            is_auto_bid: true,
            maximum_bid_limit: newBidder.maxBid,
            created_at: new Date(),
        });

        await newBid.save({ session });
        return {
            newPrice: newPrice,
            winnerUserId: newBidder.userId,
            isNewLeader: true,
        };
    }

    // Scenario 2: Self-update - Current leader increasing their max bid
    if (currentHighestBid.user.toString() === newBidder.userId.toString()) {
        // Update the maximum_bid_limit without changing current price
        currentLeaderAutoBid.maximum_bid_limit = newBidder.maxBid;
        await currentLeaderAutoBid.save({ session });

        return {
            newPrice: currentHighestBid.price, // Price stays the same
            winnerUserId: newBidder.userId,
            isNewLeader: false,
            isSelfUpdate: true,
        };
    }

    // Scenario 3: Competition between current leader and new challenger
    const currentLeader = {
        userId: currentHighestBid.user,
        maxBid: currentLeaderAutoBid.maximum_bid_limit,
        timestamp: currentLeaderAutoBid.created_at,
    };

    const challenger = {
        userId: newBidder.userId,
        maxBid: newBidder.maxBid,
        timestamp: new Date(),
    };

    // Compare and determine winner
    const result = compareAutoBids(currentLeader, challenger, stepPrice);

    // Create new bid record for the winner
    const newBid = new Bid({
        product: productId,
        user: result.winner.userId,
        price: result.newPrice,
        is_auto_bid: true,
        maximum_bid_limit: result.winner.maxBid,
        created_at: new Date(),
    });

    await newBid.save({ session });

    return {
        newPrice: result.newPrice,
        winnerUserId: result.winner.userId,
        isNewLeader:
            result.winner.userId.toString() === newBidder.userId.toString(),
        loserMaxBid: result.loser.maxBid,
    };
}

/**
 * Place a bid on a product (supports both manual and auto-bidding)
 */
exports.placeBid = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { productId, bidAmount, isAutoBid, maxBid } = req.body;
        const userId = req.user._id; // From JWT middleware

        // Validate input
        if (!productId || bidAmount === undefined) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Product ID and bid amount are required",
            });
        }

        // Validate auto-bid input
        if (isAutoBid && (!maxBid || maxBid < bidAmount)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message:
                    "Maximum bid must be greater than or equal to current bid amount",
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

        let result;
        let responseMessage = "Bid placed successfully";

        // Handle Auto-bid
        if (isAutoBid) {
            const maxBidNum = parseFloat(maxBid);

            // Validate max bid
            if (isNaN(maxBidNum) || maxBidNum < minimumBid) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Maximum bid must be at least ${minimumBid.toLocaleString(
                        "vi-VN"
                    )}đ`,
                });
            }

            result = await processAutoBid(
                productId,
                { userId, maxBid: maxBidNum },
                product,
                session
            );

            // Update response message based on result
            if (result.isSelfUpdate) {
                responseMessage =
                    "Your maximum bid has been updated successfully";
            } else if (result.isNewLeader) {
                responseMessage = "You are now the highest bidder!";
            } else {
                responseMessage =
                    "Your bid has been placed, but you were outbid";
            }
        }
        // Handle Manual bid
        else {
            const newBid = new Bid({
                product: productId,
                user: userId,
                price: bidAmountNum,
                is_auto_bid: false,
                created_at: new Date(),
            });

            await newBid.save({ session });

            result = {
                newPrice: bidAmountNum,
                winnerUserId: userId,
                isNewLeader: true,
            };
        }

        // Update product bid count, current price, and current bidder
        product.bid_count = (product.bid_count || 0) + 1;
        product.current_price = result.newPrice;
        product.current_bidder = result.winnerUserId;

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
            .populate("user", "full_name email");

        // Send emails to all parties after successful bid
        setImmediate(async () => {
            try {
                // Get seller info
                const seller = await User.findById(product.seller);

                // Get current bidder info
                const currentBidder = await User.findById(userId);

                // Send email to seller
                if (seller && seller.email) {
                    sendNewBidToSellerEmail({
                        sellerEmail: seller.email,
                        sellerName: seller.full_name,
                        productName: product.name,
                        productId: product._id,
                        bidderName: currentBidder.full_name,
                        bidAmount: result.newPrice,
                        bidCount: product.bid_count,
                    });
                }

                // Send confirmation email to current bidder
                if (currentBidder && currentBidder.email) {
                    sendNewBidToCurrentBidderEmail({
                        bidderEmail: currentBidder.email,
                        bidderName: currentBidder.full_name,
                        productName: product.name,
                        productId: product._id,
                        bidAmount: result.newPrice,
                        isLeading: result.isNewLeader,
                    });
                }

                // Send outbid notification to previous highest bidder (if exists and different from current)
                if (highestBid && highestBid.user.toString() !== userId.toString()) {
                    const previousBidder = await User.findById(highestBid.user);
                    if (previousBidder && previousBidder.email) {
                        sendOutbidEmail({
                            bidderEmail: previousBidder.email,
                            bidderName: previousBidder.full_name,
                            productName: product.name,
                            productId: product._id,
                            previousBidAmount: highestBid.price,
                            newBidAmount: result.newPrice,
                        });
                    }
                }
            } catch (emailError) {
                console.error("Error sending bid notification emails:", emailError);
            }
        });

        return res.status(201).json({
            success: true,
            message: responseMessage,
            data: {
                currentPrice: result.newPrice,
                bidCount: product.bid_count,
                highestBidder: updatedHighestBid.user.full_name,
                isLeading: result.isNewLeader,
                isAutoBid: isAutoBid || false,
                endDate: product.end_date,
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

/**
 * Get user's current auto-bid for a product
 */
exports.getMyAutoBid = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // Get user's active auto-bid for this product
        const userAutoBid = await Bid.findOne({
            product: productId,
            user: userId,
            is_auto_bid: true,
            maximum_bid_limit: { $ne: null },
        }).sort({ created_at: -1 });

        if (!userAutoBid) {
            return res.status(200).json({
                success: true,
                data: null,
                message: "No active auto-bid found",
            });
        }

        // Check if user is currently the highest bidder
        const highestBid = await Bid.findOne({ product: productId }).sort({
            price: -1,
        });

        const isLeading =
            highestBid && highestBid.user.toString() === userId.toString();

        return res.status(200).json({
            success: true,
            data: {
                maxBid: userAutoBid.maximum_bid_limit,
                currentBidPrice: userAutoBid.price,
                isLeading: isLeading,
                createdAt: userAutoBid.created_at,
            },
        });
    } catch (error) {
        console.error("Get my auto-bid error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching your auto-bid",
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
