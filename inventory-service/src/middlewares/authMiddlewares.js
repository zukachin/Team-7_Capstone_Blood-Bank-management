// src/middlewares/authMiddlewares.js
const jwt = require('jsonwebtoken');
const pool = require('../db/db');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function extractIdFromDecoded(decoded) {
  if (!decoded) return null;
  if (decoded.id) return decoded.id;
  if (decoded.admin_id) return decoded.admin_id;
  if (decoded.user_id) return decoded.user_id;
  if (decoded.sub) return decoded.sub;
  return null;
}

/**
 * authenticate - verifies token and attaches req.user { id, role, centreId }
 */
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }
    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error('[authenticate] jwt.verify failed:', err && err.message ? err.message : err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = extractIdFromDecoded(decoded);
    if (!userId) {
      console.error('[authenticate] token decoded but no id found. decoded payload:', decoded);
      return res.status(401).json({ message: 'Invalid token payload (no id)' });
    }

    // fetch admin row
    const sql = `
      SELECT a.admin_id, a.centre_id, r.role_name
      FROM admins a
      LEFT JOIN roles r ON a.role_id = r.role_id
      WHERE a.admin_id = $1
      LIMIT 1
    `;
    let result;
    try {
      result = await pool.query(sql, [userId]);
    } catch (dbErr) {
      console.error('[authenticate] DB query error:', dbErr && dbErr.message ? dbErr.message : dbErr);
      return res.status(500).json({ message: 'Database error while authenticating' });
    }

    if (!result.rowCount) {
      console.warn('[authenticate] Admin not found for id:', userId);
      return res.status(401).json({ message: 'User not found' });
    }

    const { admin_id, centre_id, role_name } = result.rows[0];
    req.user = {
      id: admin_id,
      role: role_name,
      centreId: centre_id
    };
    return next();
  } catch (err) {
    console.error('[authenticate] unexpected error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * authorize - Accepts array of allowed role strings e.g. ["SuperAdmin"]
 */
exports.authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    if (!allowedRoles.length) return next(); // no restriction
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
