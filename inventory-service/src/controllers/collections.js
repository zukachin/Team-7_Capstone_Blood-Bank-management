// src/controllers/collections.js
const pool = require('../db/db');
const mailerModule = require('../utils/mailer'); // your existing mailer (optional)
const sendMail = (mailerModule && mailerModule.sendMail) ? mailerModule.sendMail : mailerModule;

/**
 * POST /api/collections
 * body: { donor_id, centre_id, camp_id, bag_size, collected_amount, lot_number, collection_date, donor_reaction }
 * Location-bounded: Organizer/LabStaff must have req.user.centre_id === centre_id
 */
async function createCollection(req, res) {
  const {
    donor_id, centre_id, camp_id = null, bag_size, collected_amount,
    lot_number = null, collection_date = null, donor_reaction = null
  } = req.body;

  if (!donor_id || !centre_id || !bag_size || !collected_amount) {
    return res.status(400).json({ message: 'donor_id, centre_id, bag_size and collected_amount required' });
  }

  const user = req.user || {};
  const role = user.role || 'Unknown';

  if (['Organizer', 'LabStaff'].includes(role)) {
    if (!user.centre_id || String(user.centre_id) !== String(centre_id)) {
      return res.status(403).json({ message: 'Forbidden: you are not authorized for this centre' });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // verify donor exists
    const donorQ = 'SELECT donor_id FROM public.donors WHERE donor_id = $1 LIMIT 1 FOR UPDATE';
    const donorR = await client.query(donorQ, [donor_id]);
    if (!donorR.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Donor not found' });
    }

    // verify centre exists (optional: add centres table)
    const centreCheck = await client.query('SELECT centre_id FROM public.centres WHERE centre_id = $1 LIMIT 1', [centre_id]);
    if (!centreCheck.rowCount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid centre_id' });
    }

    if (camp_id) {
      const campCheck = await client.query('SELECT camp_id, centre_id FROM public.camps WHERE camp_id = $1 LIMIT 1', [camp_id]);
      if (!campCheck.rowCount) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Invalid camp_id' });
      }
      if (String(campCheck.rows[0].centre_id) !== String(centre_id)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Camp does not belong to the provided centre' });
      }
    }

    const insertSql = `
      INSERT INTO public.blood_collection
        (donor_id, centre_id, camp_id, bag_size, collected_amount, lot_number, collection_date, donor_reaction, created_at)
      VALUES ($1,$2,$3,$4,$5,$6, COALESCE($7, now()), $8, now())
      RETURNING collection_id, donor_id, centre_id, camp_id, bag_size, collected_amount, lot_number, collection_date
    `;
    const vals = [donor_id, centre_id, camp_id, bag_size, collected_amount, lot_number, collection_date, donor_reaction];
    const r = await client.query(insertSql, vals);

    await client.query('COMMIT');
    return res.status(201).json({ collection: r.rows[0] });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) {}
    console.error('createCollection error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  } finally {
    client.release();
  }
}

/**
 * GET /api/collections
 * Query: centre_id, camp_id, overall_status, from, to, page, limit
 * Organizer/LabStaff are scoped to req.user.centre_id
 */
async function listCollections(req, res) {
  try {
    const user = req.user || {};
    const role = user.role || 'Unknown';

    let { centre_id, camp_id, overall_status, from, to, page = 1, limit = 25 } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(200, Math.max(1, parseInt(limit, 10) || 25));
    const offset = (page - 1) * limit;

    if (['Organizer', 'LabStaff'].includes(role)) centre_id = user.centre_id;

    const where = [];
    const params = [];
    let idx = 1;
    if (centre_id) { where.push(`bc.centre_id = $${idx++}`); params.push(centre_id); }
    if (camp_id)   { where.push(`bc.camp_id = $${idx++}`); params.push(camp_id); }
    if (overall_status) { where.push(`bt.overall_status = $${idx++}`); params.push(overall_status); }
    if (from) { where.push(`bc.collection_date::date >= $${idx++}::date`); params.push(from); }
    if (to)   { where.push(`bc.collection_date::date <= $${idx++}::date`); params.push(to); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM public.blood_collection bc
      LEFT JOIN public.blood_testing bt ON bt.collection_id = bc.collection_id
      ${whereSql}
    `;
    const countR = await pool.query(countSql, params);
    const total = countR.rows[0].total;

    const dataSql = `
      SELECT bc.collection_id, bc.donor_id, d.donor_name AS donor_name, d.email AS donor_email,
             bc.centre_id, bc.camp_id, bc.bag_size, bc.collected_amount, bc.lot_number, bc.collection_date, bc.donor_reaction,
             bt.test_id, bt.overall_status, bt.tested_at
      FROM public.blood_collection bc
      LEFT JOIN public.donors d ON d.donor_id = bc.donor_id
      LEFT JOIN public.blood_testing bt ON bt.collection_id = bc.collection_id
      ${whereSql}
      ORDER BY bc.collection_date DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);
    const dataR = await pool.query(dataSql, params);

    return res.json({ meta: { total, page, limit, pages: Math.ceil(total / limit) }, data: dataR.rows });
  } catch (err) {
    console.error('listCollections error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

/**
 * GET /api/collections/:collection_id
 */
async function getCollection(req, res) {
  const { collection_id } = req.params;
  const user = req.user || {};
  const role = user.role || 'Unknown';

  try {
    const q = `
      SELECT bc.collection_id, bc.donor_id, d.donor_name AS donor_name, d.email AS donor_email,
             bc.centre_id, bc.camp_id, bc.bag_size, bc.collected_amount, bc.lot_number, bc.collection_date, bc.donor_reaction,
             bt.test_id, bt.overall_status, bt.tested_at
      FROM public.blood_collection bc
      LEFT JOIN public.donors d ON d.donor_id = bc.donor_id
      LEFT JOIN public.blood_testing bt ON bt.collection_id = bc.collection_id
      WHERE bc.collection_id = $1
      LIMIT 1
    `;
    const r = await pool.query(q, [collection_id]);
    if (!r.rowCount) return res.status(404).json({ message: 'Collection not found' });

    const row = r.rows[0];
    if (['Organizer', 'LabStaff'].includes(role) && String(user.centre_id) !== String(row.centre_id)) {
      return res.status(403).json({ message: 'Forbidden: you are not authorized for this centre' });
    }

    return res.json({ data: row });
  } catch (err) {
    console.error('getCollection error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

module.exports = { createCollection, listCollections, getCollection };
