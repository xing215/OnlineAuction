const mongoose = require('mongoose');

// --- EMBEDDED SCHEMA: FEEDBACK ---
const feedbackSchema = new mongoose.Schema({
  score: { 
    type: Number, 
    enum: [1, -1], // +1 hoặc -1 [cite: 85, 86]
    required: true 
  },
  comment: { 
    type: String, 
    required: true, 
    trim: true 
  },
  created_at: { type: Date, default: Date.now }
}, { _id: false });

// --- EMBEDDED SCHEMA: CHAT MESSAGE---
const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true, 
    trim: true 
  },
  sent_at: { type: Date, default: Date.now }
}, { _id: true });

// --- MAIN SCHEMA: ORDER ---
const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    final_price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
      default: 'pending'
    },
    
    shipping_address: {
      type: String,
      trim: true,
      required: function() { return this.status !== 'cancelled'; }
    },
    payment_proof: { type: String, default: null },
    shipping_proof: { type: String, default: null },

    cancellation: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String, trim: true },
      at: { type: Date }
    },
    
    seller_feedback: feedbackSchema,
    winner_feedback: feedbackSchema,

    messages: [messageSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============================================================
// INDEXES
// ============================================================
orderSchema.index({ seller: 1, status: 1 }); // Seller quản lý đơn bán
orderSchema.index({ winner: 1, status: 1 }); // Winner quản lý đơn mua


// ============================================================
// VIRTUAL PROPERTIES
// ============================================================

// Kiểm tra xem giao dịch đã hoàn tất trọn vẹn chưa (cả 2 bên đã đánh giá)
orderSchema.virtual('is_fully_completed').get(function() {
    return this.status === 'completed' && this.seller_feedback && this.winner_feedback;
});

// ============================================================
// INSTANCE METHODS
// ============================================================

// Phương thức thêm tin nhắn chat mới
orderSchema.methods.addMessage = async function(senderId, content) {
    this.messages.push({ sender: senderId, content: content });
    return this.save();
};


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;