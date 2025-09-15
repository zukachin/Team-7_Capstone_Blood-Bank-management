// src/controllers/segregation.js
const pool = require('../db/db');

/**
 * Segregation controller
 * - POST /api/segregation/:collection_id
 * - GET  /api/segregation
 * - GET  /api/segregation/:segregation_id
 *
 * Assumes tables:
 *  - public.blood_collection (collection_id, donor_id, centre_id, collected_amount, ...)
 *  - public.blood_testing (collection_id, blood_group_id, overall_status, ...)
 *  - public.blood_segregation (see schema)
 *  - public.blood_inventory (see schema)
 *
 * Location-scoping: req.user must exist and include { user_id, role, centre_id }.
 */

const COMPONENTS = ['RBC', 'Plasma', 'Platelets'];
const DEFAULT_RATIOS = { RBC: 0.45, Plasma: 0.45, Platelets: 0.10 };
const DEFAULT_SHELF_DAYS = { RBC: 35, Plasma: 365, Platelets: 5 };

function roundMl(v) {
  // keep integer ml
  return Math.max(0, Math.round(Number(v) || 0));
}

function enforceLocationScope(role, userCentre, collectionCentre) {
  if (['Admin', 'SuperAdmin'].includes(role)) return true;
  if (['Organizer', 'LabStaff'].includes(role)) return String(userCentre) === String(collectionCentre);
  return false;
}

/**
 * POST /api/segregation/:collection_id
 * body: { components?: ['RBC','Plasma','Platelets'] } (optional)
 */
async function segregateCollection(req, res) {
  const { collection_id } = req.params;
  const requested = (Array.isArray(req.body.components) && req.body.components.length)
    ? req.body.components.filter(c => COMPONENTS.includes(c))
    : COMPONENTS.slice(); // default all three

  const user = req.user || {};
  const role = user.role || 'Unknown';
  const userCentre = user.centre_id || null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock collection row and get collected_amount + centre_id
    const collQ = `
      SELECT bc.collection_id, bc.donor_id, bc.centre_id, bc.collected_amount,
             bt.blood_group_id, bt.overall_status
      FROM public.blood_collection bc
      LEFT JOIN public.blood_testing bt ON bt.collection_id = bc.collection_id
      WHERE bc.collection_id = $1
      FOR UPDATE
    `;
    const collR = await client.query(collQ, [collection_id]);
    if (!collR.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'collection_not_found' });
    }
    const coll = collR.rows[0];

    // Location scope check
    if (!enforceLocationScope(role, userCentre, coll.centre_id)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'forbidden' });
    }

    // Must have passed tests
    if (!coll.overall_status || String(coll.overall_status).toLowerCase() !== 'passed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'collection_not_tested_or_not_passed' });
    }

    // collected amount check
    const collectedAmt = Number(coll.collected_amount || 0);
    if (!collectedAmt || collectedAmt <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'invalid_collected_amount' });
    }

    // Prevent duplicate segregation for same collection+component
    const existQ = `SELECT component FROM public.blood_segregation WHERE collection_id = $1 AND component = ANY($2::text[])`;
    const existR = await client.query(existQ, [collection_id, requested]);
    if (existR.rowCount) {
      const dup = existR.rows.map(r => r.component);
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'already_segregated_for_component', components: dup });
    }

    // Fetch component settings (optional table). If missing, use defaults.
    // We'll try to read component_settings but it is optional — fail-safe to defaults.
    const settingsMap = {};
    try {
      const sQ = `SELECT component, ratio, shelf_life_days FROM public.component_settings WHERE component = ANY($1::text[])`;
      const sR = await client.query(sQ, [requested]);
      sR.rows.forEach(r => {
        settingsMap[r.component] = { ratio: Number(r.ratio), shelf_life_days: Number(r.shelf_life_days) };
      });
    } catch (e) {
      // ignore if table doesn't exist
    }

    // Compute raw volumes
    const raw = {};
    let assigned = 0;
    for (const comp of requested) {
      const ratio = settingsMap[comp] ? settingsMap[comp].ratio : DEFAULT_RATIOS[comp];
      raw[comp] = collectedAmt * Number(ratio);
      assigned += raw[comp];
    }
    // Remainder -> Platelets (preferred) or last requested
    const remainder = collectedAmt - assigned;
    if (requested.includes('Platelets')) raw['Platelets'] = (raw['Platelets'] || 0) + remainder;
    else raw[requested[requested.length - 1]] = (raw[requested[requested.length - 1]] || 0) + remainder;

    // Insert segregation rows & upsert inventory
    const created = [];
    const bloodGroupId = coll.blood_group_id;
    if (!bloodGroupId) {
      // attempt fetch donors.blood_group_id as fallback
      try {
        const dQ = `SELECT blood_group_id FROM public.donors WHERE donor_id = $1 LIMIT 1`;
        const dR = await client.query(dQ, [coll.donor_id]);
        if (dR.rowCount) {
          // assign
          // eslint-disable-next-line prefer-destructuring
          raw._blood_group_id = dR.rows[0].blood_group_id;
        }
      } catch (e) {}
    }
    const bgId = bloodGroupId || raw._blood_group_id;
    if (!bgId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'blood_group_unknown' });
    }

    const segregatedAt = new Date();

    for (const comp of requested) {
      const volMl = roundMl(raw[comp]);
      // decide units — business decision: 1 unit per component by default
      const units = 1;
      const shelfDays = settingsMap[comp] ? settingsMap[comp].shelf_life_days : DEFAULT_SHELF_DAYS[comp];
      const expiry = new Date(segregatedAt);
      expiry.setDate(expiry.getDate() + Number(shelfDays || 0));
      const expiryDateStr = expiry.toISOString().slice(0, 10);

      const insQ = `
        INSERT INTO public.blood_segregation
          (collection_id, component, volume_ml, units, expiry_date, status, centre_id, segregated_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,'Available',$6,$7, now())
        RETURNING segregation_id, collection_id, component, volume_ml, units, expiry_date, status, centre_id, segregated_at
      `;
      const insR = await client.query(insQ, [collection_id, comp, volMl, units, expiryDateStr, coll.centre_id, segregatedAt]);
      created.push(insR.rows[0]);

      // upsert inventory: add units to units_available (units integer)
      const upsertQ = `
        INSERT INTO public.blood_inventory (centre_id, blood_group_id, component, units_available, last_updated)
        VALUES ($1, $2, $3, $4, now())
        ON CONFLICT (centre_id, blood_group_id, component)
        DO UPDATE SET units_available = public.blood_inventory.units_available + EXCLUDED.units_available,
                      last_updated = now()
        RETURNING inventory_id, centre_id, blood_group_id, component, units_available, last_updated
      `;
      const upsertR = await client.query(upsertQ, [coll.centre_id, bgId, comp, units]);
      // optionally capture inventory snapshot (last row)
      // we'll push the upsert result in created for client visibility
      created[created.length - 1].inventory = upsertR.rows[0];
    }

    // audit (optional) — record who did it
    try {
      await client.query(
        `INSERT INTO public.segregation_audit (collection_id, actor_user_id, action, payload, created_at)
         VALUES ($1, $2, $3, $4, now())`,
        [collection_id, user.user_id || null, 'segregate', JSON.stringify({ created, requested })]
      );
    } catch (e) {
      // ignore if audit table missing
    }

    await client.query('COMMIT');
    return res.json({ ok: true, segregations: created });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) {}
    console.error('segregation error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  } finally {
    client.release();
  }
}

/**
 * GET /api/segregation
 * Query: centre_id, collection_id, component, page, limit
 * Scoped: Organizer/LabStaff see only their centre
 */
async function listSegregations(req, res) {
  try {
    const user = req.user || {};
    const role = user.role || 'Unknown';

    let { centre_id, collection_id, component, page = 1, limit = 50 } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(500, parseInt(limit, 10) || 50);
    const offset = (page - 1) * limit;

    if (['Organizer', 'LabStaff'].includes(role)) centre_id = user.centre_id;

    const where = [];
    const params = [];
    let idx = 1;
    if (centre_id) { where.push(`s.centre_id = $${idx++}`); params.push(centre_id); }
    if (collection_id) { where.push(`s.collection_id = $${idx++}`); params.push(collection_id); }
    if (component) { where.push(`s.component = $${idx++}`); params.push(component); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countQ = `SELECT COUNT(*)::int AS total FROM public.blood_segregation s ${whereSql}`;
    const countR = await pool.query(countQ, params);
    const total = countR.rows[0].total;

    const dataQ = `
      SELECT s.segregation_id, s.collection_id, s.component, s.volume_ml, s.units, s.expiry_date, s.status, s.centre_id, s.segregated_at,
             d.donor_id, d.donor_name, d.email AS donor_email
      FROM public.blood_segregation s
      LEFT JOIN public.blood_collection bc ON bc.collection_id = s.collection_id
      LEFT JOIN public.donors d ON d.donor_id = bc.donor_id
      ${whereSql}
      ORDER BY s.segregated_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);
    const dataR = await pool.query(dataQ, params);

    return res.json({ meta: { total, page, limit, pages: Math.ceil(total / limit) }, data: dataR.rows });
  } catch (err) {
    console.error('listSegregations error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
}

/**
 * GET /api/segregation/:segregation_id
 */
async function getSegregation(req, res) {
  const { segregation_id } = req.params;
  try {
    const q = `
      SELECT s.segregation_id, s.collection_id, s.component, s.volume_ml, s.units, s.expiry_date, s.status, s.centre_id, s.segregated_at, s.updated_at,
             d.donor_id, d.donor_name, d.email AS donor_email
      FROM public.blood_segregation s
      LEFT JOIN public.blood_collection bc ON bc.collection_id = s.collection_id
      LEFT JOIN public.donors d ON d.donor_id = bc.donor_id
      WHERE s.segregation_id = $1
      LIMIT 1
    `;
    const r = await pool.query(q, [segregation_id]);
    if (!r.rowCount) return res.status(404).json({ error: 'not_found' });

    const row = r.rows[0];
    const user = req.user || {};
    const role = user.role || 'Unknown';
    if (['Organizer', 'LabStaff'].includes(role) && String(user.centre_id) !== String(row.centre_id)) {
      return res.status(403).json({ error: 'forbidden' });
    }

    return res.json({ data: row });
  } catch (err) {
    console.error('getSegregation error', err);
    return res.status(500).json({ error: 'server_error', detail: err.message });
  }
}

module.exports = { segregateCollection, listSegregations, getSegregation };
