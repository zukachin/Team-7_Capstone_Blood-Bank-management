// src/controllers/profileController.js
const pool = require("../db/pool");

/**
 * GET /profile
 * Returns user info joined with blood group name (if any)
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user in token" });
    }

    const q = `SELECT u.id, u.name, u.email, u.phone, u.address, u.age, u.gender, u.is_verified, bg.id AS blood_group_id, bg.group_name AS blood_group, u.state_id, s.state_name AS state_name, u.district_id, d.district_name AS district_name, u.created_at, u.updated_at FROM users u LEFT JOIN blood_groups bg ON u.blood_group_id = bg.id LEFT JOIN states s ON u.state_id = s.state_id LEFT JOIN districts d ON u.district_id = d.district_id WHERE u.id = $1 LIMIT 1`;

    const result = await pool.query(q, [userId]);

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("👉 Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /profile
 * Accepts partial updates. Only allows an explicit set of fields.
 * Builds a dynamic SET clause safely using parameterized queries.
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized: No user in token" });

    // Whitelist of fields that can be updated via profile page
    const allowedFields = [
      "name",
      "email",
      "phone",
      "address",
      "age",
      "gender",
      "blood_group_id" // expects integer id referencing blood_groups
    ];

    // Filter incoming body by allowed fields only
    const updates = Object.keys(req.body || {}).filter((k) => allowedFields.includes(k));

    if (!updates.length) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }

    // If email change requested -> ensure uniqueness
    if (req.body.email) {
      const exists = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1",
        [req.body.email, userId]
      );
      if (exists.rows.length) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    // If blood_group_id provided -> ensure it exists
    if (req.body.blood_group_id !== undefined && req.body.blood_group_id !== null) {
      const bgId = parseInt(req.body.blood_group_id, 10);
      if (Number.isNaN(bgId)) {
        return res.status(400).json({ message: "blood_group_id must be an integer" });
      }
      const bgRes = await pool.query("SELECT id FROM blood_groups WHERE id = $1 LIMIT 1", [bgId]);
      if (!bgRes.rows.length) {
        return res.status(400).json({ message: "Invalid blood_group_id" });
      }
    }

    // Build SET clause and values array
    const setClauses = [];
    const values = [];
    let idx = 1;
    for (const field of updates) {
      setClauses.push(`${field} = $${idx}`);
      values.push(req.body[field]);
      idx++;
    }

    // Add updated_at
    setClauses.push(`updated_at = NOW()`);

    const query = `
      UPDATE users
      SET ${setClauses.join(", ")}
      WHERE id = $${idx}
      RETURNING id, name, email, phone, address, age, gender, is_verified, blood_group_id, created_at, updated_at
    `;
    values.push(userId);

    const updateRes = await pool.query(query, values);

    if (!updateRes.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return full profile with blood group name
    const respQ = `
      SELECT u.id, u.name, u.email, u.phone, u.address, u.age, u.gender, u.is_verified,
             bg.id as blood_group_id, bg.group_name as blood_group,
             u.created_at, u.updated_at
      FROM users u
      LEFT JOIN blood_groups bg ON u.blood_group_id = bg.id
      WHERE u.id = $1
      LIMIT 1
    `;
    const finalRes = await pool.query(respQ, [userId]);

    res.json(finalRes.rows[0]);
  } catch (err) {
    console.error("👉 Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
