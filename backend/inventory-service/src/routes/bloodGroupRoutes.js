// src/routes/bloodGroupRoutes.js
const express = require("express");
const router = express.Router();


const { listBloodGroups } = require("../controllers/bloodGroupController");

// import the auth middleware module and destructure the named export

const { authenticate } = require("../middlewares/authMiddlewares");

// Read-only: get blood groups for dropdown
router.get("/blood-groups", authenticate, listBloodGroups);

module.exports = router;
