// src/controllers/inventory.js
const pool = require('../db/db');

/**
 * Helper: enforce location scope for non-admin roles
 */
function enforceScope(role, userCentre, requestedCentre) {
  if (['Admin', 'SuperAdmin'].includes(role)) return { allowed: true, centre: requestedCentre || null };
  // Organizer / LabStaff forced to their centre
  return { allowed: true, centre: userCentre };
}

/**
 * GET /api/inventory
 */
async function listInventory(req, res) {
  try {
    const user = req.user || {};
    const role = user.role || 'Unknown';

    let { centre_id = null, blood_group_id = null, component = null, page = 1, limit = 100 } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(500, parseInt(limit, 10) || 100);
    const offset = (page - 1) * limit;

    // enforce scope
    const scope = enforceScope(role, user.centre_id, centre_id);
    if (!scope.allowed) return res.status(403).json({ message: 'Forbidden' });
    centre_id = scope.centre;

    // build where clause
    const where = [];
    const params = [];
    let idx = 1;
    if (centre_id) { where.push(`bi.centre_id = $${idx++}`); params.push(centre_id); }
    if (blood_group_id) { where.push(`bi.blood_group_id = $${idx++}`); params.push(blood_group_id); }
    if (component) { where.push(`bi.component = $${idx++}`); params.push(component); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // count
    const countSql = `SELECT COUNT(*)::int AS total FROM public.blood_inventory bi ${whereSql}`;
    const countRes = await pool.query(countSql, params);
    const total = countRes.rows[0].total;

    // data query with blood group name (if available)
    const dataSql = `
      SELECT bi.inventory_id, bi.centre_id, bi.blood_group_id, COALESCE(bg.group_name, '') AS blood_group_name,
             bi.component, bi.units_available, bi.last_updated
      FROM public.blood_inventory bi
      LEFT JOIN public.blood_groups bg ON bg.id = bi.blood_group_id
      ${whereSql}
      ORDER BY bi.last_updated DESC NULLS LAST, bi.centre_id, bi.blood_group_id, bi.component
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);
    const dataRes = await pool.query(dataSql, params);

    return res.json({
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: dataRes.rows,
    });
  } catch (err) {
    console.error('listInventory error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

/**
 * GET /api/inventory/:inventory_id
 */
async function getInventory(req, res) {
  try {
    const { inventory_id } = req.params;
    const user = req.user || {};
    const role = user.role || 'Unknown';

    // Defensive validation: inventory_id must be digits only
    if (!inventory_id || !/^\d+$/.test(String(inventory_id))) {
      return res.status(400).json({ message: 'Invalid inventory ID' });
    }

    const q = `
      SELECT bi.inventory_id, bi.centre_id, bi.blood_group_id, COALESCE(bg.group_name, '') AS blood_group_name,
             bi.component, bi.units_available, bi.last_updated
      FROM public.blood_inventory bi
      LEFT JOIN public.blood_groups bg ON bg.id = bi.blood_group_id
      WHERE bi.inventory_id = $1
      LIMIT 1
    `;
    const r = await pool.query(q, [inventory_id]);
    if (!r.rowCount) return res.status(404).json({ message: 'Inventory not found' });

    const row = r.rows[0];
    // scope check for non-admin
    if (!['Admin', 'SuperAdmin'].includes(role) && String(user.centre_id) !== String(row.centre_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json({ data: row });
  } catch (err) {
    console.error('getInventory error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

/**
 * GET /api/inventory/summary
 * Returns grouped summary per blood_group with component break-down for a centre.
 */
async function getInventorySummary(req, res) {
  try {
    const user = req.user || {};
    const role = user.role || 'Unknown';

    let { centre_id = null, blood_group_id = null } = req.query;
    // scope enforcement
    if (['Organizer', 'LabStaff'].includes(role)) centre_id = user.centre_id;

    const where = [];
    const params = [];
    let idx = 1;
    if (centre_id) { where.push(`bi.centre_id = $${idx++}`); params.push(centre_id); }
    if (blood_group_id) { where.push(`bi.blood_group_id = $${idx++}`); params.push(blood_group_id); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // aggregate inventory per blood_group + component (use view if available)
    const sql = `
      SELECT bi.centre_id,
             bi.blood_group_id,
             COALESCE(bg.group_name, '') AS blood_group_name,
             bi.component,
             SUM(bi.units_available)::int AS units_available,
             MAX(bi.last_updated) AS last_updated
      FROM public.blood_inventory bi
      LEFT JOIN public.blood_groups bg ON bg.id = bi.blood_group_id
      ${whereSql}
      GROUP BY bi.centre_id, bi.blood_group_id, bg.group_name, bi.component
      ORDER BY bg.group_name, bi.component
    `;
    const r = await pool.query(sql, params);

    // group rows by blood_group_id
    const map = new Map();
    let centre = null;
    for (const row of r.rows) {
      centre = row.centre_id;
      const key = String(row.blood_group_id);
      if (!map.has(key)) {
        map.set(key, {
          blood_group_id: row.blood_group_id,
          blood_group_name: row.blood_group_name,
          components: [],
        });
      }
      map.get(key).components.push({
        component: row.component,
        units_available: Number(row.units_available || 0),
        last_updated: row.last_updated,
      });
    }

    const summary = Array.from(map.values());
    return res.json({ centre_id: centre, summary });
  } catch (err) {
    console.error('getInventorySummary error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

/**
 * GET /api/inventory/global-summary
 * Admin-only: returns nested structure of centres -> blood groups -> components
 */
async function getInventoryGlobal(req, res) {
  try {
    const user = req.user || {};
    const role = user.role || 'Unknown';
    if (!['Admin', 'SuperAdmin'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const sql = `
      SELECT bi.centre_id,
             bi.blood_group_id,
             COALESCE(bg.group_name, '') AS blood_group_name,
             bi.component,
             SUM(bi.units_available)::int AS units_available
      FROM public.blood_inventory bi
      LEFT JOIN public.blood_groups bg ON bg.id = bi.blood_group_id
      GROUP BY bi.centre_id, bi.blood_group_id, bg.group_name, bi.component
      ORDER BY bi.centre_id, bg.group_name, bi.component
    `;
    const r = await pool.query(sql);

    // nest by centre -> blood_group
    const centreMap = new Map();
    for (const row of r.rows) {
      const centreKey = String(row.centre_id);
      if (!centreMap.has(centreKey)) centreMap.set(centreKey, { centre_id: row.centre_id, blood_groups: new Map() });

      const centreObj = centreMap.get(centreKey);
      const bgKey = String(row.blood_group_id);
      if (!centreObj.blood_groups.has(bgKey)) {
        centreObj.blood_groups.set(bgKey, {
          blood_group_id: row.blood_group_id,
          blood_group_name: row.blood_group_name,
          components: [],
        });
      }
      centreObj.blood_groups.get(bgKey).components.push({
        component: row.component,
        units_available: Number(row.units_available || 0),
      });
    }

    // convert maps to plain structure
    const result = [];
    for (const [centreKey, centreObj] of centreMap.entries()) {
      const bgs = Array.from(centreObj.blood_groups.values());
      result.push({ centre_id: centreObj.centre_id, blood_groups: bgs });
    }

    return res.json({ data: result });
  } catch (err) {
    console.error('getInventoryGlobal error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

/**
 * GET /api/inventory/low-stock
 */
async function getLowStock(req, res) {
  try {
    const user = req.user || {};
    const role = user.role || 'Unknown';
    let { threshold = 1, centre_id = null } = req.query;
    threshold = Number(threshold || 1);

    if (['Organizer', 'LabStaff'].includes(role)) centre_id = user.centre_id;

    const where = [`bi.units_available <= $1`];
    const params = [threshold];
    let idx = 2;
    if (centre_id) { where.push(`bi.centre_id = $${idx++}`); params.push(centre_id); }
    const whereSql = `WHERE ${where.join(' AND ')}`;

    const sql = `
      SELECT bi.inventory_id, bi.centre_id, bi.blood_group_id, COALESCE(bg.group_name, '') AS blood_group_name,
             bi.component, bi.units_available, bi.last_updated
      FROM public.blood_inventory bi
      LEFT JOIN public.blood_groups bg ON bg.id = bi.blood_group_id
      ${whereSql}
      ORDER BY bi.units_available ASC, bi.last_updated ASC
      LIMIT 1000
    `;
    const r = await pool.query(sql, params);
    return res.json({ threshold, count: r.rowCount, data: r.rows });
  } catch (err) {
    console.error('getLowStock error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

/**
 * GET /api/inventory/export.csv
 */
async function exportInventoryCSV(req, res) {
  try {
    const user = req.user || {};
    const role = user.role || 'Unknown';

    let { centre_id = null, blood_group_id = null, component = null } = req.query;
    if (['Organizer', 'LabStaff'].includes(role)) centre_id = user.centre_id;

    const where = [];
    const params = [];
    let idx = 1;
    if (centre_id) { where.push(`bi.centre_id = $${idx++}`); params.push(centre_id); }
    if (blood_group_id) { where.push(`bi.blood_group_id = $${idx++}`); params.push(blood_group_id); }
    if (component) { where.push(`bi.component = $${idx++}`); params.push(component); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT bi.inventory_id, bi.centre_id, bi.blood_group_id, COALESCE(bg.group_name,'') as blood_group_name,
             bi.component, bi.units_available, bi.last_updated
      FROM public.blood_inventory bi
      LEFT JOIN public.blood_groups bg ON bg.id = bi.blood_group_id
      ${whereSql}
      ORDER BY bi.centre_id, bi.blood_group_id, bi.component
      LIMIT 10000
    `;
    const r = await pool.query(sql, params);

    // build CSV
    const headers = ['inventory_id', 'centre_id', 'blood_group_id', 'blood_group_name', 'component', 'units_available', 'last_updated'];
    const csvRows = [headers.join(',')];
    for (const row of r.rows) {
      const cols = headers.map(h => {
        const v = row[h];
        if (v === null || v === undefined) return '';
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      });
      csvRows.push(cols.join(','));
    }
    const csv = csvRows.join('\n');

    // set headers for download
    const filename = `inventory_export_${centre_id || 'all'}_${new Date().toISOString().slice(0,10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (err) {
    console.error('exportInventoryCSV error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

module.exports = {
  listInventory,
  getInventory,
  getInventorySummary,
  getInventoryGlobal,
  getLowStock,
  exportInventoryCSV,
};
