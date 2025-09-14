// src/controllers/organizersController.js
const pool = require('../db/db');

exports.registerOrganizer = async (req, res) => {
  try {
    const user = req.user; // from verifyUserWithDonor
    if (!user || !user.user_id) return res.status(401).json({ message: 'Unauthenticated' });

    const { organization_name, contact_person, phone, email, address } = req.body;

    // Basic validation
    if (!phone || !email) return res.status(400).json({ message: 'phone and email are required' });
    if (!/^[+\d\-\s()]{7,20}$/.test(phone)) return res.status(400).json({ message: 'Invalid phone format' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Invalid email format' });

    // prevent duplicate organizer record for the same user
    const dup = await pool.query('SELECT organizer_id FROM camp_organizers WHERE user_id = $1 LIMIT 1', [user.user_id]);
    if (dup.rowCount) return res.status(409).json({ message: 'You have already applied to be an organizer' });

    const r = await pool.query(
      `INSERT INTO camp_organizers (user_id, organization_name, contact_person, phone, email, address, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6, now(), now()) RETURNING *`,
      [user.user_id, organization_name || null, contact_person || null, phone, email, address || null]
    );

    return res.status(201).json({ organizer: r.rows[0] });
  } catch (err) {
    console.error('registerOrganizer', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.getMyOrganizer = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.user_id) return res.status(401).json({ message: 'Unauthenticated' });

    const q = `SELECT * FROM camp_organizers WHERE user_id = $1 LIMIT 1`;
    const r = await pool.query(q, [user.user_id]);
    if (!r.rowCount) return res.status(404).json({ message: 'Organizer record not found' });

    return res.json({ organizer: r.rows[0] });
  } catch (err) {
    console.error('getMyOrganizer', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.updateMyOrganizer = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.user_id) return res.status(401).json({ message: 'Unauthenticated' });

    const { organization_name, contact_person, phone, email, address } = req.body;

    // simple validation
    if (phone && !/^[+\d\-\s()]{7,20}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone format' });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const fields = [];
    const params = [];
    let idx = 1;
    if (organization_name !== undefined) { fields.push(`organization_name = $${idx++}`); params.push(organization_name); }
    if (contact_person !== undefined)  { fields.push(`contact_person = $${idx++}`); params.push(contact_person); }
    if (phone !== undefined)           { fields.push(`phone = $${idx++}`); params.push(phone); }
    if (email !== undefined)           { fields.push(`email = $${idx++}`); params.push(email); }
    if (address !== undefined)         { fields.push(`address = $${idx++}`); params.push(address); }

    if (!fields.length) return res.status(400).json({ message: 'No fields to update' });

    fields.push(`updated_at = now()`);
    const sql = `UPDATE camp_organizers SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`;
    params.push(user.user_id);

    const r = await pool.query(sql, params);
    if (!r.rowCount) return res.status(404).json({ message: 'Organizer record not found' });

    return res.json({ organizer: r.rows[0] });
  } catch (err) {
    console.error('updateMyOrganizer', err);
    return res.status(500).json({ message: 'Server error' });
  }
};