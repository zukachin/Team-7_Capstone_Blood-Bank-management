// src/routes/bloodGroupRoutes.js
const express = require("express");
const router = express.Router();

// import the controller module *and* extract the named function
const { listBloodGroups } = require("../controllers/bloodGroupController");

// import the auth middleware module and destructure the named export
const { requireAuth } = require("../middlewares/authMiddleware");

// Read-only: get blood groups for dropdown
router.get("/blood-groups",listBloodGroups);

module.exports = router;
