// routes/inventoryRoutes.js  (fixed)
const express = require('express');
const router = express.Router();
const pool = require('../db/db');

router.get('/search', async (req, res) => {
  try {
    const stateId = req.query.stateId ? Number(req.query.stateId) : null;
    const districtId = req.query.districtId ? Number(req.query.districtId) : null;
    const bloodGroupId = req.query.bloodGroupId ? Number(req.query.bloodGroupId) : null;
    const component = req.query.component ? String(req.query.component) : null;

    if (stateId !== null && !Number.isInteger(stateId)) return res.status(400).json({ message: 'Invalid stateId' });
    if (districtId !== null && !Number.isInteger(districtId)) return res.status(400).json({ message: 'Invalid districtId' });
    if (bloodGroupId !== null && !Number.isInteger(bloodGroupId)) return res.status(400).json({ message: 'Invalid bloodGroupId' });

    const q = `
      SELECT
        c.centre_id,
        c.centre_name,
        c.centre_code,
        c.address,
        c.district_id,
        bi.blood_group_id,
        bg.group_name AS blood_group_name,
        bi.component,
        bi.units_available,
        bi.last_updated
      FROM centres c
      JOIN blood_inventory bi ON bi.centre_id = c.centre_id
      JOIN blood_groups bg ON bg.id = bi.blood_group_id
      LEFT JOIN districts d ON d.district_id = c.district_id
      LEFT JOIN states s ON s.state_id = d.state_id
      WHERE
        ($1::int IS NULL OR s.state_id = $1)
        AND ($2::int IS NULL OR c.district_id = $2)
        AND ($3::int IS NULL OR bi.blood_group_id = $3)
        AND ($4::text IS NULL OR bi.component::text = $4::text)
        AND bi.units_available > 0
      ORDER BY c.centre_name, bg.group_name, bi.component;
    `;

    const params = [ stateId, districtId, bloodGroupId, component ];
    const { rows } = await pool.query(q, params);

    const centresMap = new Map();
    for (const r of rows) {
      if (!centresMap.has(r.centre_id)) {
        centresMap.set(r.centre_id, {
          centre_id: r.centre_id,
          centre_name: r.centre_name,
          centre_code: r.centre_code,
          address: r.address,
          district_id: r.district_id,
          inventories: []
        });
      }
      centresMap.get(r.centre_id).inventories.push({
        blood_group_id: r.blood_group_id,
        blood_group_name: r.blood_group_name,
        component: r.component,
        units_available: r.units_available,
        last_updated: r.last_updated
      });
    }

    res.json({ centres: Array.from(centresMap.values()), count: centresMap.size });
  } catch (err) {
    console.error('GET /inventory/search err', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
