
const pool = require('../db/db');


exports.getMyAppointments = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.user_id) return res.status(401).json({ message: 'Unauthenticated' });

    const sql = `
      SELECT a.*, c.centre_name, c.centre_code
      FROM appointments a
      LEFT JOIN centres c ON a.centre_id::text = c.centre_id::text
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT 500
    `;
    const r = await pool.query(sql, [user.user_id]);
    return res.json({ appointments: r.rows });
  } catch (err) {
    console.error('getMyAppointments error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

