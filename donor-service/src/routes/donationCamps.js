const express = require("express");
const { pool } = require("../db/pool"); // PostgreSQL connection

const router = express.Router();

/**
 * ✅ Get all states from the `states` table
 */
router.get("/states", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT state_id, state_name FROM states ORDER BY state_name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching states:", err);
    res.status(500).json({ message: "Failed to fetch states" });
  }
});

/**
 * ✅ Get all districts for a given state_id from `districts` table
 */
router.get("/districts", async (req, res) => {
  try {
    const { state_id } = req.query;

    if (!state_id) {
      return res.json([]); // No state selected → return empty list
    }

    const result = await pool.query(
      "SELECT district_id, district_name FROM districts WHERE state_id = $1 ORDER BY district_name ASC",
      [state_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching districts:", err);
    res.status(500).json({ message: "Failed to fetch districts" });
  }
});

/**
 * ✅ Get donation camps filtered by state, district, and date
 */
router.get("/camps", async (req, res) => {
  try {
    const { state_id, district_id, date } = req.query;

    let query = `
      SELECT dc.*, s.state_name, d.district_name
      FROM donation_camps dc
      LEFT JOIN states s ON dc.state_id = s.state_id
      LEFT JOIN districts d ON dc.district_id = d.district_id
      WHERE 1=1
    `;
    const values = [];

    if (state_id) {
      values.push(state_id);
      query += ` AND dc.state_id = $${values.length}`;
    }

    if (district_id) {
      values.push(district_id);
      query += ` AND dc.district_id = $${values.length}`;
    }

    if (date) {
      values.push(date);
      query += ` AND dc.camp_date = $${values.length}`;
    }

    query += " ORDER BY dc.camp_date ASC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching camps:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
