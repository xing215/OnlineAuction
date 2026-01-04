const mongoose = require("mongoose");
const Product = require("../models/Product");
const Bid = require("../models/Bid");
const { uploadMultipleToCloudinary } = require("../utils/cloudinary");
const Category = require("../models/Category");
const { sendBannedBidderEmail } = require("../utils/emailService");
const { sendUnbannedBidderEmail } = require("../utils/emailService");
const { sendDescriptionUpdateEmail } = require("../utils/emailService");
const User = require("../models/User");

// Helper function to mask user name - format: n*d*h*a
function maskUserName(fullName) {
    if (!fullName) return "****";
    const name = fullName.trim();
    if (name.length === 0) return "****";
    
    // All Vietnamese vowels (with and without diacritics, both lowercase and uppercase)
    const vowelChars = /[aàáảãạâấầẩẫậăắằẳẵặeèéẻẽẹêếềểễệiìíỉĩịoòóỏõọôốồổỗộơớờởỡợuùúủũụưứừửữựyỳýỷỹỵAÀÁẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶEÈÉẺẼẸÊẾỀỂỄỆIÌÍỈĨỊOÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢUÙÚỦŨỤƯỨỪỬỮỰYỲÝỶỸỴ]/;
    
    // Replace all vowels with asterisks
    return name.split("").map(char => {
        return vowelChars.test(char) ? "*" : char;
    }).join("");
}

// Create product handler supporting multipart uploads (req.files)
exports.createProduct = async (req, res) => {
    try {
        // Upload images to Cloudinary if files are present
        let images = [];
        if (req.files && req.files.length) {
            try {
                // Upload all images to Cloudinary and get URLs
                images = await uploadMultipleToCloudinary(req.files);
                console.log(
                    "Successfully uploaded images to Cloudinary:",
                    images
                );
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload images to Cloudinary",
                    error: uploadError.message,
                });
            }
        }

        // Other fields come from req.body
        const {
            name,
            category,
            seller,
            description,
            start_price,
            step_price,
            buy_now_price,
            end_date,
            status,
            banned_bidders,
        } = req.body;

        // Required fields per model
        if (
            !name ||
            !category ||
            !seller ||
            start_price == null ||
            step_price == null ||
            !end_date
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: name, category, seller, start_price, step_price, end_date",
            });
        }

        // If client also sent images in body (JSON), append them
        if (req.body.images && Array.isArray(req.body.images)) {
            images = images.concat(req.body.images);
        }

        if (images.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Product must have at least 3 images",
            });
        }

        const allowedStatus = ["active", "sold", "expired"];
        const finalStatus =
            status && allowedStatus.includes(status) ? status : "active";

        const categoryObj = await Category.findById(category).select("name");
        if (!categoryObj) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid category ID" });
        }

        const category_name = categoryObj.name;

        const productData = {
            name: String(name).trim(),
            category,
            category_name,
            seller,
            images,
            description: description || undefined,
            start_price: Number(start_price),
            step_price: Number(step_price),
            buy_now_price:
                buy_now_price != null && buy_now_price !== ""
                    ? Number(buy_now_price)
                    : null,
            end_date: new Date(end_date),
            status: finalStatus,
            banned_bidders: Array.isArray(banned_bidders) ? banned_bidders : [],
        };

        const product = await Product.create(productData);
        return res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error("createProduct error:", error);
        if (error.name === "ValidationError") {
            return res
                .status(400)
                .json({ success: false, message: error.message });
        }
        return res
            .status(500)
            .json({ success: false, message: "Server error" });
    }
};

async function getAllSubcategories(categoryId) {
    const ids = [categoryId];
    const queue = [categoryId];
    while (queue.length > 0) {
        const current = queue.shift();

        const children = await Category.getChildren(current);

        for (let child of children) {
            ids.push(child._id);
            queue.push(child._id);
        }
    }

    return ids;
}

exports.getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 8,
            search,
            category,
            sort,
            status,
        } = req.query;

        // FILTER CƠ BẢN
        const filter = {
            status: { $ne: "deleted" },
        };
        if (status && status !== "all") {
            filter.status = status;
        } else if (!status) {
            filter.status = "active";
        }
        // 1. FULL-TEXT SEARCH
        if (search && search.trim() !== "") {
            filter.$text = { $search: `"${search}"` };
        }

        // 2. CATEGORY FILTER + SUBCATEGORIES
        if (category && category !== "all" && category !== "undefined") {
            const categoryIds = await getAllSubcategories(category);
            filter.category = { $in: categoryIds };
        }

        // 3. SORT
        let sortOption = {};

        if (search) {
            // Nếu có text search -> ưu tiên relevance score
            sortOption = { score: { $meta: "textScore" } };
        } else {
            switch (sort) {
                case "price_asc":
                    sortOption = { current_price: 1 };
                    break;
                case "price_desc":
                    sortOption = { current_price: -1 };
                    break;
                case "end_date_asc":
                    sortOption = { end_date: 1 };
                    break;
                case "end_date_desc":
                    sortOption = { end_date: -1 };
                    break;
                case "bids_desc":
                    sortOption = { bid_count: -1 };
                    break;
                case "newest":
                default:
                    sortOption = { posted_at: -1 };
            }
        }

        // 4. PAGINATION
        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);
        const skip = (pageNum - 1) * limitNum;

        // 5. QUERY DB (với textScore nếu có search)
        const projection = search ? { score: { $meta: "textScore" } } : {};

        const [products, totalDocs] = await Promise.all([
            Product.find(filter, projection)
                .populate("category", "name")
                .populate("seller", "full_name")
                .populate("current_bidder", "_id full_name")
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum),
            Product.countDocuments(filter),
        ]);

        // Mask current_bidder names
        products.forEach(product => {
            if (product.current_bidder && product.current_bidder.full_name) {
                product.current_bidder.full_name = maskUserName(product.current_bidder.full_name);
            }
        });

        // 6. RESPONSE
        res.json({
            success: true,
            data: products,
            total_items: totalDocs,
            total_pages: Math.ceil(totalDocs / limitNum),
            current_page: pageNum,
        });
    } catch (error) {
        console.error("Lỗi Controller:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get top expiring products (sắp kết thúc)
exports.getTopExpiring = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const products = await Product.findTopExpiring(parseInt(limit));

        // Mask current_bidder names
        products.forEach(product => {
            if (product.current_bidder && product.current_bidder.full_name) {
                product.current_bidder.full_name = maskUserName(product.current_bidder.full_name);
            }
        });

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("Error in getTopExpiring:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get top bidding products (nhiều lượt ra giá nhất)
exports.getTopBidding = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const products = await Product.findTopBidding(parseInt(limit));

        // Mask current_bidder names
        products.forEach(product => {
            if (product.current_bidder && product.current_bidder.full_name) {
                product.current_bidder.full_name = maskUserName(product.current_bidder.full_name);
            }
        });

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("Error in getTopBidding:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get top price products (giá cao nhất)
exports.getTopPrice = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const products = await Product.findTopPrice(parseInt(limit));

        // Ensure current_price is set (fallback to start_price if not set)
        const productData = products.toObject ? products.toObject() : products;
        if (!productData.current_price || productData.current_price === 0) {
            productData.current_price = productData.start_price;
        }

        // Mask current_bidder name
        if (productData.current_bidder && productData.current_bidder.full_name) {
            productData.current_bidder.full_name = maskUserName(productData.current_bidder.full_name);
        }

        res.json({ success: true, data: productData });
    } catch (error) {
        console.error("Error in getTopPrice:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get product by ID with populated fields
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.getProductById(id);
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        // Mask current_bidder name
        if (product.current_bidder && product.current_bidder.full_name) {
            product.current_bidder.full_name = maskUserName(product.current_bidder.full_name);
        }

        res.json({ success: true, data: product });
    } catch (error) {
        console.error("Error in getProductById:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get seller rating summary by user ID
exports.getSellerRatingSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const ratingSummary = await Product.getSellerRatingSummary(id);
        res.json({ success: true, data: ratingSummary });
    } catch (error) {
        console.error("Error in getSellerRatingSummary:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get products by category ID
exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await Product.find({
            category: categoryId,
            status: "active",
        })
            .populate("category", "name")
            .populate("current_bidder", "full_name");

        // Mask current_bidder names
        products.forEach(product => {
            if (product.current_bidder && product.current_bidder.full_name) {
                product.current_bidder.full_name = maskUserName(product.current_bidder.full_name);
            }
        });

        res.json({ success: true, data: products });
    } catch (error) {
        console.error("Error in getProductsByCategory:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get seller name, ratting by seller ID
exports.getSellerById = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const seller = await Product.getSellerById(sellerId);
        res.json({ success: true, data: seller });
    } catch (error) {
        console.error("Error in getSellerNameById:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Sản phẩm không tồn tại" });
        }

        // KIỂM TRA ĐIỀU KIỆN AN TOÀN
        const hasBids = product.bid_count > 0;
        const isSold = product.status === "sold";

        // SOFT DELETE
        if (hasBids || isSold) {
            product.status = "deleted";
            await product.save();

            return res.json({
                success: true,
                message:
                    'Sản phẩm đã có người tham gia/đã bán. Đã chuyển sang trạng thái "Đã xóa" (Soft Delete).',
            });

            /*
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa sản phẩm đã có lượt đấu giá hoặc đã bán.'
            });
            */
        }

        // HARD DELETE
        await Product.findByIdAndDelete(id);
        // if (product.images && product.images.length > 0) { ... deleteImagesFromCloud(product.images) ... }
        return res.json({
            success: true,
            message: "Đã xóa sản phẩm vĩnh viễn.",
        });
    } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa sản phẩm",
        });
    }
};

// Ban bidder from product
exports.banBidder = async (req, res) => {
    try {
        const { productId, userId } = req.body;

        if (!productId || !userId) {
            return res.status(400).json({
                success: false,
                message: "productId and userId are required",
            });
        }

        const product = await Product.findById(productId).populate(
            "seller",
            "full_name email"
        );
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Check if user is already banned
        if (product.banned_bidders.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "User is already banned from bidding",
            });
        }

        // Add user to banned list
        product.banned_bidders.push(userId);
        
        // Delete all bids from this user on the product
        await Bid.deleteMany({ product: productId, user: userId });

        // Calculate new highest bid and update product accordingly
        const newHighestBid = await Bid.findOne({ product: productId })
            .sort({ price: -1 })
            .populate("user", "full_name username rating_summary");

        if (newHighestBid) {
            // If there are still bids left
            product.current_price = newHighestBid.price;
            product.current_bidder = newHighestBid.user;
        } else {
            // No bids left
            product.current_price = product.start_price;
            product.current_bidder = null;
        }

        // Update bid_count
        product.bid_count = await Bid.countDocuments({ product: productId });

        await product.save();

        // Mask current bidder name before returning
        let maskedBidder = null;
        if (newHighestBid && newHighestBid.user) {
            maskedBidder = {
                ...newHighestBid.user.toObject(),
                full_name: maskUserName(newHighestBid.user.full_name)
            };
        }

        res.json({
            success: true,
            message: "User has been banned from bidding",
            data: {
                currentPrice: product.current_price,
                currentBidder: maskedBidder,
                bidCount: product.bid_count,
            },
        });

        (async () => {
            try {
                // Find banned user info for email
                const bannedUser = await User.findById(userId);
                
                if (bannedUser && bannedUser.email) {
                await sendBannedBidderEmail({
                    userEmail: bannedUser.email,
                    userName: bannedUser.full_name,
                    productName: product.name,
                    productId: product._id,
                    sellerName: product.seller.full_name,
                });
                }
            } catch (bgError) {
                console.error("Background email error (banBidder):", bgError);
            }
            })();
    } catch (error) {
        console.error("Error in banBidder:", error);
        if (!res.headersSent) {
        res.status(500).json({
            success: false,
            message: "Server error while banning user",
        });
        }
    }
};

// Unban bidder from product
exports.unbanBidder = async (req, res) => {
    try {
        const { productId, userId } = req.body;

        if (!productId || !userId) {
            return res.status(400).json({
                success: false,
                message: "productId and userId are required",
            });
        }

        const product = await Product.findById(productId).populate(
            "seller",
            "full_name email"
        );
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Remove user from banned list
        product.banned_bidders = product.banned_bidders.filter(
            (id) => id.toString() !== userId.toString()
        );
        await product.save();

        res.json({
            success: true,
            message: "User has been unbanned from bidding",
        });

        (async () => {
            try {
                // Get unbanned user info for email
                const unbannedUser = await User.findById(userId);

                // Send email notification
                if (unbannedUser && unbannedUser.email) {
                    await sendUnbannedBidderEmail({
                        userEmail: unbannedUser.email,
                        userName: unbannedUser.full_name,
                        productName: product.name,
                        productId: product._id,
                        sellerName: product.seller.full_name,
                    });
                }
            } catch (emailError) {
                console.error("Background email error:", emailError);
            }
        })();
    } catch (error) {
        console.error("Error in unbanBidder:", error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Server error while unbanning user",
            });
        }
    }
};

exports.getBannedList = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId)
            .select("banned_bidders")
            .populate("banned_bidders", "full_name username email");
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        
        res.json({
            success: true,
            data: product.banned_bidders,
        });
    } catch (error) {
        console.error("Error in getBannedList:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching banned list",
        });
    }
};

// Update product description
exports.updateProductDescription = async (req, res) => {
    try {
        const { productId } = req.params;
        const { newDescription } = req.body;

        if (!newDescription || newDescription.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "New description is required",
            });
        }

        // Find the product to check ownership
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Check if user is the seller or admin
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only the seller or admin can update the description.",
            });
        }

        const updatedProduct = await Product.updateProductDescription(
            productId,
            newDescription.trim()
        );

        res.json({ success: true, data: updatedProduct });

        // Send emails in background (after response)
        (async () => {
            try {
                const bids = await Bid.find({ product: productId })
                    .populate('user', 'email full_name')
                    .lean();

                // Create a map to get unique bidders
                const uniqueBiddersMap = new Map();
                bids.forEach(bid => {
                    if (bid.user && bid.user._id) {
                        const bidderId = bid.user._id.toString();
                        if (!uniqueBiddersMap.has(bidderId)) {
                            uniqueBiddersMap.set(bidderId, bid.user);
                        }
                    }
                });

                // Get seller information
                const seller = await User.findById(product.seller).select('full_name email');

                // Send email to each unique bidder
                const emailPromises = Array.from(uniqueBiddersMap.values()).map(bidder => {
                    return sendDescriptionUpdateEmail({
                        bidderEmail: bidder.email,
                        bidderName: bidder.full_name,
                        productName: product.name,
                        productId: product._id,
                        sellerName: seller ? seller.full_name : 'Người bán',
                    }).catch(emailError => {
                        console.error(`Failed to send description update email to ${bidder.email}:`, emailError);
                    });
                });

                // Send all emails in parallel
                await Promise.all(emailPromises);
                console.log(`Sent description update emails to ${uniqueBiddersMap.size} bidders`);
            } catch (emailError) {
                console.error('Error sending description update emails:', emailError);
            }
        })();
        
    } catch (error) {
        console.error("Error in updateProductDescription:", error);
        if (error.message === "Product not found") {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Buy Now - Người mua trở thành người thắng cuộc và kết thúc đấu giá
// Get products user has bid on that are still active
exports.getMyBiddingProducts = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all products where user has placed bids
        const userBids = await Bid.find({ user: userId })
            .select("product")
            .distinct("product");

        if (userBids.length === 0) {
            return res.json({
                success: true,
                data: [],
            });
        }

        // Get products that are still active
        const products = await Product.find({
            _id: { $in: userBids },
            status: "active",
            end_date: { $gt: new Date() },
        })
            .populate("seller", "full_name")
            .populate("category", "name")
            .populate("current_bidder", "full_name");

        // Get user's highest bid for each product
        const productsWithBidInfo = await Promise.all(
            products.map(async (product) => {
                const userHighestBid = await Bid.findOne({
                    product: product._id,
                    user: userId,
                }).sort({ price: -1 });

                const productObj = product.toObject();
                
                // Mask current_bidder name
                if (productObj.current_bidder && productObj.current_bidder.full_name) {
                    productObj.current_bidder.full_name = maskUserName(productObj.current_bidder.full_name);
                }

                return {
                    ...productObj,
                    my_highest_bid: userHighestBid ? userHighestBid.price : null,
                };
            })
        );

        res.json({
            success: true,
            data: productsWithBidInfo,
        });
    } catch (error) {
        console.error("Error fetching user's bidding products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bidding products",
        });
    }
};

// Get products user has won
exports.getMyWonProducts = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find orders where user is the winner
        const Order = require("../models/Order");
        const wonOrders = await Order.find({
            winner: userId,
            status: { $in: ["pending", "completed", "shipped"] },
        }).populate({
            path: "product",
            populate: [
                {
                    path: "seller",
                    select: "full_name",
                },
                {
                    path: "category",
                    select: "name",
                },
                {
                    path: "current_bidder",
                    select: "full_name",
                },
            ],
        });

        // Format the response
        const wonProducts = wonOrders.map((order) => {
            const productObj = order.product.toObject();
            
            // Mask current_bidder name
            if (productObj.current_bidder && productObj.current_bidder.full_name) {
                productObj.current_bidder.full_name = maskUserName(productObj.current_bidder.full_name);
            }

            return {
                ...productObj,
                final_price: order.final_price,
                order_id: order._id,
                order_status: order.status,
                won_at: order.createdAt,
            };
        });

        res.json({
            success: true,
            data: wonProducts,
        });
    } catch (error) {
        console.error("Error fetching user's won products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch won products",
        });
    }
};

exports.buyNow = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.startTransaction();
        
        const { productId } = req.params;
        const userId = req.user._id;

        // Find product
        const product = await Product.findById(productId).session(session);
        if (!product) {
            throw new Error("Không tìm thấy sản phẩm");
        }

        // Validate product status
        if (product.status !== "active") {
            throw new Error("Sản phẩm không còn hoạt động");
        }

        // Check if product has buy now price
        if (!product.buy_now_price || product.buy_now_price <= 0) {
            throw new Error("Sản phẩm này không hỗ trợ mua ngay");
        }

        // Check if buyer is the seller
        if (product.seller.toString() === userId.toString()) {
            throw new Error("Bạn không thể mua sản phẩm của chính mình");
        }

        // Check if user is banned
        if (product.isBidderBanned(userId)) {
            throw new Error("Bạn đã bị cấm đặt giá cho sản phẩm này");
        }

        // Check if order already exists
        const Order = require("../models/Order");
        const existingOrder = await Order.findOne({ product: productId }).session(session);
        if (existingOrder) {
            throw new Error("Sản phẩm này đã có đơn hàng");
        }

        // Update product: set winner, price, and status to sold
        product.current_bidder = userId;
        product.current_price = product.buy_now_price;
        product.status = "sold";
        await product.save({ session });

        // Create order automatically
        const newOrder = new Order({
            product: productId,
            seller: product.seller,
            winner: userId,
            final_price: product.buy_now_price,
            status: "pending",
            shipping_address: "Pending address (awaiting buyer)",
            messages: [
                {
                    sender: product.seller,
                    content: "System: Đơn hàng được tạo tự động từ chức năng Mua ngay.",
                    sent_at: new Date(),
                },
            ],
        });

        await newOrder.save({ session });

        await session.commitTransaction();

        // Populate data for response
        await product.populate("category", "name");
        await product.populate("seller", "full_name email");
        await product.populate("current_bidder", "full_name email");

        // Mask current_bidder name
        if (product.current_bidder && product.current_bidder.full_name) {
            product.current_bidder.full_name = maskUserName(product.current_bidder.full_name);
        }

        res.json({
            success: true,
            message: "Mua ngay thành công! Đơn hàng đã được tạo.",
            data: {
                product: product,
                order: newOrder,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error in buyNow:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Có lỗi xảy ra khi mua ngay",
        });
    } finally {
        session.endSession();
    }
};
