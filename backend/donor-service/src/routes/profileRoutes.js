// src/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");
const { requireAuth } = require("../middlewares/authMiddleware"); // <- destructure

const profileUpdateValidators = require("../validators/profileValidators");
const handleValidationErrors = require("../validators/handleValidationErrors");

// Get user profile
router.get("/profile", requireAuth, getProfile);

// Update user profile (partial updates allowed)
router.patch(
  "/profile",
  requireAuth,
  profileUpdateValidators,
  handleValidationErrors,
  updateProfile
);

module.exports = router;
