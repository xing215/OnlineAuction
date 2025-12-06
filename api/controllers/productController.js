const Product = require('../models/Product');
const { uploadMultipleToCloudinary } = require('../utils/cloudinary');
const Category = require("../models/Category");

// Create product handler supporting multipart uploads (req.files)
exports.createProduct = async (req, res) => {
  try {
    // Upload images to Cloudinary if files are present
    let images = [];
    if (req.files && req.files.length) {
      try {
        // Upload all images to Cloudinary and get URLs
        images = await uploadMultipleToCloudinary(req.files);
        console.log('Successfully uploaded images to Cloudinary:', images);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload images to Cloudinary',
          error: uploadError.message 
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
      banned_bidders
    } = req.body;

    // Required fields per model
    if (!name || !category || !seller || start_price == null || step_price == null || !end_date) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name, category, seller, start_price, step_price, end_date' });
    }

    // If client also sent images in body (JSON), append them
    if (req.body.images && Array.isArray(req.body.images)) {
      images = images.concat(req.body.images);
    }

    if (images.length < 3) {
      return res.status(400).json({ success: false, message: 'Product must have at least 3 images' });
    }

    const allowedStatus = ['active', 'sold', 'expired'];
    const finalStatus = status && allowedStatus.includes(status) ? status : 'active';

    const productData = {
      name: String(name).trim(),
      category,
      seller,
      images,
      description: description || undefined,
      start_price: Number(start_price),
      step_price: Number(step_price),
      buy_now_price: buy_now_price != null && buy_now_price !== '' ? Number(buy_now_price) : null,
      end_date: new Date(end_date),
      status: finalStatus,
      banned_bidders: Array.isArray(banned_bidders) ? banned_bidders : []
    };

    const product = await Product.create(productData);
    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('createProduct error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
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
    const { page = 1, limit = 8, search, category, sort } = req.query;

    // 1. Khởi tạo bộ lọc cơ bản
    // Dùng $and để đảm bảo kết hợp được nhiều điều kiện (Status + Category Filter + Search)
    const filter = { 
      status: 'active',
      $and: [] 
    };

    // --- LOGIC: XỬ LÝ SEARCH (NAME + CATEGORY NAME) ---
    if (search) {
      // Tìm các Category có tên khớp với từ khóa tìm kiếm
      const matchingCategories = await Category.find({ 
        name: { $regex: search, $options: 'i' } 
      }).select('_id');

      const matchingCategoryIds = matchingCategories.map(cat => cat._id);

      // Tạo điều kiện tìm kiếm tổng hợp (Product Name HOẶC Category Name)
      const searchCondition = {
        $or: [
          { name: { $regex: search, $options: 'i' } }, // Khớp tên sản phẩm
          { category: { $in: matchingCategoryIds } }   // Hoặc thuộc danh mục có tên khớp
        ]
      };

      // Đẩy điều kiện này vào mảng $and
      filter.$and.push(searchCondition);
    }
    // -----------------------------------------------------

    // Lọc Category cụ thể (Dropdown filter)
    if (category && category !== 'all' && category !== 'undefined') {
      // Giả sử bạn có hàm getAllSubcategories để lấy cả danh mục con
      const categoryIds = await getAllSubcategories(category);
      
      // Đẩy điều kiện category vào mảng $and
      filter.$and.push({ category: { $in: categoryIds } });
    }

    // *Dọn dẹp*: Nếu mảng $and rỗng (không search, không filter category), xóa nó đi để tránh lỗi query
    if (filter.$and.length === 0) {
      delete filter.$and;
    }

    // 2. Sắp xếp
    let sortOption = {};
    switch (sort) {
      case 'price_asc': sortOption = { current_price: 1, start_price: 1 }; break;
      case 'price_desc': sortOption = { current_price: -1, start_price: -1 }; break;
      case 'end_date_asc': sortOption = { end_date: 1 }; break;
      case 'end_date_desc': sortOption = { end_date: -1 }; break;
      case 'newest': default: sortOption = { posted_at: -1 }; break;
    }

    // 3. Phân trang
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    // 4. Query DB
    const [products, totalDocs] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter)
    ]);

    // 5. Trả về Response
    res.json({
      success: true,
      data: products,
      total_items: totalDocs,
      total_pages: Math.ceil(totalDocs / limitNum),
      current_page: pageNum
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
      data: products
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
      data: products
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
    
    res.json({
      success: true,
      data: products
    });
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
      return res.status(404).json({ success: false, message: 'Product not found' });
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
}

// Get products by category ID
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId, status: 'active' })
                                  .populate('category', 'name');
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

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
}