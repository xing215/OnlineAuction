const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    code: {
      type: String,
      required: [true, 'OTP code is required'],
      length: 6
    },
    type: {
      type: String,
      enum: ['register', 'forgot_password'],
      required: [true, 'OTP type is required']
    },
    // Time-To-Live (TTL): Tự động xóa sau 5 phút (300s)
    expireAt: { 
        type: Date, 
        default: Date.now, 
        index: { expires: 300 } 
    }
  },
  {
    timestamps: true
  }
);

// ============================================================
// STATIC METHODS
// ============================================================

// Xác thực OTP
otpSchema.statics.verifyOtp = async function(email, code, type) {
  const otp = await this.findOne({ email, code, type });
  return !!otp;
};

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;