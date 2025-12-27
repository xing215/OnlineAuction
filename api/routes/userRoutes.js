const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/users - Get all users (admin only)
router.get("/", authMiddleware, authMiddleware.adminMiddleware, userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get("/:id", authMiddleware, userController.getUserById);

// POST /api/users/:id/lock - Lock a user account
router.post("/:id/lock", authMiddleware, authMiddleware.adminMiddleware, userController.lockUser);

// POST /api/users/:id/unlock - Unlock a user account
router.post("/:id/unlock", authMiddleware, authMiddleware.adminMiddleware, userController.unlockUser);

// PUT /api/users/:id - Update user
router.put("/:id", authMiddleware, authMiddleware.adminMiddleware, userController.updateUser);

module.exports = router;
