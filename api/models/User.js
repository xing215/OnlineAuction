const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: {
      type: String,
      required: function() { return this.social_auth.length === 0; },
      minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
      type: String,
      trim: true,
      sparse: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    dob: {
      type: Date,
      default: null
    },
    role: {
      type: String,
      enum: ['bidder', 'seller', 'admin'],
      default: 'bidder'
    },
    avatar: {
        type: String,
        default: 'default-avatar.jpg'
    },
    status: {
      type: String,
      enum: ['unverified', 'active', 'locked'],
      default: 'unverified'
    },
    
    seller_details: {
      expiry_date: { type: Date, default: null },
      upgrade_request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UpgradeRequest' }
    },

    rating_summary: {
      positive_count: { type: Number, default: 0 },
      negative_count: { type: Number, default: 0 },
    },

    watch_list: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],

    social_auth: [{
      provider: { type: String, enum: ['google', 'facebook', 'github'] },
      provider_id: String,
      email: String
    }]
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
// userSchema.index({ email: 1 }); // Unique search
userSchema.index({ role: 1 });  // Filter by role
userSchema.index({ "seller_details.expiry_date": 1 }); // Tìm seller hết hạn

// ============================================================
// VIRTUAL PROPERTIES (Computed Fields)
// ============================================================

// Tính điểm uy tín (%) 
userSchema.virtual('rating_percentage').get(function() {
  const pos = this.rating_summary.positive_count;
  const neg = this.rating_summary.negative_count;
  const total = pos + neg;

  if (total === 0) return 100; // Mặc định chưa đánh giá là uy tín (hoặc logic tùy chỉnh)
  return Math.round((pos / total) * 100);
});

// Tính điểm uy tín (Hiệu số) 
userSchema.virtual('rating_score').get(function() {
    return `${this.rating_summary.positive_count}/${this.rating_summary.positive_count + this.rating_summary.negative_count}`;
});

// Check xem User có đang là Seller hợp lệ không
userSchema.virtual('is_valid_seller').get(function() {
  if (this.role === 'admin') return true;
  if (this.role !== 'seller') return false;
  
  if (!this.seller_details.expiry_date) return false;
  return this.seller_details.expiry_date > new Date();
});

// ============================================================
// INSTANCE METHODS
// ============================================================

// Kiểm tra password (bcrypt) 
userSchema.methods.verifyPassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Kiểm tra điều kiện được phép Bid 
// "Điểm đánh giá > 80% thì mới cho phép ra giá"
userSchema.methods.canBid = function(sellerAllowsNewBidders = false) {
  const totalRatings = this.rating_summary.positive_count + this.rating_summary.negative_count;
  
  // Nếu chưa có đánh giá, phụ thuộc vào seller
  if (totalRatings === 0) {
    return sellerAllowsNewBidders;
  }
  
  return this.rating_percentage >= 80;
};

// Helper format dữ liệu trả về client (bỏ password)
userSchema.methods.toProfileJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.social_auth;
  return obj;
};

// ============================================================
// STATIC METHODS
// ============================================================

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Tìm các Seller đã hết hạn quyền bán (để hạ cấp về Bidder) 
userSchema.statics.findExpiredSellers = function() {
  return this.find({
    role: 'seller',
    'seller_details.expiry_date': { $lte: new Date() }
  });
};

// ============================================================
// MIDDLEWARE (HOOKS)
// ============================================================

// Hash password trước khi save 
userSchema.pre('save', async function(next) {
  // Chỉ hash nếu password có thay đổi (hoặc mới tạo)
  if (!this.isModified('password') || !this.password) return next();

  try {
    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.post('save', function(doc, next) {
  console.log('User saved successfully:', doc.email);
  next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;