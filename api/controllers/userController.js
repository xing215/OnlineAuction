const User = require("../models/User");

// GET all users
exports.getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

        const users = await User.find().select(
            "full_name email role status rating_percentage createdAt"
        );

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};

// GET user by ID
exports.getUserById = async (req, res) => {
    try {
        // Check if user is admin or requesting their own profile
        if (
            req.user.role !== "admin" &&
            req.user._id.toString() !== req.params.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        const user = await User.findById(req.params.id).select(
            "-password -social_auth"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
};

// Lock user account
exports.lockUser = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "locked" },
            { new: true }
        ).select("full_name email role status rating_percentage createdAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            message: "User account locked successfully",
            data: user,
        });
    } catch (error) {
        console.error("Error locking user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to lock user account",
        });
    }
};

// Unlock user account
exports.unlockUser = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "active" },
            { new: true }
        ).select("full_name email role status rating_percentage createdAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            message: "User account unlocked successfully",
            data: user,
        });
    } catch (error) {
        console.error("Error unlocking user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to unlock user account",
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        // Check if user is admin or updating their own profile
        if (
            req.user.role !== "admin" &&
            req.user._id.toString() !== req.params.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        const allowedFields = [
            "full_name",
            "phone",
            "address",
            "dob",
            "avatar",
        ];

        // If admin, also allow updating role and status
        if (req.user.role === "admin") {
            allowedFields.push("role", "status");
        }

        const updateData = {};
        allowedFields.forEach((field) => {
            if (req.body[field]) {
                updateData[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password -social_auth");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user",
        });
    }
};

// DELETE user by ID (admin only)
exports.deleteUser = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
        });
    }
};
