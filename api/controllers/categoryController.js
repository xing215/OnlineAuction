const Category = require('../models/Category');
const Product = require('../models/Product');

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
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products_list'
        }
      },
      {
        $addFields: {
          product_count: { $size: '$products_list' }
        }
      },
      {
        $project: {
          products_list: 0,
          __v: 0
        }
      },
    ]);

    return res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, parent_id, icon, is_active } = req.body;
    const validParentId = parent_id && parent_id !== "" ? parent_id : null;

    const newCategory = new Category({
      name,
      parent_id: validParentId,
      icon,
      is_active: is_active !== undefined ? is_active : true
    });

    const savedCategory = await newCategory.save();
    return res.status(201).json({ success: true, data: savedCategory });
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.parent_id === "") {
        updateData.parent_id = null;
    }
    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    return res.json({ success: true, data: updatedCategory });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const childCount = await Category.countDocuments({ parent_id: id });

    if (childCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Không thể xóa: Danh mục này đang chứa ${childCount} danh mục con.` 
      });
    }

    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Không thể xóa: Danh mục này đang chứa ${productCount} sản phẩm.` 
      });
    }
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục cần xóa' });
    }
    return res.json({ success: true, message: 'Đã xóa danh mục thành công', id });
  } catch (err) {
    next(err);
  }
};
