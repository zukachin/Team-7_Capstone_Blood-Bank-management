// controllers/authController.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool'); // adjust path if needed
const generateOtp = require('../utils/generateotp');
const { sendOtpEmail, sendCampRegistrationEmail, sendCampApprovalEmail } = require('../utils/email');

const SALT_ROUNDS = 10;
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES) || 10; // configurable via env
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret"; // fallback for dev
const JWT_EXP = process.env.JWT_EXP || "7d"; // default 7 days
async function createAndSendOtpForUser(userId, email) {
  const otp = generateOtp(6);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  // insert otp record
  await pool.query(
    `INSERT INTO email_otp (user_id, otp_code, expires_at) VALUES ($1, $2, $3)`,
    [userId, otp, expiresAt]
  );

  // send email (best-effort)
  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.warn('sendOtpEmail failed', err);
    // we still keep the otp in DB; client can ask to resend
  }

  return { otp, expiresAt };
}

// controllers/authController.js (excerpt - updated register)

// ... other imports
// Replace the existing `register` function with this
async function register (req, res) {
  try {
    const {
      name, email, password, phone,
      gender, state_id, district_id, address,
      age, blood_group_id // blood_group expected as integer id
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    // Defensive checks (validators already run but keep server-side safe)
    const ageInt = Number(age);
    if (!Number.isInteger(ageInt) || ageInt < 18) {
      return res.status(400).json({ message: 'Age must be integer >= 18' });
    }

    // verify blood_group id exists (defensive)
    const bgRes = await pool.query(
      'SELECT id FROM blood_groups WHERE id = $1 LIMIT 1',
      [Number(blood_group_id)]
    );
    if (!bgRes.rowCount) {
      return res.status(400).json({ message: 'Invalid blood_group id' });
    }

    const emailNorm = String(email).toLowerCase().trim();

    // check existing user
    const existing = await pool.query('SELECT id, is_verified FROM users WHERE email = $1 LIMIT 1', [emailNorm]);
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    if (existing.rowCount) {
      const user = existing.rows[0];
      if (user.is_verified) {
        return res.status(409).json({ message: 'Email already registered. Please login.' });
      }
      // update unverified user
      await pool.query(
        `UPDATE users
         SET name=$1, password=$2, phone=$3, gender=$4, state_id=$5, district_id=$6, address=$7, age=$8, blood_group_id=$9, updated_at=now()
         WHERE id=$10`,
        [
          name.trim(),
          hashed,
          phone || null,
          gender || null,
          state_id || null,
          district_id || null,
          address || null,
          ageInt,
          Number(blood_group_id),
          user.id
        ]
      );

      await createAndSendOtpForUser(user.id, emailNorm);
      return res.status(200).json({ message: 'Account exists but not verified. OTP sent.', email: emailNorm });
    }

    // insert new user with FK ids (note: pass blood_group_id param)
    const insertQ = `
      INSERT INTO users (name, email, password, phone, gender, state_id, district_id, address, age, blood_group_id, is_verified)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,false)
      RETURNING id, name, email
    `;
    const result = await pool.query(insertQ, [
      name.trim(),
      emailNorm,
      hashed,
      phone || null,
      gender || null,
      state_id || null,
      district_id || null,
      address || null,
      ageInt,
      Number(blood_group_id)
    ]);
    const newUser = result.rows[0];

    await createAndSendOtpForUser(newUser.id, emailNorm);

    return res.status(201).json({ message: 'Registered. OTP sent to email. Verify to activate account.', user: newUser });

  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body || {};
    const emailNorm = email.toLowerCase().trim();

    // find user
    const qr = await pool.query('SELECT id, is_verified FROM users WHERE email = $1', [emailNorm]);
    if (!qr.rows.length) return res.status(400).json({ message: 'Invalid email or OTP' });

    const user = qr.rows[0];
    if (user.is_verified) return res.status(400).json({ message: 'User already verified' });

    // find an unused matching OTP not expired (prefer latest)
    const now = new Date();
    const otpRowQ = `
      SELECT id, otp_code, expires_at, is_used
      FROM email_otp
      WHERE user_id = $1 AND otp_code = $2 AND is_used = false AND expires_at >= $3
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const otpRowR = await pool.query(otpRowQ, [user.id, otp, now]);
    if (!otpRowR.rows.length) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const otpRow = otpRowR.rows[0];

    // mark otp used and set user verified
    await pool.query('BEGIN');
    await pool.query('UPDATE email_otp SET is_used = true WHERE id = $1', [otpRow.id]);
    await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [user.id]);
    await pool.query('COMMIT');

    // issue JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({ message: 'Verified successfully', token });
  } catch (err) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('verifyOtp error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function resendOtp(req, res) {
  try {
    const { email } = req.body || {};
    const emailNorm = email.toLowerCase().trim();

    // find user
    const qr = await pool.query('SELECT id, is_verified FROM users WHERE email = $1', [emailNorm]);
    if (!qr.rows.length) return res.status(400).json({ message: 'Email not registered' });

    const user = qr.rows[0];
    if (user.is_verified) return res.status(400).json({ message: 'User already verified' });

    // throttle: check last created otp for this user
    const lastOtpQ = `SELECT created_at FROM email_otp WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`;
    const lastOtpR = await pool.query(lastOtpQ, [user.id]);
    if (lastOtpR.rows.length) {
      const lastCreated = new Date(lastOtpR.rows[0].created_at);
      const now = new Date();
      const diffMs = now - lastCreated;
      if (diffMs < 2 * 60 * 1000) { // 2 minutes
        return res.status(429).json({ message: 'OTP was recently sent. Please wait before resending.' });
      }
    }

    await createAndSendOtpForUser(user.id, emailNorm);
    return res.json({ message: 'OTP resent' });
  } catch (err) {
    console.error('resendOtp error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const emailNorm = email.toLowerCase().trim();

    const r = await pool.query(
      'SELECT id, name, email, password, is_verified FROM users WHERE email = $1',
      [emailNorm]
    );

    if (!r.rows.length) return res.status(400).json({ message: 'Invalid email or password' });

    const user = r.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });

    if (!user.is_verified)
      return res.status(401).json({ message: 'Account not verified. Please verify using OTP.' });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXP }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


// Forgot Password
async function forgotPassword(req, res){
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (!userRes.rows.length) return res.status(404).json({ message: "User not found" });

    const userId = userRes.rows[0].id;
    const otp = generateOtp(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await pool.query(
      `INSERT INTO email_otp (user_id, otp_code, expires_at, is_used, otp_type)
       VALUES ($1, $2, $3, false, 'password_reset')`,
      [userId, otp, expiresAt]
    );

    await sendOtpEmail(email, otp);
    res.json({ message: "Password reset OTP sent to email" });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password
async function resetPassword (req, res)  {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (!userRes.rows.length) return res.status(404).json({ message: "User not found" });

    const userId = userRes.rows[0].id;

    const otpRes = await pool.query(
      `SELECT * FROM email_otp 
       WHERE user_id=$1 AND otp_code=$2 AND is_used=false AND otp_type='password_reset'
       ORDER BY created_at DESC LIMIT 1`,
      [userId, otp]
    );
    if (!otpRes.rows.length) return res.status(400).json({ message: "Invalid OTP" });

    const otpRecord = otpRes.rows[0];
    if (new Date(otpRecord.expires_at) < new Date())
      return res.status(400).json({ message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hashedPassword, userId]);
    await pool.query("UPDATE email_otp SET is_used=true WHERE id=$1", [otpRecord.id]);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send camp registration confirmation email to user
async function campRegisterEmail(req, res) {
  try {
    const { userId, campId } = req.body;
    if (!userId || !campId) {
      return res.status(400).json({ message: "userId and campId are required" });
    }

    // fetch user email and camp details
    const userRes = await pool.query("SELECT email, name FROM users WHERE id=$1", [userId]);
    if (!userRes.rows.length) return res.status(404).json({ message: "User not found" });
    const user = userRes.rows[0];

    const campRes = await pool.query("SELECT name, date FROM camps WHERE id=$1", [campId]);
    if (!campRes.rows.length) return res.status(404).json({ message: "Camp not found" });
    const camp = campRes.rows[0];

    // send email
    await sendCampRegistrationEmail(user.email, user.name, camp.name, camp.date);

    return res.json({ message: "Camp registration email sent" });
  } catch (err) {
    console.error("campRegisterEmail error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Send camp approval email to user
async function campApprovalEmail(req, res) {
  try {
    const { userId, campId } = req.body;
    if (!userId || !campId) {
      return res.status(400).json({ message: "userId and campId are required" });
    }

    // fetch user email and camp details
    const userRes = await pool.query("SELECT email, name FROM users WHERE id=$1", [userId]);
    if (!userRes.rows.length) return res.status(404).json({ message: "User not found" });
    const user = userRes.rows[0];

    const campRes = await pool.query("SELECT name, date FROM camps WHERE id=$1", [campId]);
    if (!campRes.rows.length) return res.status(404).json({ message: "Camp not found" });
    const camp = campRes.rows[0];

    // send email
    await sendCampApprovalEmail(user.email, user.name, camp.name, camp.date);

    return res.json({ message: "Camp approval email sent" });
  } catch (err) {
    console.error("campApprovalEmail error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}








module.exports = { register, verifyOtp, resendOtp, login , forgotPassword , resetPassword, campRegisterEmail,
  campApprovalEmail,};
