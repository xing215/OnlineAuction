const User = require('../models/User');
const jwtHelper = require('../utils/jwtHelper');

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email và mật khẩu là bắt buộc' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    // First try bcrypt compare
    let valid = await user.verifyPassword(password);

    if (!valid && user.password && user.password === password) {
      try {
        user.password = password; // trigger pre-save to hash
        await user.save();
        valid = true;
        console.log(`Re-hashed legacy plaintext password for user ${user.email}`);
      } catch (e) {
        console.error('Failed to re-hash plaintext password:', e);
      }
    }

    if (!valid) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    // Build token payload
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const token = jwtHelper.generateToken(payload);

    return res.json({
      success: true,
      token,
      user: user.toProfileJSON()
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    // Verify current password
    const isValidPassword = await user.verifyPassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Mật khẩu hiện tại không chính xác' 
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (err) {
    next(err);
  }
};
