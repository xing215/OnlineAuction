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
