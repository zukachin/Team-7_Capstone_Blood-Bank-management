// const pool = require('../db/db');
// const bcrypt = require('bcryptjs');

// /**
//  * POST /admins
//  * - Create an Admin and assign centre
//  * - SuperAdmin only
//  * Body: { admin_name, email, password, centre_id }
//  */
// exports.createAdmin = async (req, res) => {
//   try {
//     const { admin_name, email = null, password, centre_id = null } = req.body;
//     if (!admin_name || !password) return res.status(400).json({ message: 'admin_name and password are required' });

//     // check existing by email or admin_name
//     const existsQuery = `SELECT admin_id FROM admins WHERE admin_name = $1 OR (email IS NOT NULL AND lower(email) = lower($2)) LIMIT 1`;
//     const existsRes = await pool.query(existsQuery, [admin_name, email]);
//     if (existsRes.rowCount) return res.status(409).json({ message: 'Admin with that name/email already exists' });

//     // lookup role_id for 'Admin'
//     const roleRes = await pool.query(`SELECT role_id FROM roles WHERE role_name = 'Admin' LIMIT 1`);
//     const role_id = roleRes.rowCount ? roleRes.rows[0].role_id : 2;

//     const salt = await bcrypt.genSalt(10);
//     const password_hash = await bcrypt.hash(password, salt);

//     const insertSql = `
//       INSERT INTO admins (admin_name, email, password_hash, role_id, centre_id)
//       VALUES ($1, $2, $3, $4, $5)
//       RETURNING admin_id, admin_name, email, role_id, centre_id, created_at
//     `;
//     const result = await pool.query(insertSql, [admin_name, email, password_hash, role_id, centre_id]);
//     return res.status(201).json({ admin: result.rows[0] });
//   } catch (err) {
//     console.error('createAdmin error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// /**
//  * GET /admins
//  * - SuperAdmin: all admins
//  * - Admin: own record
//  */
// exports.getAdmins = async (req, res) => {
//   try {
//     const { role, centreId, id: requesterId } = req.user;

//     if (role === 'SuperAdmin') {
//       const sql = `
//         SELECT a.admin_id, a.admin_name, a.email, a.centre_id, a.created_at, r.role_name
//         FROM admins a
//         JOIN roles r ON a.role_id = r.role_id
//         ORDER BY a.created_at DESC
//       `;
//       const result = await pool.query(sql);
//       return res.status(200).json({ admins: result.rows });
//     } else {
//       // Regular Admin: return own record
//       const sql = `
//         SELECT a.admin_id, a.admin_name, a.email, a.centre_id, a.created_at, r.role_name
//         FROM admins a
//         JOIN roles r ON a.role_id = r.role_id
//         WHERE a.admin_id = $1
//       `;
//       const result = await pool.query(sql, [requesterId]);
//       return res.status(200).json({ admins: result.rows });
//     }
//   } catch (err) {
//     console.error('getAdmins error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// /**
//  * GET /admins/:id
//  */
// exports.getAdminById = async (req, res) => {
//   try {
//     const admin_id = parseInt(req.params.id, 10);
//     if (Number.isNaN(admin_id)) return res.status(400).json({ message: 'Invalid admin id' });

//     const result = await pool.query(
//       `SELECT admin_id, admin_name, email, centre_id, role_id, created_at, last_login FROM admins WHERE admin_id = $1`,
//       [admin_id]
//     );
//     if (!result.rowCount) return res.status(404).json({ message: 'Admin not found' });
//     return res.status(200).json({ admin: result.rows[0] });
//   } catch (err) {
//     console.error('getAdminById error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// /**
//  * PATCH /admins/:id
//  * - SuperAdmin: may update centre_id, email, admin_name, password
//  * - Admin: may update own password/email/admin_name but not centre_id
//  */
// exports.updateAdmin = async (req, res) => {
//   try {
//     const admin_id = parseInt(req.params.id, 10);
//     if (Number.isNaN(admin_id)) return res.status(400).json({ message: 'Invalid admin id' });

//     const { role, id: requesterId } = req.user;
//     const { admin_name, email, password, centre_id } = req.body;

//     // fetch existing
//     const existing = await pool.query(`SELECT * FROM admins WHERE admin_id = $1`, [admin_id]);
//     if (!existing.rowCount) return res.status(404).json({ message: 'Admin not found' });

//     // permission checks
//     if (role !== 'SuperAdmin' && requesterId !== admin_id) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     const updates = [];
//     const params = [];
//     let idx = 1;

//     if (admin_name !== undefined) { updates.push(`admin_name = $${idx++}`); params.push(admin_name); }
//     if (email !== undefined) { updates.push(`email = $${idx++}`); params.push(email); }
//     if (password !== undefined) {
//       const salt = await bcrypt.genSalt(10);
//       const password_hash = await bcrypt.hash(password, salt);
//       updates.push(`password_hash = $${idx++}`);
//       params.push(password_hash);
//     }
//     if (centre_id !== undefined) {
//       if (role !== 'SuperAdmin') {
//         return res.status(403).json({ message: 'Only SuperAdmin can change centre assignment' });
//       }
//       updates.push(`centre_id = $${idx++}`); params.push(centre_id);
//     }

//     if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

//     const sql = `
//       UPDATE admins
//       SET ${updates.join(', ')}
//       WHERE admin_id = $${idx}
//       RETURNING admin_id, admin_name, email, centre_id, role_id, created_at, last_login
//     `;
//     params.push(admin_id);
//     const result = await pool.query(sql, params);
//     return res.status(200).json({ admin: result.rows[0] });
//   } catch (err) {
//     console.error('updateAdmin error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


const pool = require('../db/db');
const bcrypt = require('bcryptjs');

// -----------------------------
// CREATE ADMIN
// -----------------------------
exports.createAdmin = async (req, res) => {
  try {
    const { admin_name, email = null, password, centre_id = null } = req.body;
    if (!admin_name || !password) return res.status(400).json({ message: 'admin_name and password are required' });

    const existsQuery = `
      SELECT admin_id FROM admins 
      WHERE admin_name = $1 OR (email IS NOT NULL AND lower(email) = lower($2)) 
      LIMIT 1
    `;
    const existsRes = await pool.query(existsQuery, [admin_name, email]);
    if (existsRes.rowCount) return res.status(409).json({ message: 'Admin already exists' });

    const roleRes = await pool.query(`SELECT role_id FROM roles WHERE role_name = 'Admin' LIMIT 1`);
    const role_id = roleRes.rowCount ? roleRes.rows[0].role_id : 2;

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const insertSql = `
      INSERT INTO admins (admin_name, email, password_hash, role_id, centre_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING admin_id, admin_name, email, role_id, centre_id, created_at
    `;
    const result = await pool.query(insertSql, [admin_name, email, password_hash, role_id, centre_id]);
    return res.status(201).json({ admin: result.rows[0] });
  } catch (err) {
    console.error('createAdmin error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// -----------------------------
// GET ADMINS
// -----------------------------
exports.getAdmins = async (req, res) => {
  try {
    const { role, centreId, id: requesterId } = req.user;

    if (role === 'SuperAdmin') {
      const sql = `
        SELECT a.admin_id, a.admin_name, a.email, a.centre_id, a.created_at, r.role_name
        FROM admins a
        JOIN roles r ON a.role_id = r.role_id
        ORDER BY a.created_at DESC
      `;
      const result = await pool.query(sql);
      return res.status(200).json({ admins: result.rows });
    } else {
      const sql = `
        SELECT a.admin_id, a.admin_name, a.email, a.centre_id, a.created_at, r.role_name
        FROM admins a
        JOIN roles r ON a.role_id = r.role_id
        WHERE a.admin_id = $1
      `;
      const result = await pool.query(sql, [requesterId]);
      return res.status(200).json({ admins: result.rows });
    }
  } catch (err) {
    console.error('getAdmins error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// -----------------------------
// GET SINGLE ADMIN BY ID
// -----------------------------
exports.getAdminById = async (req, res) => {
  try {
    const admin_id = parseInt(req.params.id, 10);
    if (Number.isNaN(admin_id)) return res.status(400).json({ message: 'Invalid admin id' });

    const result = await pool.query(
      `SELECT admin_id, admin_name, email, centre_id, role_id, created_at, last_login FROM admins WHERE admin_id = $1`,
      [admin_id]
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Admin not found' });
    return res.status(200).json({ admin: result.rows[0] });
  } catch (err) {
    console.error('getAdminById error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// -----------------------------
// UPDATE ADMIN
// -----------------------------
exports.updateAdmin = async (req, res) => {
  try {
    const admin_id = parseInt(req.params.id, 10);
    if (Number.isNaN(admin_id)) return res.status(400).json({ message: 'Invalid admin id' });

    const { role, id: requesterId } = req.user;
    const { admin_name, email, password, centre_id } = req.body;

    const existing = await pool.query(`SELECT * FROM admins WHERE admin_id = $1`, [admin_id]);
    if (!existing.rowCount) return res.status(404).json({ message: 'Admin not found' });

    if (role !== 'SuperAdmin' && requesterId !== admin_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = [];
    const params = [];
    let idx = 1;

    if (admin_name !== undefined) { updates.push(`admin_name = $${idx++}`); params.push(admin_name); }
    if (email !== undefined) { updates.push(`email = $${idx++}`); params.push(email); }
    if (password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      updates.push(`password_hash = $${idx++}`); params.push(password_hash);
    }
    if (centre_id !== undefined) {
      if (role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Only SuperAdmin can change centre assignment' });
      }
      updates.push(`centre_id = $${idx++}`); params.push(centre_id);
    }

    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

    const sql = `
      UPDATE admins
      SET ${updates.join(', ')}
      WHERE admin_id = $${idx}
      RETURNING admin_id, admin_name, email, centre_id, role_id, created_at, last_login
    `;
    params.push(admin_id);
    const result = await pool.query(sql, params);
    return res.status(200).json({ admin: result.rows[0] });
  } catch (err) {
    console.error('updateAdmin error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// -----------------------------
// GET DONOR REGISTRATION NOTIFICATIONS
// -----------------------------
exports.getDonorNotifications = async (req, res) => {
  try {
    const { state_id, district_id } = req.query;
    const sql = `
      SELECT d.donor_id, d.name, d.email, d.phone, d.blood_group, d.address, d.state_id, d.district_id, d.created_at
      FROM donors d
      WHERE d.status = 'pending'
        AND ($1::int IS NULL OR d.state_id = $1)
        AND ($2::int IS NULL OR d.district_id = $2)
      ORDER BY d.created_at DESC
    `;
    const result = await pool.query(sql, [
      state_id ? parseInt(state_id) : null,
      district_id ? parseInt(district_id) : null,
    ]);
    return res.status(200).json({ donors: result.rows });
  } catch (err) {
    console.error('getDonorNotifications error:', err);
    return res.status(500).json({ message: 'Failed to fetch donor notifications' });
  }
};

// -----------------------------
// ACCEPT DONOR REGISTRATION
// -----------------------------
exports.acceptDonorNotification = async (req, res) => {
  try {
    const donorId = parseInt(req.params.donorId, 10);
    if (Number.isNaN(donorId)) return res.status(400).json({ message: 'Invalid donor ID' });

    const sql = `
      UPDATE donors SET status = 'approved'
      WHERE donor_id = $1 RETURNING donor_id, name, email, phone, status
    `;
    const result = await pool.query(sql, [donorId]);
    if (!result.rowCount) return res.status(404).json({ message: 'Donor not found or already approved' });

    return res.status(200).json({ message: 'Donor approved successfully', donor: result.rows[0] });
  } catch (err) {
    console.error('acceptDonorNotification error:', err);
    return res.status(500).json({ message: 'Failed to approve donor' });
  }
};
