// src/controllers/bloodGroupController.js
const  pool  = require("../db/db");

exports.listBloodGroups = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, group_name FROM blood_groups ORDER BY group_name");
    res.json(result.rows);
  } catch (err) {
    console.error("listBloodGroups error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
