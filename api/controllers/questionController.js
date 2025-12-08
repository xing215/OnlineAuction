const ProductQuestion = require('../models/ProductQuestion');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendNewQuestionEmail, sendAnswerEmail } = require('../utils/emailService');

exports.createQuestion = async (req, res) => {
  try {
    const { productId } = req.params;
    const { question } = req.body;
    const askerId = req.user.id; 

    // Validate
    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập câu hỏi'
      });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId).populate('seller', 'full_name email');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    if (product.seller._id.toString() === askerId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể đặt câu hỏi cho sản phẩm của chính mình'
      });
    }

    // Tạo câu hỏi mới
    const newQuestion = await ProductQuestion.create({
      product: productId,
      asker: askerId,
      question: question.trim(),
      answer: null,
      asked_at: new Date(),
      answered_at: null
    });

    // Lấy thông tin người hỏi
    const asker = await User.findById(askerId).select('full_name email');

    // Gửi email thông báo cho người bán 
    sendNewQuestionEmail({
      sellerEmail: product.seller.email,
      sellerName: product.seller.full_name,
      productName: product.name,
      productId: product._id,
      askerName: asker.full_name,
      askerEmail: asker.email,
      question: question.trim()
    }).catch(err => console.error('Email error:', err));

    // Populate để trả về đầy đủ thông tin
    const populatedQuestion = await ProductQuestion.findById(newQuestion._id)
      .populate('asker', 'full_name')
      .populate('product', 'name');

    return res.status(201).json({
      success: true,
      message: 'Đã gửi câu hỏi thành công',
      data: populatedQuestion
    });

  } catch (error) {
    console.error('createQuestion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo câu hỏi'
    });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Lấy danh sách câu hỏi, sắp xếp mới nhất trước
    const questions = await ProductQuestion.find({ product: productId })
      .populate('asker', 'full_name')
      .sort({ asked_at: -1 });

    // Mask tên người hỏi trước khi trả về
    const safeQuestions = questions.map(q => q.toSafeJSON());

    return res.status(200).json({
      success: true,
      data: safeQuestions
    });

  } catch (error) {
    console.error('getQuestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách câu hỏi'
    });
  }
};

exports.answerQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;

    // Validate
    if (!answer || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập câu trả lời'
      });
    }

    // Tìm câu hỏi và populate thông tin
    const question = await ProductQuestion.findById(questionId)
      .populate('product', 'seller name')
      .populate('asker', 'full_name email');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi'
      });
    }

    // Kiểm tra chỉ người bán mới được trả lời
    if (question.product.seller.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền trả lời câu hỏi này'
      });
    }

    // Kiểm tra đã trả lời chưa
    if (question.answer) {
      return res.status(400).json({
        success: false,
        message: 'Câu hỏi này đã được trả lời rồi'
      });
    }

    // Cập nhật câu trả lời
    question.answer = answer.trim();
    question.answered_at = new Date();
    await question.save();

    // Lấy thông tin người bán
    const seller = await User.findById(userId).select('full_name email');

    // Gửi email thông báo cho người hỏi 
    sendAnswerEmail({
      askerEmail: question.asker.email,
      askerName: question.asker.full_name,
      productName: question.product.name,
      productId: question.product._id,
      sellerName: seller.full_name,
      sellerEmail: seller.email,
      question: question.question,
      answer: answer.trim()
    }).catch(err => console.error('Email error:', err));

    // Populate lại để trả về đầy đủ thông tin
    const updatedQuestion = await ProductQuestion.findById(questionId)
      .populate('asker', 'full_name')
      .populate('product', 'name seller');

    return res.status(200).json({
      success: true,
      message: 'Đã trả lời câu hỏi thành công',
      data: updatedQuestion
    });

  } catch (error) {
    console.error('answerQuestion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi trả lời câu hỏi'
    });
  }
};

exports.getMyQuestions = async (req, res) => {
  try {
    const userId = req.user.id;

    const questions = await ProductQuestion.find({ asker: userId })
      .populate('product', 'name images')
      .sort({ asked_at: -1 });

    return res.status(200).json({
      success: true,
      data: questions
    });

  } catch (error) {
    console.error('getMyQuestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy câu hỏi của bạn'
    });
  }
};


exports.getPendingQuestions = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Tìm tất cả sản phẩm của seller
    const products = await Product.find({ seller: sellerId }).select('_id');
    const productIds = products.map(p => p._id);

    // Tìm câu hỏi chưa trả lời
    const pendingQuestions = await ProductQuestion.find({
      product: { $in: productIds },
      answer: null
    })
      .populate('asker', 'full_name')
      .populate('product', 'name images')
      .sort({ asked_at: -1 });

    return res.status(200).json({
      success: true,
      data: pendingQuestions
    });

  } catch (error) {
    console.error('getPendingQuestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy câu hỏi chưa trả lời'
    });
  }
};

module.exports = exports;
