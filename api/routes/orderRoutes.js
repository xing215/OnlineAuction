const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// --- CẤU HÌNH MULTER ---
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { 
    files: 10,
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});


// Lấy danh sách & Chi tiết
router.get('/my-orders', authMiddleware, orderController.getMyOrders);
router.get('/:orderId', authMiddleware, orderController.getOrderById);

// Chat
router.get('/:orderId/chat', authMiddleware, orderController.getChatMessages);
router.post('/:orderId/chat', authMiddleware, orderController.sendChatMessage);

// Hủy & Đánh giá
router.post('/:orderId/cancel', authMiddleware, orderController.cancelOrder);
router.post('/:orderId/feedback', authMiddleware, orderController.submitFeedback);

// Thanh toán & Giao hàng
router.post('/:orderId/pay', authMiddleware, upload.array('images'), orderController.buyerPay);
router.post('/:orderId/ship', authMiddleware, upload.array('images'), orderController.sellerShip);

// Nhận hàng
router.post('/:orderId/confirm-receipt', authMiddleware, orderController.buyerConfirmReceipt);

module.exports = router;