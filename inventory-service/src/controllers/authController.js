const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/db"); // PostgreSQL connection

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get admin + role info
    const result = await pool.query(
      `SELECT 
         a.admin_id, 
         a.admin_name, 
         a.password_hash, 
         a.centre_id, 
         r.role_name
       FROM admins a
       JOIN roles r ON a.role_id = r.role_id
       WHERE a.admin_name = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const admin = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create JWT payload
    const payload = {
      adminId: admin.admin_id,
      role: admin.role_name,
      centreId: admin.centre_id || null, // super_admin may have null
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({
      message: "Login successful",
      token,
      role: admin.role_name,
      centreId: admin.centre_id || null,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
