// src/routes/counselingRoutes.js
const express = require("express");
const router = express.Router();

const counselingController = require("../controllers/counselingController");
const { authenticate, authorize } = require("../middlewares/authMiddlewares");

// create counseling (authorized staff)
router.post("/", authenticate, authorize(["SuperAdmin", "Admin", "Organizer"]), counselingController.registerCounseling);

// list counseling rows (scoped to centre unless SuperAdmin)
router.get("/", authenticate, authorize(["SuperAdmin", "Admin", "Organizer"]), counselingController.getAllCounselings);

// get by id
router.get("/:id", authenticate, authorize(["SuperAdmin", "Admin", "Organizer"]), counselingController.getCounselingById);

// update counseling (if allowed)
router.patch("/:id", authenticate, authorize(["SuperAdmin", "Admin", "Organizer"]), counselingController.updateCounseling);

// delete counseling (admin/superadmin)
router.delete("/:id", authenticate, authorize(["SuperAdmin", "Admin"]), counselingController.deleteCounseling);

module.exports = router;
