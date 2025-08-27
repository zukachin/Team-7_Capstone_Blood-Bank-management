const express = require("express");
const { pool } = require("../db/pool"); // PostgreSQL connection

const router = express.Router();

/**
 * GET /api/camps
 * Query params: state, district, date
 */
router.get("/camps", async (req, res) => {
  try {
    const { state, district, date } = req.query;

    let query = "SELECT * FROM donation_camps WHERE 1=1";
    const values = [];

    if (state) {
      values.push(state);
      query += ` AND state = $${values.length}`;
    }

    if (district) {
      values.push(district);
      query += ` AND district = $${values.length}`;
    }

    if (date) {
      values.push(date);
      query += ` AND camp_date = $${values.length}`;
    }

    query += " ORDER BY camp_date ASC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching camps:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
