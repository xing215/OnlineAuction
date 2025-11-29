const Category = require('../models/Category');

// GET /api/categories/roots
exports.getRoots = async (req, res, next) => {
  try {
    const roots = await Category.getRoots();
    return res.json({ success: true, data: roots });
  } catch (err) {
    next(err);
  }
};
