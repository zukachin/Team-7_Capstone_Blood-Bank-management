// src/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");
const authenticateToken = require("../middlewares/authMiddleware");

// Get user profile + dropdown options
router.get("/profile", authenticateToken, getProfile);

// Update user profile
router.patch("/profile", authenticateToken, updateProfile);

module.exports = router;
