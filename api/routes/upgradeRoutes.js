const express = require("express");
const router = express.Router();
const upgradeRequestController = require("../controllers/upgradeRequestController");
const authMiddleware = require("../middleware/authMiddleware");

// ============================================================
// BIDDER ROUTES
// ============================================================

// Create a new upgrade request
router.post(
    "/request",
    authMiddleware,
    upgradeRequestController.createUpgradeRequest
);

// Get current user's upgrade request
router.get(
    "/my-request",
    authMiddleware,
    upgradeRequestController.getMyRequest
);

// Cancel pending request
router.delete(
    "/my-request",
    authMiddleware,
    upgradeRequestController.cancelMyRequest
);

// ============================================================
// ADMIN ROUTES
// ============================================================

// Get all upgrade requests (with filtering)
router.get("/all", authMiddleware, upgradeRequestController.getAllRequests);

// Get pending requests
router.get(
    "/pending",
    authMiddleware,
    upgradeRequestController.getPendingRequests
);

// Approve a request
router.patch(
    "/:id/approve",
    authMiddleware,
    upgradeRequestController.approveRequest
);

// Reject a request
router.patch(
    "/:id/reject",
    authMiddleware,
    upgradeRequestController.rejectRequest
);

module.exports = router;
