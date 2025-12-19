const UpgradeRequest = require("../models/UpgradeRequest");
const User = require("../models/User");

// ============================================================
// BIDDER CONTROLLERS
// ============================================================

/**
 * @desc    Create a new upgrade request
 * @route   POST /api/upgrade/request
 * @access  Private (Bidder only)
 */
exports.createUpgradeRequest = async (req, res) => {
    try {
        const { reason } = req.body;
        const userId = req.user._id;

        // Check if user is already a seller
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.role === "seller" || user.role === "admin") {
            return res.status(400).json({
                success: false,
                message: "You are already a seller or admin",
            });
        }

        // Check if user has pending request
        const existingRequest = await UpgradeRequest.findOne({
            user: userId,
            status: "pending",
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending upgrade request",
            });
        }

        // Validate reason
        if (!reason || reason.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "Reason must be at least 10 characters",
            });
        }

        if (reason.trim().length > 500) {
            return res.status(400).json({
                success: false,
                message: "Reason cannot exceed 500 characters",
            });
        }

        // Create new upgrade request
        const upgradeRequest = await UpgradeRequest.create({
            user: userId,
            reason: reason.trim(),
        });

        // Update user's seller_details with the request reference
        await User.findByIdAndUpdate(userId, {
            "seller_details.upgrade_request_id": upgradeRequest._id,
        });

        const populatedRequest = await UpgradeRequest.findById(
            upgradeRequest._id
        ).populate("user", "full_name email rating_summary");

        return res.status(201).json({
            success: true,
            message: "Upgrade request submitted successfully",
            data: populatedRequest,
        });
    } catch (error) {
        console.error("Error creating upgrade request:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create upgrade request",
        });
    }
};

/**
 * @desc    Get current user's upgrade request
 * @route   GET /api/upgrade/my-request
 * @access  Private (Bidder only)
 */
exports.getMyRequest = async (req, res) => {
    try {
        const userId = req.user._id;

        const request = await UpgradeRequest.findOne({ user: userId })
            .sort({ createdAt: -1 })
            .populate("user", "full_name email");

        if (!request) {
            return res.json({
                success: true,
                message: "No upgrade request found",
                data: null,
            });
        }

        return res.json({
            success: true,
            message: "Request retrieved successfully",
            data: request,
        });
    } catch (error) {
        console.error("Error fetching upgrade request:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch upgrade request",
        });
    }
};

/**
 * @desc    Cancel pending request
 * @route   DELETE /api/upgrade/my-request
 * @access  Private (Bidder only)
 */
exports.cancelMyRequest = async (req, res) => {
    try {
        const userId = req.user._id;

        const request = await UpgradeRequest.findOne({
            user: userId,
            status: "pending",
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "No pending request found",
            });
        }

        await UpgradeRequest.findByIdAndDelete(request._id);

        // Remove reference from user
        await User.findByIdAndUpdate(userId, {
            $unset: { "seller_details.upgrade_request_id": "" },
        });

        return res.json({
            success: true,
            message: "Request cancelled successfully",
            data: null,
        });
    } catch (error) {
        console.error("Error cancelling upgrade request:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel upgrade request",
        });
    }
};

// ============================================================
// ADMIN CONTROLLERS
// ============================================================

/**
 * @desc    Get all upgrade requests with filtering
 * @route   GET /api/upgrade/all?status=pending&page=1&limit=10
 * @access  Private (Admin only)
 */
exports.getAllRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = {};

        if (status && ["pending", "approved", "rejected"].includes(status)) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const requests = await UpgradeRequest.find(query)
            .populate("user", "full_name email rating_summary avatar role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await UpgradeRequest.countDocuments(query);

        return res.json({
            success: true,
            message: "Requests retrieved successfully",
            data: {
                requests,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching upgrade requests:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch upgrade requests",
        });
    }
};

/**
 * @desc    Get pending requests
 * @route   GET /api/upgrade/pending
 * @access  Private (Admin only)
 */
exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await UpgradeRequest.findPendingRequests();

        return res.json({
            success: true,
            message: "Pending requests retrieved successfully",
            data: requests,
        });
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending requests",
        });
    }
};

/**
 * @desc    Approve an upgrade request
 * @route   PATCH /api/upgrade/:id/approve
 * @access  Private (Admin only)
 */
exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_note, expiry_days = 365 } = req.body;

        const request = await UpgradeRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be approved",
            });
        }

        // Update request status
        request.status = "approved";
        request.admin_note = admin_note || "Request approved";
        await request.save();

        // Calculate expiry date for seller role
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(expiry_days));

        // Update user role to seller
        await User.findByIdAndUpdate(request.user, {
            role: "seller",
            "seller_details.expiry_date": expiryDate,
            "seller_details.upgrade_request_id": request._id,
        });

        const updatedRequest = await UpgradeRequest.findById(id).populate(
            "user",
            "full_name email role"
        );

        return res.json({
            success: true,
            message: "Request approved successfully",
            data: updatedRequest,
        });
    } catch (error) {
        console.error("Error approving upgrade request:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve upgrade request",
        });
    }
};

/**
 * @desc    Reject an upgrade request
 * @route   PATCH /api/upgrade/:id/reject
 * @access  Private (Admin only)
 */
exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_note } = req.body;

        if (!admin_note || admin_note.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Admin note is required for rejection",
            });
        }

        const request = await UpgradeRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be rejected",
            });
        }

        // Update request status
        request.status = "rejected";
        request.admin_note = admin_note.trim();
        await request.save();

        // Remove reference from user
        await User.findByIdAndUpdate(request.user, {
            $unset: { "seller_details.upgrade_request_id": "" },
        });

        const updatedRequest = await UpgradeRequest.findById(id).populate(
            "user",
            "full_name email"
        );

        return res.json({
            success: true,
            message: "Request rejected",
            data: updatedRequest,
        });
    } catch (error) {
        console.error("Error rejecting upgrade request:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject upgrade request",
        });
    }
};
