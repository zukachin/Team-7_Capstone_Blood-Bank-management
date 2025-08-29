// src/routes/donorRoutes.js
const express = require("express");
const router = express.Router();
const donorController = require("../controllers/donorController");
const { authenticate } = require("../middlewares/authMiddlewares");

/**
 * @swagger
 * components:
 *   schemas:
 *     Donor:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - dob
 *         - age
 *         - gender
 *         - mobile_no
 *         - registration_type
 *       properties:
 *         donor_id: { type: integer }
 *         first_name: { type: string, example: John }
 *         last_name: { type: string, example: Doe }
 *         dob: { type: string, format: date, example: 1990-05-01 }
 *         age: { type: integer, example: 34 }
 *         gender: { type: string, enum: [Male, Female, Other], example: Male }
 *         mobile_no: { type: string, example: "9876543210" }
 *         email: { type: string, example: john@example.com }
 *         blood_group_id: { type: integer, example: 1 }
 *         marital_status: { type: string, enum: [Single, Married, Divorced, Widowed], example: Single }
 *         address: { type: string, example: "123 Street, Chennai" }
 *         district: { type: string, example: Chennai }
 *         state: { type: string, example: Tamil Nadu }
 *         country: { type: string, example: India }
 *         centre_id: { type: string, example: "A" }
 *         camp_id: { type: integer, example: 2 }
 *         registration_type: { type: string, enum: [Centre, Camp], example: Centre }
 *         donated_previously: { type: boolean, example: false }
 *         willing_future_donation: { type: boolean, example: true }
 *         contact_preference: { type: boolean, example: true }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 */

/**
 * @swagger
 * /donor/donor-register:
 *   post:
 *     summary: Register a new donor
 *     tags: [Donors]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Donor' }
 *     responses:
 *       201: { description: Donor registered successfully }
 *       400: { description: Validation failed }
 *       500: { description: Server error }
 */
router.post("/donor-register", authenticate, donorController.registerDonor);

/**
 * @swagger
 * /donor:
 *   get:
 *     summary: Get donors list (Admin = own centre; SuperAdmin = all, or filter by ?centre_id=A)
 *     tags: [Donors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: centre_id
 *         schema: { type: string, example: A }
 *         description: SuperAdmin only; filter by centre
 *     responses:
 *       200: { description: Donors fetched successfully }
 *       500: { description: Server error }
 */
router.get("/", authenticate, donorController.getAllDonors);

/**
 * @swagger
 * /donor/search:
 *   get:
 *     summary: Search donors (Admin can pass ?centre_id=OTHER to view other centres)
 *     tags: [Donors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: mobile_no
 *         schema: { type: string }
 *       - in: query
 *         name: blood_group_id
 *         schema: { type: integer }
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *       - in: query
 *         name: district
 *         schema: { type: string }
 *       - in: query
 *         name: camp_id
 *         schema: { type: integer }
 *       - in: query
 *         name: centre_id
 *         schema: { type: string, example: A }
 *         description: Admin may use to view other centres; default = own centre
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 20 }
 *     responses:
 *       200: { description: Donors fetched successfully }
 *       500: { description: Server error }
 */
router.get("/search", authenticate, donorController.searchDonors);

/**
 * @swagger
 * /donor/camp/{camp_id}:
 *   get:
 *     summary: Get donors by camp (Admin default own centre; may set ?centre_id=OTHER to view)
 *     tags: [Donors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: camp_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: centre_id
 *         schema: { type: string, example: A }
 *     responses:
 *       200: { description: Donors fetched successfully }
 *       500: { description: Server error }
 */
router.get("/camp/:camp_id", authenticate, donorController.getDonorsByCamp);

/**
 * @swagger
 * /donor/{id}:
 *   get:
 *     summary: Get donor by id (Admin & SuperAdmin can view any)
 *     tags: [Donors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Donor fetched successfully }
 *       404: { description: Donor not found }
 *       500: { description: Server error }
 *   patch:
 *     summary: Update donor (Admin only own centre; SuperAdmin any)
 *     tags: [Donors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Donor'
 *     responses:
 *       200: { description: Donor updated successfully }
 *       400: { description: Validation failed }
 *       403: { description: Forbidden to update donor from another centre }
 *       404: { description: Donor not found }
 *       500: { description: Server error }
 */
router.get("/:id", authenticate, donorController.getDonorById);
router.patch("/:id", authenticate, donorController.updateDonor);

module.exports = router;
