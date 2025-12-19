const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const { uploadMultipleToCloudinary } = require("../utils/cloudinary");

// Lấy danh sách đơn hàng
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    // Query: Là người bán HOẶC người thắng
    let query = {
      $or: [{ seller: userId }, { winner: userId }],
    };

    if (status && status !== "all") {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("product", "name images start_price") // Lấy thông tin sản phẩm
      .populate("seller", "full_name email")
      .populate("winner", "full_name email")
      .sort({ createdAt: -1 });

    // TRANSFORM DATA: Giữ ID string cho đúng type, thêm _detail cho UI
    const transformedOrders = orders.map((order) => {
      const doc = order.toObject();

      // Null safety
      const productObj = doc.product || {};
      const sellerObj = doc.seller || {};
      const winnerObj = doc.winner || {};

      return {
        ...doc,
        // Gán lại thành String ID để khớp Type Frontend
        product: productObj._id ? productObj._id.toString() : null,
        seller: sellerObj._id ? sellerObj._id.toString() : null,
        winner: winnerObj._id ? winnerObj._id.toString() : null,

        // Field phụ để hiển thị
        product_detail: productObj,
        seller_detail: sellerObj,
        winner_detail: winnerObj,
      };
    });

    res.json({ success: true, data: transformedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết 1 đơn hàng (Cho trang Detail)
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("product", "name images start_price")
      .populate("seller", "full_name email")
      .populate("winner", "full_name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Transform data tương tự
    const doc = order.toObject();
    const responseData = {
      ...doc,
      product: doc.product?._id.toString(),
      seller: doc.seller?._id.toString(),
      winner: doc.winner?._id.toString(),
      product_detail: doc.product,
      seller_detail: doc.seller,
      winner_detail: doc.winner,
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seller hủy đơn & Phạt người mua
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, seller: userId }).session(
      session
    );
    if (!order) throw new Error("Order not found or unauthorized");
    if (order.status !== "pending")
      throw new Error("Chỉ hủy được đơn đang chờ thanh toán");

    // Update Order
    order.status = "cancelled";
    order.cancellation = { by: userId, reason: reason, at: new Date() };

    // Auto Feedback -1
    const oldScore = order.seller_feedback ? order.seller_feedback.score : 0;
    order.seller_feedback = {
      score: -1,
      comment:
        "Hệ thống: Giao dịch bị hủy do người mua không phản hồi/thanh toán.",
      created_at: new Date(),
    };
    await order.save({ session });

    // Update User Rating
    const updateQuery = { $inc: { "rating_summary.negative_count": 1 } };
    if (oldScore === 1) updateQuery.$inc["rating_summary.positive_count"] = -1;

    if (oldScore !== -1) {
      await User.findByIdAndUpdate(order.winner, updateQuery, { session });
    }

    await session.commitTransaction();
    res.json({ success: true, message: "Đã hủy đơn và phạt người mua." });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// Chat
exports.sendChatMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      order.seller.toString() !== senderId.toString() &&
      order.winner.toString() !== senderId.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await order.addMessage(senderId, content);

    // Trả về full danh sách messages để frontend update
    res.json({ success: true, data: order.messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Feedback (Đánh giá)
exports.submitFeedback = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    const { score, comment } = req.body;

    // 1. Chuyển ID sang String để so sánh chính xác
    const userId = req.user._id.toString();

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("Order not found");

    const sellerId = order.seller.toString();
    const winnerId = order.winner.toString();

    let targetUserId, feedbackField;

    // 2. Kiểm tra quyền (Security Check)
    if (userId === sellerId) {
      targetUserId = winnerId;
      feedbackField = "seller_feedback";
    } else if (userId === winnerId) {
      targetUserId = sellerId;
      feedbackField = "winner_feedback";
    } else {
      throw new Error("Bạn không tham gia giao dịch này.");
    }

    // 3. Tính toán điểm số (SỬA LỖI NaN TẠI ĐÂY)
    const oldScore = order[feedbackField] ? order[feedbackField].score : 0;

    if (score !== oldScore) {
      const userUpdate = { $inc: {} };

      // Dùng biến trung gian để tính, tránh thao tác trực tiếp vào object undefined
      let posDelta = 0;
      let negDelta = 0;

      // Cộng điểm mới
      if (score === 1) posDelta++;
      if (score === -1) negDelta++;

      // Trừ điểm cũ (nếu có)
      if (oldScore === 1) posDelta--;
      if (oldScore === -1) negDelta--;

      // Chỉ gán vào query update nếu giá trị khác 0
      if (posDelta !== 0)
        userUpdate.$inc["rating_summary.positive_count"] = posDelta;
      if (negDelta !== 0)
        userUpdate.$inc["rating_summary.negative_count"] = negDelta;

      // Chỉ gọi DB update nếu có thay đổi
      if (Object.keys(userUpdate.$inc).length > 0) {
        await User.findByIdAndUpdate(targetUserId, userUpdate, { session });
      }
    }

    // 4. Lưu feedback vào Order
    order[feedbackField] = { score, comment, created_at: new Date() };

    // Tự động hoàn tất đơn nếu cả 2 đã đánh giá
    if (
      order.seller_feedback &&
      order.winner_feedback &&
      order.status === "shipped"
    ) {
      order.status = "completed";
    }

    await order.save({ session });
    await session.commitTransaction();

    res.json({ success: true, message: "Đánh giá thành công" });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    // 1. Tìm Order, chỉ select trường messages, seller, winner
    const order = await Order.findById(orderId).select(
      "messages seller winner"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 2. Bảo mật: Check xem người gọi API có phải người trong cuộc không
    if (
      order.seller.toString() !== userId.toString() &&
      order.winner.toString() !== userId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // 3. Trả về danh sách tin nhắn
    res.json({
      success: true,
      data: order.messages, // Frontend sẽ map cái array này ra bong bóng chat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Buyer gửi bằng chứng thanh toán & địa chỉ
exports.buyerPay = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { address } = req.body; // paymentProof không lấy từ body nữa mà xử lý file
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, winner: userId });
    if (!order)
      return res.status(404).json({ message: "Lỗi: Không tìm thấy đơn hàng" });

    // --- LOGIC UPLOAD ẢNH (Giống createProduct) ---
    let proofUrl = null;

    // Kiểm tra xem có file gửi lên không
    if (req.files && req.files.length > 0) {
      try {
        // Upload lên Cloudinary
        const images = await uploadMultipleToCloudinary(req.files);
        // Vì payment_proof trong Model chỉ là String (1 ảnh), ta lấy ảnh đầu tiên
        proofUrl = images[0];

        console.log("Uploaded Payment Proof:", proofUrl);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Lỗi upload ảnh minh chứng" });
      }
    }
    // Fallback: Nếu frontend vẫn gửi link dạng text (optional)
    else if (req.body.paymentProof) {
      proofUrl = req.body.paymentProof;
    }

    if (!proofUrl) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp ảnh chuyển khoản" });
    }

    order.shipping_address = address;
    order.payment_proof = proofUrl; // Lưu link ảnh vào DB
    order.status = "paid";
    await order.save();

    await order.addMessage(userId, "Đã cập nhật thanh toán và địa chỉ.");

    res.json({ success: true, message: "Đã cập nhật thanh toán", data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Seller xác nhận tiền & gửi vận đơn
exports.sellerShip = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, seller: userId });
    if (!order)
      return res.status(404).json({ message: "Lỗi: Không tìm thấy đơn hàng" });

    // --- LOGIC UPLOAD ẢNH ---
    let proofUrl = null;

    if (req.files && req.files.length > 0) {
      try {
        const images = await uploadMultipleToCloudinary(req.files);
        proofUrl = images[0]; // Lấy ảnh đầu tiên
        console.log("Uploaded Shipping Proof:", proofUrl);
      } catch (uploadError) {
        return res.status(500).json({ message: "Lỗi upload ảnh vận đơn" });
      }
    } else if (req.body.shippingProof) {
      proofUrl = req.body.shippingProof;
    }

    if (!proofUrl) {
      return res.status(400).json({ message: "Vui lòng cung cấp ảnh vận đơn" });
    }
    // ------------------------

    order.shipping_proof = proofUrl;
    order.status = "shipped";
    await order.save();

    await order.addMessage(userId, "Đã xác nhận tiền và gửi hàng.");

    res.json({ success: true, message: "Đã cập nhật vận chuyển", data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buyer xác nhận đã nhận hàng
exports.buyerConfirmReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, winner: userId });
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (order.status !== "shipped")
      return res
        .status(400)
        .json({ message: "Chưa thể xác nhận (Hàng chưa được gửi)" });

    order.status = "completed"; // Hoàn tất
    await order.save();

    await order.addMessage(userId, "Đã nhận được hàng. Giao dịch hoàn tất.");

    res.json({ success: true, message: "Đã xác nhận nhận hàng", data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
