const mongoose = require('mongoose');

const upgradeRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason for upgrade is required'],
      trim: true,
      minlength: [10, 'Reason must be at least 10 characters'],
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: '{VALUE} is not a valid status'
      },
      default: 'pending'
    },
    admin_note: {
      type: String,
      trim: true,
      default: ''
    }
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
upgradeRequestSchema.index({ status: 1 }); // Admin lọc danh sách chờ duyệt
upgradeRequestSchema.index({ user: 1, status: 1 }); // Tránh user spam nhiều request cùng lúc

// ============================================================
// STATIC METHODS
// ============================================================

// Tìm tất cả request đang chờ xử lý kèm thông tin user
upgradeRequestSchema.statics.findPendingRequests = function() {
  return this.find({ status: 'pending' })
    .populate('user', 'full_name email rating_summary')
    .sort({ createdAt: 1 });
};

// ============================================================
// MIDDLEWARE
// ============================================================

upgradeRequestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    console.log(`Request ${this._id} status changed to ${this.status}`);
  }
  next();
});

const UpgradeRequest = mongoose.model('UpgradeRequest', upgradeRequestSchema);

module.exports = UpgradeRequest;