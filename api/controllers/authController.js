const User = require("../models/User");
const jwtHelper = require("../utils/jwtHelper");
const { verifyRecaptcha } = require("../utils/recaptchaHelper");

// POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password, recaptchaToken } = req.body;

        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        const requiresRecaptcha = !!recaptchaSecret;

        if (!email || !password || (requiresRecaptcha && !recaptchaToken)) {
            const message = requiresRecaptcha 
                ? "Email, mật khẩu và reCAPTCHA là bắt buộc"
                : "Email và mật khẩu là bắt buộc";
            return res.status(400).json({
                success: false,
                message,
            });
        }

        // Verify reCAPTCHA if configured
        if (requiresRecaptcha) {
            const recaptchaResult = await verifyRecaptcha(recaptchaToken, recaptchaSecret);
            if (!recaptchaResult.success) {
                return res.status(400).json({
                    success: false,
                    message: "Xác minh reCAPTCHA thất bại",
                });
            }
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không chính xác",
            });
        }

        // First try bcrypt compare
        let valid = await user.verifyPassword(password);

        if (!valid && user.password && user.password === password) {
            try {
                user.password = password; // trigger pre-save to hash
                await user.save();
                valid = true;
                console.log(
                    `Re-hashed legacy plaintext password for user ${user.email}`
                );
            } catch (e) {
                console.error("Failed to re-hash plaintext password:", e);
            }
        }

        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không chính xác",
            });
        }

        // Build token payload
        const payload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const token = jwtHelper.generateToken(payload);

        return res.json({
            success: true,
            token,
            user: user.toProfileJSON(),
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { email, password, full_name, recaptchaToken } = req.body;

        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        const requiresRecaptcha = !!recaptchaSecret;

        if (!email || !password || !full_name || (requiresRecaptcha && !recaptchaToken)) {
            const message = requiresRecaptcha 
                ? "Email, mật khẩu, họ tên và reCAPTCHA là bắt buộc"
                : "Email, mật khẩu và họ tên là bắt buộc";
            return res.status(400).json({
                success: false,
                message,
            });
        }

        // Verify reCAPTCHA if configured
        if (requiresRecaptcha) {
            const recaptchaResult = await verifyRecaptcha(recaptchaToken, recaptchaSecret);
            if (!recaptchaResult.success) {
                return res.status(400).json({
                    success: false,
                    message: "Xác minh reCAPTCHA thất bại",
                });
            }
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email đã được sử dụng",
            });
        }

        // Create new user
        const user = new User({
            email,
            password,
            full_name,
        });

        await user.save();

        // Generate token
        const payload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const token = jwtHelper.generateToken(payload);

        return res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            token,
            user: user.toProfileJSON(),
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
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
                message: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu mới phải có ít nhất 6 ký tự",
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu mới phải khác mật khẩu hiện tại",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Người dùng không tồn tại" });
        }

        // Verify current password
        const isValidPassword = await user.verifyPassword(currentPassword);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Mật khẩu hiện tại không chính xác",
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        return res.json({
            success: true,
            message: "Đổi mật khẩu thành công",
        });
    } catch (err) {
        next(err);
    }
};

// PUT /api/auth/me
exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { full_name, email, phone, address, dob, role, watch_list } =
            req.body;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Người dùng không tồn tại",
            });
        }

        // Update watch_list if provided
        if (watch_list !== undefined) {
            if (!Array.isArray(watch_list)) {
                return res.status(400).json({
                    success: false,
                    message: "Danh sách yêu thích không hợp lệ",
                });
            }
            user.watch_list = watch_list;
        }

        // Validate full_name
        if (full_name !== undefined) {
            if (typeof full_name !== "string" || full_name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Họ tên phải có ít nhất 2 ký tự",
                });
            }
            user.full_name = full_name.trim();
        }

        // Validate and update email
        if (email !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Email không hợp lệ",
                });
            }

            // Check if email already exists (excluding current user)
            const existingEmail = await User.findOne({
                email: email.toLowerCase().trim(),
                _id: { $ne: userId },
            });

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email này đã được sử dụng",
                });
            }

            user.email = email.toLowerCase().trim();
        }

        // Validate phone
        if (phone !== undefined) {
            if (
                typeof phone !== "string" ||
                !/^[0-9+\s]+$/.test(phone) ||
                phone.length < 10
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Số điện thoại không hợp lệ",
                });
            }
            user.phone = phone.trim();
        }

        // Validate address
        if (address !== undefined) {
            if (typeof address !== "string" || address.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Địa chỉ không được để trống",
                });
            }
            user.address = address.trim();
        }

        // Validate and update dob
        if (dob !== undefined && dob !== null && dob !== "") {
            const dobDate = new Date(dob);
            if (isNaN(dobDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Ngày sinh không hợp lệ",
                });
            }
            user.dob = dobDate;
        }

        // Role update - only allow if admin or keep same role
        // Prevent users from escalating their own privileges
        if (role !== undefined && role !== user.role) {
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền thay đổi vai trò",
                });
            }

            const validRoles = ["bidder", "seller", "admin"];
            if (!validRoles.includes(role.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: "Vai trò không hợp lệ",
                });
            }
            user.role = role.toLowerCase();
        }

        // Save updated user
        await user.save();

        // Return updated profile
        return res.json({
            success: true,
            message: "Cập nhật thông tin thành công",
            user: user.toProfileJSON(),
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        next(err);
    }
};
