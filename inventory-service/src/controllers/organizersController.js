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
