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
