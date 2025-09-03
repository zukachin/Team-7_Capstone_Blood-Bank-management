const pool = require("../db/db");
const { counselingSchema } = require("../validators/counselingValidator");

/**
 * POST /counseling/register
 * Add a new counseling record for a donor
 */
// src/controllers/counselingController.js

// src/controllers/counselingController.js

exports.registerCounseling = async (req, res) => {
  try {
    const { error, value } = counselingSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        msg: "Validation failed",
        errors: error.details.map(e => e.message),
      });
    }

    const { donor_id, camp_id, centre_id, weight, hb_level, previous_donation_date } = value;

    // 1️⃣ Check donor exists
    const donorRes = await pool.query(
      "SELECT donor_id FROM donors WHERE donor_id = $1",
      [donor_id]
    );
    if (!donorRes.rowCount) {
      return res.status(404).json({ msg: "Donor not found" });
    }

    // 2️⃣ Determine status
    let status = "Pending";
    const today = new Date();
    let daysSinceDonation = null;

    if (previous_donation_date) {
      daysSinceDonation = Math.floor(
        (today - new Date(previous_donation_date)) / (1000 * 60 * 60 * 24)
      );
    }

    if (weight > 45 && hb_level > 12.5 && (!daysSinceDonation || daysSinceDonation >= 56)) {
      status = "Approved";
    } else {
      status = "Declined";
    }

    // 3️⃣ Insert counseling record
    const sql = `
      INSERT INTO donor_counseling
      (donor_id, camp_id, centre_id, counseling_date, height, weight, hb_level,
       previous_donation_date, drunk_last_12hrs, well_today, under_medication,
       fever_in_2_weeks, recently_delivered, pregnancy, surgery, disease_history, status)
      VALUES
      ($1,$2,$3,CURRENT_TIMESTAMP,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `;

    const params = [
      donor_id, camp_id || null, centre_id || null,
      value.height, weight, hb_level, previous_donation_date || null,
      value.drunk_last_12hrs ?? false,
      value.well_today ?? true,
      value.under_medication ?? false,
      value.fever_in_2_weeks ?? false,
      value.recently_delivered ?? false,
      value.pregnancy ?? false,
      value.surgery ?? false,
      value.disease_history || null,
      status,
    ];

    const result = await pool.query(sql, params);

    return res.status(201).json({
      msg: "Counseling registered successfully",
      counseling: result.rows[0],
    });

  } catch (err) {
    console.error("Error in registerCounseling:", err);
    return res.status(500).json({
      msg: "Error registering counseling",
      error: err.message,
    });
  }
};

/**
 * Get counseling records by camp_id
 */
exports.getCounselingByCamp = async (req, res) => {
    try {
        const  campId  = req.params.campId;

        const result = await pool.query(
            "SELECT * FROM donor_counseling WHERE camp_id = $1 ORDER BY counseling_date DESC",
            [campId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: "No counseling records found for this camp" });
        }

        res.json({ counseling: result.rows });
    } catch (err) {
        console.error("Error in getCounselingByCamp:", err);
        res.status(500).json({ msg: "Error fetching counseling by camp", error: err.message });
    }
};

/**
 * Get counseling records by centre_id
 */
exports.getCounselingByCentre = async (req, res) => {
  try {
    const { centreId } = req.params.centreId; // example: "A", "B", "C"

    const result = await pool.query(
      `SELECT * 
       FROM donor_counseling 
       WHERE centre_id = $1 
       ORDER BY counseling_date DESC`,
      [centreId] 
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "No counseling records found for this centre" });
    }

    return res.status(200).json({ counseling: result.rows });
  } catch (err) {
    console.error("Error in getCounselingByCentre:", err);
    return res.status(500).json({ msg: "Error fetching counseling records", error: err.message });
  }
};