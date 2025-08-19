const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST api/auth/login
// @desc    Authenticate user (admin) and get token
// @access  Public
router.post("/login", authController.login);

// @route   POST api/auth/register-admin
// @desc    Register a new admin (should be protected or for initial setup)
// @access  Restricted
router.post("/register-admin", authController.registerAdmin);

// @route   GET api/auth/me
// @desc    Get current user information with client data
// @access  Private
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;

