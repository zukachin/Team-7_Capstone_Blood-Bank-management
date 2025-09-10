// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db/pool'); // adjust path

// GET /api/locations/states
router.get('/states', async (req, res) => {
  try {
    const q = 'SELECT state_id AS id, state_name AS name FROM states ORDER BY state_name';
    const r = await pool.query(q);
    res.json({ states: r.rows });
  } catch (err) {
    console.error('GET /states err', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/locations/states/:stateId/districts
router.get('/states/:stateId/districts', async (req, res) => {
  try {
    const stateId = Number(req.params.stateId);
    if (!Number.isInteger(stateId)) return res.status(400).json({ message: 'Invalid stateId' });

    const q = `
      SELECT district_id AS id, district_name AS name
      FROM districts
      WHERE state_id = $1
      ORDER BY district_name
    `;
    const r = await pool.query(q, [stateId]);
    res.json({ districts: r.rows });
  } catch (err) {
    console.error('GET /states/:stateId/districts err', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
