const pool = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const MASTER_KEY = process.env.MASTER_KEY || '';

/**
 * Register initial SuperAdmin (one-time) - protected by MASTER_KEY
 * Body: { admin_name, email, password, master_key }
 */
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { admin_name, email, password, master_key } = req.body;
    if (!admin_name || !password || !master_key) {
      return res.status(400).json({ message: 'admin_name, password and master_key required' });
    }
    if (master_key !== MASTER_KEY) {
      return res.status(403).json({ message: 'Invalid master key' });
    }

    // check existing superadmin
    const check = await pool.query(
      `SELECT a.admin_id FROM admins a JOIN roles r ON a.role_id = r.role_id WHERE r.role_name = 'SuperAdmin' LIMIT 10`
    );
    if (check.rowCount) {
      return res.status(409).json({ message: 'SuperAdmin already exists' });
    }

    const roleRes = await pool.query(`SELECT role_id FROM roles WHERE role_name = 'SuperAdmin' LIMIT 10`);
    const role_id = roleRes.rowCount ? roleRes.rows[0].role_id : null;

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const insert = await pool.query(
      `INSERT INTO admins (admin_name, email, password_hash, role_id) VALUES ($1,$2,$3,$4) RETURNING admin_id, admin_name, email, role_id, created_at`,
      [admin_name, email || null, password_hash, role_id]
    );

    return res.status(201).json({ superadmin: insert.rows[0] });
  } catch (err) {
    console.error('registerSuperAdmin error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * POST /auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const sql = `
      SELECT a.admin_id, a.password_hash, a.centre_id, r.role_name
      FROM admins a
      LEFT JOIN roles r ON a.role_id = r.role_id
      WHERE lower(a.email) = lower($1) LIMIT 1
    `;
    const result = await pool.query(sql, [email]);
    if (!result.rowCount) return res.status(401).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // create token
    const payload = { id: user.admin_id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // update last_login
    await pool.query(`UPDATE admins SET last_login = now() WHERE admin_id = $1`, [user.admin_id]);

    // return token and small user meta
    return res.json({
      token,
      user: {
        id: user.admin_id,
        role: user.role_name || null,
        centreId: user.centre_id
      }
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
