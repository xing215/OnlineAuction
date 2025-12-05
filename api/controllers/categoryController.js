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

// GET /api/categories/tree
exports.getTree = async (req, res, next) => {
  try {
    const tree = await Category.getTree();
    return res.json({ success: true, data: tree });
  } catch (err) {
    next(err);
  }
};
// GET /api/categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.getAllCategories();
    return res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};
