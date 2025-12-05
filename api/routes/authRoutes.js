const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public: Login
router.post("/login", authController.login);

// Public: Register
router.post("/register", authController.register);

// Protected: get current user profile
router.get("/me", authMiddleware, (req, res) => {
    return res.json({ success: true, user: req.user });
});

// Protected: update user profile
router.put("/me", authMiddleware, authController.updateProfile);

// Protected: change password
router.post("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
