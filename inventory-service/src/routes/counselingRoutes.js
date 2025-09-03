const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddlewares");
const counselingController = require("../controllers/counselingController");
const { validateCampId, validateCentreId } = require("../validators/counselingValidator");

/**
 * @swagger
 * /counseling/register:
 *   post:
 *     summary: Register counseling for a donor
 *     tags:
 *       - Counseling
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               donor_id:
 *                 type: integer
 *               counseling_date:
 *                 type: string
 *                 format: date-time
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               hb_level:
 *                 type: number
 *               previous_donation_date:
 *                 type: string
 *                 format: date
 *               drunk_last_12hrs:
 *                 type: boolean
 *               well_today:
 *                 type: boolean
 *               under_medication:
 *                 type: boolean
 *               fever_in_2_weeks:
 *                 type: boolean
 *               recently_delivered:
 *                 type: boolean
 *               pregnancy:
 *                 type: boolean
 *               surgery:
 *                 type: boolean
 *               disease_history:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Counseling registered successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Access denied
 *       404:
 *         description: Donor not found
 */
router.post("/register", authenticate, counselingController.registerCounseling);

/**
 * @swagger
 * /counseling/camp/{campId}:
 *   get:
 *     summary: Get counseling records by Camp ID
 *     tags: [Counseling]
 *     parameters:
 *       - in: path
 *         name: campId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the camp
 *     responses:
 *       200:
 *         description: List of counseling records for the camp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 counseling:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       counseling_id:
 *                         type: integer
 *                       donor_id:
 *                         type: integer
 *                       camp_id:
 *                         type: integer
 *                       centre_id:
 *                         type: integer
 *                       counseling_date:
 *                         type: string
 *                         format: date-time
 *                       height:
 *                         type: number
 *                       weight:
 *                         type: number
 *                       hb_level:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: [Pending, Accepted, Declined]
 *       404:
 *         description: No counseling records found for this camp
 *       500:
 *         description: Error fetching counseling records
 */
router.get("/camp/:campId", authenticate, validateCampId, counselingController.getCounselingByCamp);

/**
 * @swagger
 * /counseling/centre/{centreId}:
 *   get:
 *     summary: Get counseling records by Centre ID
 *     tags: [Counseling]
 *     parameters:
 *       - in: path
 *         name: centreId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the centre
 *     responses:
 *       200:
 *         description: List of counseling records for the centre
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 counseling:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       counseling_id:
 *                         type: integer
 *                       donor_id:
 *                         type: integer
 *                       camp_id:
 *                         type: integer
 *                       centre_id:
 *                         type: integer
 *                       counseling_date:
 *                         type: string
 *                         format: date-time
 *                       height:
 *                         type: number
 *                       weight:
 *                         type: number
 *                       hb_level:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: [Pending, Accepted, Declined]
 *       404:
 *         description: No counseling records found for this centre
 *       500:
 *         description: Error fetching counseling records
 */

router.get("/centre/:centreId", authenticate, validateCentreId, counselingController.getCounselingByCentre);

module.exports = router;
