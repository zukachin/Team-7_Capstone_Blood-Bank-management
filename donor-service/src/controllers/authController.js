const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { pool } = require("../db/pool");
const { generateOtp } = require("../utils/generateotp");
const { sendOtpEmail } = require("../utils/email");

exports.register = async (req, res) => {
  const { name, email, phone, street, city, state, pincode, password } = req.body;

  try {
    const userCheck = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (userCheck.rows.length) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const inserted = await pool.query(
      `INSERT INTO users(name,email,phone,street,city,state,pincode,password_hash,is_verified)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,false)
       RETURNING id`,
      [name, email, phone, street, city, state, pincode, password_hash]
    );

    const userId = inserted.rows[0].id;
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `INSERT INTO email_otp(user_id, otp_code, expires_at, is_used)
       VALUES($1,$2,$3,false)`,
      [userId, otp, expiresAt]
    );

    await sendOtpEmail(email, otp);
    res.json({ message: "OTP sent to email", userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM email_otp WHERE user_id=$1 AND otp_code=$2 AND is_used=false`,
      [userId, otp]
    );

    if (!result.rows.length) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const otpRecord = result.rows[0];
    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await pool.query(`UPDATE users SET is_verified=true WHERE id=$1`, [userId]);
    await pool.query(`UPDATE email_otp SET is_used=true WHERE id=$1`, [otpRecord.id]);

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRes = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    if (!userRes.rows.length) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userRes.rows[0];
    if (!user.is_verified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({
      message: "Login successful",
      token, // send token to frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.resendOtp = async (req, res) => {
  const { userId } = req.body;

  try {
    const userRes = await pool.query(
      "SELECT email, is_verified FROM users WHERE id=$1",
      [userId]
    );

    if (!userRes.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userRes.rows[0].is_verified) {
      return res
        .status(400)
        .json({ message: "User already verified. Please login." });
    }

    const email = userRes.rows[0].email;

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    
    await pool.query(
      `INSERT INTO email_otp (user_id, otp_code, expires_at, is_used)
       VALUES ($1,$2,$3,false)`,
      [userId, otp, expiresAt]
    );

  
    await sendOtpEmail(email, otp);

    res.json({ message: "OTP resent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (!userRes.rows.length) return res.status(404).json({ message: "User not found" });

    const userId = userRes.rows[0].id;
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `INSERT INTO email_otp (user_id, otp_code, expires_at, is_used, otp_type)
       VALUES ($1, $2, $3, false, 'password_reset')`,
      [userId, otp, expiresAt]
    );

    await sendOtpEmail(email, otp);

    res.json({ message: "Password reset OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // 1️⃣ Validate input
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  try {
    //console.log("Reset request body:", req.body); // helpful for debugging

    // 2️⃣ Find user by email
    const userRes = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (!userRes.rows.length) return res.status(404).json({ message: "User not found" });

    const userId = userRes.rows[0].id;

    // 3️⃣ Verify OTP
    const otpRes = await pool.query(
      `SELECT * FROM email_otp 
       WHERE user_id=$1 AND otp_code=$2 AND is_used=false AND otp_type='password_reset'`,
      [userId, otp]
    );

    if (!otpRes.rows.length) return res.status(400).json({ message: "Invalid OTP" });

    const otpRecord = otpRes.rows[0];
    if (new Date(otpRecord.expires_at) < new Date())
      return res.status(400).json({ message: "OTP expired" });

    // 4️⃣ Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password_hash=$1 WHERE id=$2`, [hashedPassword, userId]);

    // 5️⃣ Mark OTP as used
    await pool.query(`UPDATE email_otp SET is_used=true WHERE id=$1`, [otpRecord.id]);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};
