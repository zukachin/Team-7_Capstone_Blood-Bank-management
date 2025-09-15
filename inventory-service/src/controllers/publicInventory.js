// src/controllers/publicInventory.js
const pool = require('../db/db');

/**
 * Public API for donor portal:
 * - getStates()
 * - getDistricts(state_id)
 * - getBloodGroups()
 * - getComponents()
 * - getPublicStocks(state_id, district_id, component, blood_group_id?, min_units?)
 *
 * NOTE: All endpoints are read-only and do NOT return donor PII.
 */

/* ---- Lookup endpoints ---- */

async function getStates(req, res) {
  try {
    // expects table 'states' with columns state_id, name OR adapt to your schema
    const q = `SELECT state_id, name FROM public.states ORDER BY name`;
    const r = await pool.query(q);
    return res.json({ count: r.rowCount, states: r.rows });
  } catch (err) {
    console.error('getStates error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
}

async function getDistricts(req, res) {
  try {
    const { state_id } = req.query;
    if (!state_id) return res.status(400).json({ error: 'state_id required' });

    const q = `SELECT district_id, name FROM public.districts WHERE state_id = $1 ORDER BY name`;
    const r = await pool.query(q, [state_id]);
    return res.json({ state_id, count: r.rowCount, districts: r.rows });
  } catch (err) {
    console.error('getDistricts error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
}

async function getBloodGroups(req, res) {
  try {
    // your blood_groups table uses columns id and group_name
    const q = `SELECT id AS blood_group_id, group_name FROM public.blood_groups ORDER BY group_name`;
    const r = await pool.query(q);
    return res.json({ count: r.rowCount, blood_groups: r.rows });
  } catch (err) {
    console.error('getBloodGroups error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
}

function getComponents(req, res) {
  // static list consistent with enums you provided
  const components = ['WholeBlood', 'RBC', 'Plasma', 'Platelets'];
  return res.json({ components });
}

/* ---- Public stocks: main endpoint ----
   Query params:
     - state_id (required)
     - district_id (required)
     - component (required) : WholeBlood|RBC|Plasma|Platelets
     - blood_group_id (optional)
     - min_units (optional, default 1)
     - group_by (optional 'centre'|'blood_group', default 'centre')
*/
async function getPublicStocks(req, res) {
  try {
    const { state_id, district_id, component } = req.query;
    let { blood_group_id, min_units = 1, group_by = 'centre' } = req.query;
    min_units = Number(min_units || 1);
    group_by = group_by === 'blood_group' ? 'blood_group' : 'centre';

    if (!state_id || !district_id || !component) {
      return res.status(400).json({ error: 'state_id, district_id and component required' });
    }
    const allowed = ['WholeBlood', 'RBC', 'Plasma', 'Platelets'];
    if (!allowed.includes(component)) return res.status(400).json({ error: 'invalid component' });
    if (Number.isNaN(min_units) || min_units < 0) min_units = 1;

    const params = [state_id, district_id, component, min_units];
    let idx = 5;
    let extra = '';
    if (blood_group_id) {
      extra = `AND bi.blood_group_id = $${idx++}`;
      params.push(blood_group_id);
    }

    // Join centres → inventory → blood_groups
    // centres table must have state_id, district_id columns
    const sql = `
      SELECT
        c.centre_id,
        c.name AS centre_name,
        bi.blood_group_id,
        COALESCE(bg.group_name, '') AS blood_group_name,
        bi.component,
        SUM(bi.units_available)::int AS units_available,
        MAX(bi.last_updated) AS last_updated
      FROM public.centres c
      JOIN public.blood_inventory bi ON bi.centre_id = c.centre_id
      LEFT JOIN public.blood_groups bg ON bg.id = bi.blood_group_id
      WHERE c.state_id = $1
        AND c.district_id = $2
        AND bi.component = $3
        AND bi.units_available >= $4
        ${extra}
      GROUP BY c.centre_id, c.name, bi.blood_group_id, bg.group_name, bi.component
      ORDER BY c.name, bg.group_name;
    `;

    const { rows } = await pool.query(sql, params);

    // Return grouped by requested shape
    if (group_by === 'blood_group') {
      const map = new Map();
      for (const r of rows) {
        const key = String(r.blood_group_id);
        if (!map.has(key)) {
          map.set(key, { blood_group_id: r.blood_group_id, blood_group_name: r.blood_group_name, centres: [] });
        }
        map.get(key).centres.push({
          centre_id: r.centre_id,
          centre_name: r.centre_name,
          units_available: Number(r.units_available || 0),
          last_updated: r.last_updated,
        });
      }
      return res.json({ state_id, district_id, component, group_by, data: Array.from(map.values()) });
    }

    // default: group_by centre
    const centreMap = new Map();
    for (const r of rows) {
      const cid = String(r.centre_id);
      if (!centreMap.has(cid)) centreMap.set(cid, { centre_id: r.centre_id, centre_name: r.centre_name, stocks: [] });
      centreMap.get(cid).stocks.push({
        blood_group_id: r.blood_group_id,
        blood_group_name: r.blood_group_name,
        component: r.component,
        units_available: Number(r.units_available || 0),
        last_updated: r.last_updated,
      });
    }

    return res.json({ state_id, district_id, component, group_by, centres: Array.from(centreMap.values()) });
  } catch (err) {
    console.error('getPublicStocks error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
}

module.exports = {
  getStates,
  getDistricts,
  getBloodGroups,
  getComponents,
  getPublicStocks,
};
