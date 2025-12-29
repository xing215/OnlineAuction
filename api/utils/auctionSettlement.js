const mongoose = require("mongoose");
const Product = require("../models/Product");
const Bid = require("../models/Bid");
const Order = require("../models/Order");
const {
  sendAuctionExpiredEmail,
  sendAuctionEndedToSellerEmail,
  sendAuctionWonEmail,
} = require("./emailService");

const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute
const PLACEHOLDER_ADDRESS = "Pending address (awaiting buyer)";

async function settleSingleProduct(productId) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const product = await Product.findById(productId).session(session);
      if (!product) return;

      // Only handle auctions that already ended and are still open
      const now = new Date();
      if (
        product.end_date > now ||
        !["active", "sold"].includes(product.status)
      )
        return;

      const highestBid = await Bid.findOne({ product: product._id })
        .sort({ price: -1, created_at: 1 })
        .session(session);

      // Populate seller
      await product.populate("seller");

      // No bids: mark expired
      if (!highestBid) {
        if (product.status !== "expired") {
          product.status = "expired";
          await product.save({ session });

          // Send email to seller about expired auction
          if (product.seller && product.seller.email) {
            sendAuctionExpiredEmail({
              sellerEmail: product.seller.email,
              sellerName: product.seller.full_name,
              productName: product.name,
              productId: product._id,
            });
          }
        }
        return;
      }

      // Avoid duplicate orders for the same product
      const existingOrder = await Order.findOne({
        product: product._id,
      }).session(session);

      if (!existingOrder) {
        const order = new Order({
          product: product._id,
          seller: product.seller,
          winner: highestBid.user,
          final_price: highestBid.price,
          status: "pending",
          shipping_address: PLACEHOLDER_ADDRESS,
          messages: [
            {
              sender: product.seller,
              content:
                "System: Đơn hàng đã được tạo tự động sau khi phiên đấu giá kết thúc.",
              sent_at: new Date(),
            },
          ],
        });

        await order.save({ session });

        // Finalize product state
        product.status = "sold";
        product.current_bidder = highestBid.user;
        product.current_price = highestBid.price;
        await product.save({ session });

        // Populate winner
        await highestBid.populate("user");

        // Send email to seller about auction ended
        if (product.seller && product.seller.email) {
          sendAuctionEndedToSellerEmail({
            sellerEmail: product.seller.email,
            sellerName: product.seller.full_name,
            productName: product.name,
            productId: product._id,
            winnerName: highestBid.user.full_name,
            finalPrice: highestBid.price,
          });
        }

        // Send email to winner
        if (highestBid.user && highestBid.user.email) {
          sendAuctionWonEmail({
            winnerEmail: highestBid.user.email,
            winnerName: highestBid.user.full_name,
            productName: product.name,
            productId: product._id,
            finalPrice: highestBid.price,
            sellerName: product.seller.full_name,
          });
        }
      }      
    });
  } catch (error) {
    console.error("Auction settlement error:", error);
  } finally {
    session.endSession();
  }
}

async function runSettlementCycle() {
  try {
    const now = new Date();
    const endedProducts = await Product.find({
      end_date: { $lte: now },
      status: { $in: ["active", "sold"] },
    }).select("_id");

    for (const product of endedProducts) {
      await settleSingleProduct(product._id);
    }
  } catch (error) {
    console.error("Settlement cycle error:", error);
  }
}

function startAuctionSettlementJob() {
  // Run once at startup to catch already-ended auctions
  runSettlementCycle();

  return setInterval(() => {
    runSettlementCycle();
  }, CHECK_INTERVAL_MS);
}

module.exports = {
  startAuctionSettlementJob,
  runSettlementCycle,
};