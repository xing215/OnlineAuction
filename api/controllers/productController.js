const Product = require('../models/Product');

// Create product handler supporting multipart uploads (req.files)
exports.createProduct = async (req, res) => {
  try {
    // If files uploaded via multer, build images array as accessible URLs
    let images = [];
    if (req.files && req.files.length) {
      const host = req.get('host');
      const protocol = req.protocol;
      images = req.files.map(f => `${protocol}://${host}/uploads/${f.filename}`);
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

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 8, search, category, sort } = req.query;

    // 1. Xây dựng bộ lọc
    const filter = { status: 'active' };

    // Tìm kiếm (Regex)
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Lọc Category (Nếu khác 'all' và có giá trị)
    if (category && category !== 'all' && category !== 'undefined') {
      filter.category = category;
    }

    // 2. Sắp xếp
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { current_price: 1, start_price: 1 }; 
        break;
      case 'price_desc':
        sortOption = { current_price: -1, start_price: -1 };
        break;
      case 'end_date_asc': 
        sortOption = { end_date: 1 }; 
        break;
      case 'end_date_desc': 
        sortOption = { end_date: -1 }; 
        break;
      case 'newest':
      default:
        sortOption = { posted_at: -1 }; // Mới đăng lên đầu
        break;
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