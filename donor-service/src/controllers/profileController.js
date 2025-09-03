// src/controllers/profileController.js
const { pool } = require("../db/pool");

// GET /profile
// exports.getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // from JWT middleware
//     const result = await pool.query(
//       `SELECT id, email, first_name, last_name, phone, address, city, state, pincode, blood_group_id, district_id, gender 
//        FROM users WHERE id=$1`,
//       [userId]
//     );

//     if (!result.rows.length) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


//option-2
exports.getProfile = async (req, res) => {
  try {
    // Extract correct field
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user in token" });
    }

    const result = await pool.query(
      "SELECT id, name, email, is_verified FROM users WHERE id=$1",
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("👉 Profile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// PATCH /profile
// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       first_name,
//       last_name,
//       phone,
//       street,
//       city,
//       state,
//       pincode,
//       blood_group_id,
//       district_id,
//       gender,
//     } = req.body;

//     const result = await pool.query(
//       `UPDATE users
//        SET name=$1, phone=$2, street=$3, city=$4, state=$5, pincode=$6,
//            blood_group_id=$7, district_id=$8, gender=$9
//        WHERE id=$10
//        RETURNING id`,
//       [
//         `${first_name} ${last_name}`,
//         phone,
//         street,
//         city,
//         state,
//         pincode,
//         blood_group_id,
//         district_id,
//         gender,
//         userId,
//       ]
//     );

//     if (!result.rows.length) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "Profile updated successfully" });
//   } catch (err) {
//     console.error("Update profile error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user in token" });
    }

    const { name } = req.body;

    const result = await pool.query(
      "UPDATE users SET name=$1 WHERE id=$2 RETURNING id, name, email, is_verified",
      [name, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("👉 Update profile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }

  // try {
  //   const userId = req.user.id;
  //   const updates = req.body; // 👈 may contain only partial fields

  //   // Build dynamic SQL
  //   const fields = Object.keys(updates);
  //   const values = Object.values(updates);

  //   if (fields.length === 0) {
  //     return res.status(400).json({ message: "No fields to update" });
  //   }

  //   const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  //   const query = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1}`;

  //   await pool.query(query, [...values, userId]);

  //   res.json({ message: "Profile updated successfully" });
  // } catch (err) {
  //   console.error("Update profile error:", err);
  //   res.status(500).json({ message: "Server error" });
  // }
};

