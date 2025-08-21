// src/controllers/profileController.js
const { pool } = require("../db/pool");

// GET /profile
exports.getProfile = async (req, res) => {
  try {
  // Correct way to get logged-in user ID
    const userId = req.user.userId;


    // Get user profile
    const userRes = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.address,
              u.city, u.state, u.pincode, u.gender,
              bg.id AS blood_group_id, bg.group_name AS blood_group,
              d.id AS district_id, d.district_name AS district
       FROM users u
       LEFT JOIN blood_groups bg ON u.blood_group_id = bg.id
       LEFT JOIN districts d ON u.district_id = d.id
       WHERE u.id = $1`,
      [userId]
    );

    if (!userRes.rows.length) return res.status(404).json({ message: "User not found" });

    // Get dropdown options
    const bloodGroupsRes = await pool.query(`SELECT id, group_name FROM blood_groups`);
    const districtsRes = await pool.query(`SELECT id, district_name FROM districts`);

    res.json({
      profile: userRes.rows[0],
      options: {
        bloodGroups: bloodGroupsRes.rows,
        districts: districtsRes.rows,
        genders: ["Male", "Female", "Other"]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const {
    first_name,
    last_name,
    phone,
    address,
    district_id,
    city,
    state,
    pincode,
    blood_group_id,
    gender
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         phone = COALESCE($3, phone),
         address = COALESCE($4, address),
         district_id = COALESCE($5, district_id),
         city = COALESCE($6, city),
         state = COALESCE($7, state),
         pincode = COALESCE($8, pincode),
         blood_group_id = COALESCE($9, blood_group_id),
         gender = COALESCE($10, gender)
       WHERE id = $11
       RETURNING id, first_name, last_name, email, phone, address, city, state, pincode,
                 blood_group_id, district_id, gender`,
      [first_name, last_name, phone, address, district_id, city, state, pincode, blood_group_id, gender, userId]
    );

    if (!result.rows.length) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
