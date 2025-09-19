const pool = require('../db/db');

/**
 * POST /centres
 * Body: { centre_name, district_id, address } - SuperAdmin only
 */
exports.createCentre = async (req, res) => {
  try {
    let { centre_name, district_id = null, address = null } = req.body;
    if (!centre_name || typeof centre_name !== 'string') {
      return res.status(400).json({ message: 'centre_name is required' });
    }

    centre_name = centre_name.trim();
    if (centre_name.length === 0 || centre_name.length > 255) {
      return res.status(400).json({ message: 'centre_name must be between 1 and 255 characters' });
    }

    // Prevent duplicate centre names (case-insensitive)
    const exists = await pool.query(
      `SELECT centre_id FROM centres WHERE lower(centre_name) = lower($1) LIMIT 1`,
      [centre_name]
    );
    if (exists.rowCount) {
      return res.status(409).json({ message: 'Centre with this name already exists' });
    }

    const sql = `
      INSERT INTO centres (centre_name, district_id, address)
      VALUES ($1, $2, $3)
      RETURNING centre_id, centre_code, centre_name, district_id, address, created_at
    `;
    const result = await pool.query(sql, [centre_name, district_id, address]);
    return res.status(201).json({ centre: result.rows[0] });
  } catch (err) {
    console.error('createCentre error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /centres
 * - SuperAdmin: all centres
 * - Admin: only their assigned centre
 */
exports.getAllCentres = async (req, res) => {
  try {
    const user = req.user || {};
    const role = user.role || null;
    const userCentreId = user.centreId ?? null;

    // Non-superadmins must have a centre assigned
    if (role && role !== 'SuperAdmin' && !userCentreId) {
      return res.status(403).json({ message: 'Your account is not assigned to a centre' });
    }

    let sql = `SELECT centre_id, centre_code, centre_name, district_id, address, created_at FROM centres`;
    const params = [];

    if (role !== 'SuperAdmin') {
      sql += ` WHERE centre_id = $1`;
      params.push(userCentreId);
    }

    sql += ` ORDER BY centre_name`;
    const result = await pool.query(sql, params);
    return res.status(200).json({ centres: result.rows });
  } catch (err) {
    console.error('getAllCentres error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /centres/:id
 * - SuperAdmin: any centre
 * - Admin: only if the centre_id matches their assigned centre
 */
exports.getCentreById = async (req, res) => {
  try {
    const centre_id = parseInt(req.params.id, 10);
    if (Number.isNaN(centre_id) || centre_id <= 0) {
      return res.status(400).json({ message: 'Invalid centre id' });
    }

    const result = await pool.query(
      `SELECT centre_id, centre_code, centre_name, district_id, address, created_at FROM centres WHERE centre_id = $1`,
      [centre_id]
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Centre not found' });

    const centre = result.rows[0];

    // enforce location-bound access for non-superadmins
    const user = req.user || {};
    if (user.role && user.role !== 'SuperAdmin') {
      const userCentreId = user.centreId ?? null;
      if (!userCentreId) {
        return res.status(403).json({ message: 'Your account is not assigned to a centre' });
      }
      if (centre.centre_id !== Number(userCentreId)) {
        return res.status(403).json({ message: 'Access denied to this centre' });
      }
    }

    return res.status(200).json({ centre });
  } catch (err) {
    console.error('getCentreById error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUBLIC: GET /api/centres/public?district_id=123
exports.getCentresByDistrictPublic = async (req, res) => {
  try {
    const districtId = Number(req.query.district_id);
    if (!districtId) {
      return res.status(400).json({ message: 'district_id query param required' });
    }

    const q = `
      SELECT centre_id, centre_code, centre_name, district_id, address
      FROM centres
      WHERE district_id = $1
      ORDER BY centre_name
    `;
    const r = await pool.query(q, [districtId]);
    return res.json({ centres: r.rows });
  } catch (err) {
    console.error('getCentresByDistrictPublic error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
