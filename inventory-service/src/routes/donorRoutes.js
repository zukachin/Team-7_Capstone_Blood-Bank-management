// src/routes/donorRoutes.js
const express = require("express");
const router = express.Router();

const donorController = require("../controllers/donorController");
const { authenticate, authorize } = require("../middlewares/authMiddlewares");

// Quick search endpoint used by counter UI (filter by mobile/email)
router.get("/search", authenticate, authorize(["SuperAdmin", "Admin", "Organizer"]), donorController.searchDonors);

// Create donor (any authorized actor can create)
router.post("/", authenticate, authorize(["SuperAdmin", "Admin", "Organizer"]), donorController.registerDonor);

// list donors (scoped by centre for Admin/Organizer)
router.get("/", authenticate, authorize(["SuperAdmin", "Admin", "Organizer"]), donorController.getAllDonors);

// get donor by id
router.get("/:id", authenticate, authorize(["SuperAdmin", "Admin", "Organizer"]), donorController.getDonorById);

// update donor - per your requirement: allowed by authorized actors (controller enforces any centre rules you want)
router.patch("/:id", authenticate, authorize(["SuperAdmin", "Admin", "Organizer"]), donorController.updateDonor);

// delete donor (restrict to admin/superadmin if desired)
router.delete("/:id", authenticate, authorize(["SuperAdmin", "Admin"]), donorController.deleteDonor);

module.exports = router;
