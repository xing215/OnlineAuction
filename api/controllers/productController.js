const Product = require("../models/Product");
const { uploadMultipleToCloudinary } = require("../utils/cloudinary");
const Category = require("../models/Category");
const { sendBannedBidderEmail } = require("../utils/emailService");
const { sendUnbannedBidderEmail } = require("../utils/emailService");
const User = require("../models/User");

// Helper function to mask user name
function maskUserName(fullName) {
    if (!fullName) return "****User";
    const name = fullName.trim();
    const parts = name.split(" ");
    const lastName = parts[parts.length - 1];
    return `****${lastName}`;
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
            filter.$text = { $search: search };
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
                .populate("current_bidder", "full_name")
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum),
            Product.countDocuments(filter),
        ]);

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
        const productData = product.toObject ? product.toObject() : product;
        if (!productData.current_price || productData.current_price === 0) {
            productData.current_price = productData.start_price;
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
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

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
        await product.save();

        // Get banned user info for email
        const bannedUser = await User.findById(userId);

        // Send email notification
        if (bannedUser && bannedUser.email) {
            sendBannedBidderEmail({
                userEmail: bannedUser.email,
                userName: bannedUser.full_name,
                productName: product.name,
                productId: product._id,
                sellerName: product.seller.full_name,
            });
        }

        res.json({
            success: true,
            message: "User has been banned from bidding",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while banning user",
        });
    }
};

// Unban bidder from product
exports.unbanBidder = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

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

        // Get unbanned user info for email
        const unbannedUser = await User.findById(userId);

        // Send email notification
        if (unbannedUser && unbannedUser.email) {
            sendUnbannedBidderEmail({
                userEmail: unbannedUser.email,
                userName: unbannedUser.full_name,
                productName: product.name,
                productId: product._id,
                sellerName: product.seller.full_name,
            });
        }

        res.json({
            success: true,
            message: "User has been unbanned from bidding",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while unbanning user",
        });
    }
};

exports.getBannedList = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

        const { productId } = req.params;
        const product = await Product.findById(productId).select(
            "banned_bidders"
        );
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
        if (product.seller.toString() !== req.user._id && req.user.role !== "admin") {
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
