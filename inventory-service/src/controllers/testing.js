// src/controllers/testing.js
const pool = require('../db/db');
const mailerModule = require('../utils/mailer'); // your existing mailer (optional)
const sendMail = (mailerModule && mailerModule.sendMail) ? mailerModule.sendMail : mailerModule;
const mailerAttach = require('../utils/mailer_attach'); // for sending with attachment
const { generateDonationCertificate } = require('../utils/pdf');

function computeOverallStatus(tests) {
  const reactive = [];
  for (const [k, v] of Object.entries(tests)) {
    if (!v) continue;
    if (String(v).toLowerCase() === 'reactive') reactive.push(k.toUpperCase());
  }
  return reactive.length ? { overall: 'Reactive', reactive } : { overall: 'Passed', reactive: [] };
}

function enforceLocationScope(role, userCentre, collectionCentre) {
  if (['Admin', 'SuperAdmin'].includes(role)) return true;
  if (['Organizer', 'LabStaff'].includes(role)) return String(userCentre) === String(collectionCentre);
  return false;
}

/**
 * PATCH /api/testing/:collection_id
 * Immediate send of result email (Passed => attach PDF)
 */
async function updateTesting(req, res) {
  const { collection_id } = req.params;
  const { blood_group_id, hiv, hbsag, hcv, syphilis, malaria, tested_at = null } = req.body;
  const tests = { hiv, hbsag, hcv, syphilis, malaria };
  const user = req.user || {};
  const role = user.role || 'Unknown';

  const client = await pool.connect();
  let released = false;
  try {
    await client.query('BEGIN');

    // lock collection
    const collQ = `SELECT collection_id, donor_id, centre_id, camp_id FROM public.blood_collection WHERE collection_id = $1 FOR UPDATE`;
    const collR = await client.query(collQ, [collection_id]);
    if (!collR.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Collection not found' });
    }
    const coll = collR.rows[0];

    if (!enforceLocationScope(role, user.centre_id, coll.centre_id)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Forbidden: not authorized for this centre/camp' });
    }

    // fetch donor
    const donorQ = `SELECT donor_id, donor_name, email, user_id FROM public.donors WHERE donor_id = $1 LIMIT 1`;
    const donorR = await client.query(donorQ, [coll.donor_id]);
    const donor = donorR.rowCount ? donorR.rows[0] : { donor_id: null, donor_name: null, email: null, user_id: null };

    // upsert blood_testing
    const existing = await client.query('SELECT test_id FROM public.blood_testing WHERE collection_id = $1 FOR UPDATE', [collection_id]);
    if (!existing.rowCount) {
      await client.query(
        `INSERT INTO public.blood_testing
           (collection_id, blood_group_id, hiv, hbsag, hcv, syphilis, malaria, overall_status, tested_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, COALESCE($9, now()))`,
        [collection_id, blood_group_id, hiv ?? 'Pending', hbsag ?? 'Pending', hcv ?? 'Pending', syphilis ?? 'Pending', malaria ?? 'Pending', 'Pending', tested_at]
      );
    } else {
      await client.query(
        `UPDATE public.blood_testing
         SET blood_group_id = COALESCE($2, blood_group_id),
             hiv = COALESCE($3, hiv),
             hbsag = COALESCE($4, hbsag),
             hcv = COALESCE($5, hcv),
             syphilis = COALESCE($6, syphilis),
             malaria = COALESCE($7, malaria),
             tested_at = COALESCE($8, tested_at)
         WHERE collection_id = $1`,
        [collection_id, blood_group_id, hiv, hbsag, hcv, syphilis, malaria, tested_at]
      );
    }

    const computed = computeOverallStatus(tests);
    const overall_status = computed.overall === 'Passed' ? 'Passed' : 'Reactive';

    await client.query('UPDATE public.blood_testing SET overall_status = $1 WHERE collection_id = $2', [overall_status, collection_id]);

    // commit transaction before external ops
    await client.query('COMMIT');
    client.release();
    released = true;

    // prepare email details
    const testedAtStr = tested_at ? new Date(tested_at).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
    const portalBase = process.env.DONOR_PORTAL_URL || 'https://donor.example.com';
    const portalUrl = `${portalBase}/donor/donations/${donor.donor_id}`;
    const certUrl = `${portalBase}/donor/donations/${donor.donor_id}/certificate/${collection_id}`;
    const recipientEmail = donor.email || null;

    if (overall_status === 'Passed') {
      const nextRes = await pool.query("SELECT (COALESCE($1::timestamp, now())::date + INTERVAL '90 days')::date AS next_date", [tested_at]);
      const nextEligibleDate = nextRes.rows[0].next_date;

      try {
        await pool.query('UPDATE public.donors SET next_eligible_date = $1 WHERE donor_id = $2', [nextEligibleDate, donor.donor_id]);
      } catch (e) {
        // ignore
      }

      const subject = 'Life Link — Donation Test Passed';
      const text = `Hello ${donor.donor_name || 'Donor'},\n\nYour donation (ID: ${collection_id}) tested on ${testedAtStr} and passed all screening tests.\n\nYou can view your donations and download your donation certificate from your donor portal:\n${portalUrl}\n\nThank you for your donation.`;
      const html = `<!doctype html><html><body>
        <h2>Donation Test Passed</h2>
        <p>Hello ${donor.donor_name || 'Donor'},</p>
        <p>Your donation (ID: <b>${collection_id}</b>) tested on <b>${testedAtStr}</b> and passed all screening tests.</p>
        <p><a href="${portalUrl}">View donations</a> — <a href="${certUrl}">Download certificate</a></p>
        </body></html>`;

      // generate PDF
      let pdfBuffer = null;
      try {
        pdfBuffer = await generateDonationCertificate(donor, coll, tests, overall_status, nextEligibleDate);
      } catch (err) {
        console.error('PDF generation error', err);
      }

      if (recipientEmail) {
        try {
          // prefer mailerAttach (nodemailer) to include attachment
          if (pdfBuffer) {
            await mailerAttach.sendMailWithAttachment(recipientEmail, subject, text, html, [
              { filename: `certificate_${collection_id}.pdf`, content: pdfBuffer }
            ]);
          } else {
            // fallback: send without attachment using legacy sendMail if available
            if (sendMail) await sendMail(recipientEmail, subject, text, html);
            else await mailerAttach.sendMailWithAttachment(recipientEmail, subject, text, html, []);
          }

          // store notification as Sent
          await pool.query(
            `INSERT INTO public.notifications (user_id, camp_id, message, subject, body, recipient_email, is_read, scheduled_at, status, channel, created_at, sent_at)
             VALUES ($1, $2, $3, $4, $5, $6, false, now()::date, 'Sent', 'Email', now(), now())`,
            [donor.user_id || null, coll.camp_id || null, `Donation passed (collection ${collection_id})`, subject, text, recipientEmail]
          );
        } catch (mailErr) {
          console.error('send mail failed (Passed):', mailErr);
          await pool.query(
            `INSERT INTO public.notifications (user_id, camp_id, message, subject, body, recipient_email, is_read, scheduled_at, status, channel, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, false, now()::date, 'Failed', 'Email', now())`,
            [donor.user_id || null, coll.camp_id || null, `Donation passed (collection ${collection_id})`, subject, text, recipientEmail]
          );
        }
      } else {
        // no email: insert Pending notification
        await pool.query(
          `INSERT INTO public.notifications (user_id, camp_id, message, subject, body, is_read, scheduled_at, status, channel, created_at)
           VALUES ($1, $2, $3, $4, $5, false, now()::date, 'Pending', 'Email', now())`,
          [donor.user_id || null, coll.camp_id || null, `Donation passed (collection ${collection_id})`, subject, text]
        );
      }

      return res.json({ ok: true, overall_status, next_eligible_date: nextEligibleDate });
    } else {
      // Reactive case
      const reactiveTests = computed.reactive;
      const subject = 'Life Link — Important: Your donation test result';
      const text = `Hello ${donor.donor_name || 'Donor'},\n\nOne or more screening tests for your donation (ID: ${collection_id}) on ${testedAtStr} returned reactive: ${reactiveTests.join(', ')}.\n\nPlease consult your healthcare provider for confirmatory testing.`;
      const html = `<!doctype html><html><body>
        <h2>Donation Test — Action Required</h2>
        <p>Hello ${donor.donor_name || 'Donor'},</p>
        <p>One or more screening tests for your donation (ID: <b>${collection_id}</b>) on <b>${testedAtStr}</b> returned reactive:</p>
        <ul>${reactiveTests.map(t => `<li>${t}</li>`).join('')}</ul>
        <p>Please consult your healthcare provider for confirmatory testing.</p>
        </body></html>`;

      if (recipientEmail) {
        try {
          if (sendMail) await sendMail(recipientEmail, subject, text, html);
          else await mailerAttach.sendMailWithAttachment(recipientEmail, subject, text, html, []);
          await pool.query(
            `INSERT INTO public.notifications (user_id, camp_id, message, subject, body, recipient_email, is_read, scheduled_at, status, channel, created_at, sent_at)
             VALUES ($1, $2, $3, $4, $5, $6, false, now()::date, 'Sent', 'Email', now(), now())`,
            [donor.user_id || null, coll.camp_id || null, `Donation reactive (collection ${collection_id})`, subject, text, recipientEmail]
          );
        } catch (err) {
          console.error('send mail failed (Reactive):', err);
          await pool.query(
            `INSERT INTO public.notifications (user_id, camp_id, message, subject, body, recipient_email, is_read, scheduled_at, status, channel, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, false, now()::date, 'Failed', 'Email', now())`,
            [donor.user_id || null, coll.camp_id || null, `Donation reactive (collection ${collection_id})`, subject, text, recipientEmail]
          );
        }
      } else {
        await pool.query(
          `INSERT INTO public.notifications (user_id, camp_id, message, subject, body, is_read, scheduled_at, status, channel, created_at)
           VALUES ($1, $2, $3, $4, $5, false, now()::date, 'Pending', 'Email', now())`,
          [donor.user_id || null, coll.camp_id || null, `Donation reactive (collection ${collection_id})`, subject, text]
        );
      }

      return res.json({ ok: true, overall_status, reactiveTests });
    }
  } catch (err) {
    try { if (!released) await client.query('ROLLBACK'); } catch (e) {}
    try { if (!released) client.release(); } catch (e) {}
    console.error('updateTesting error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  } finally {
    try { if (!released) client.release(); } catch (e) {}
  }
}

/**
 * listTesting / getTesting
 */
async function listTesting(req, res) {
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
    if (from) { where.push(`bt.tested_at::date >= $${idx++}::date`); params.push(from); }
    if (to)   { where.push(`bt.tested_at::date <= $${idx++}::date`); params.push(to); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM public.blood_testing bt
      JOIN public.blood_collection bc ON bc.collection_id = bt.collection_id
      ${whereSql}
    `;
    const cRes = await pool.query(countSql, params);
    const total = cRes.rows[0].total;

    const sql = `
      SELECT bt.test_id, bt.collection_id, bc.donor_id, d.donor_name as donor_name, d.email as donor_email,
             bc.centre_id, bc.camp_id, bt.blood_group_id, bt.hiv, bt.hbsag, bt.hcv, bt.syphilis, bt.malaria,
             bt.overall_status, bt.tested_at
      FROM public.blood_testing bt
      JOIN public.blood_collection bc ON bc.collection_id = bt.collection_id
      LEFT JOIN public.donors d ON d.donor_id = bc.donor_id
      ${whereSql}
      ORDER BY bt.tested_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);
    const r = await pool.query(sql, params);
    return res.json({ meta: { total, page, limit, pages: Math.ceil(total / limit) }, data: r.rows });
  } catch (err) {
    console.error('listTesting error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

async function getTesting(req, res) {
  const { test_id } = req.params;
  try {
    const q = `
      SELECT bt.test_id, bt.collection_id, bc.donor_id, d.donor_name as donor_name, d.email as donor_email,
             bc.centre_id, bc.camp_id, bt.blood_group_id, bt.hiv, bt.hbsag, bt.hcv, bt.syphilis, bt.malaria,
             bt.overall_status, bt.tested_at
      FROM public.blood_testing bt
      JOIN public.blood_collection bc ON bc.collection_id = bt.collection_id
      LEFT JOIN public.donors d ON d.donor_id = bc.donor_id
      WHERE bt.test_id = $1
      LIMIT 1
    `;
    const r = await pool.query(q, [test_id]);
    if (!r.rowCount) return res.status(404).json({ message: 'Test record not found' });
    const row = r.rows[0];
    const user = req.user || {};
    const role = user.role || 'Unknown';
    if (['Organizer', 'LabStaff'].includes(role) && String(user.centre_id) !== String(row.centre_id)) {
      return res.status(403).json({ message: 'Forbidden: you are not authorized for this centre' });
    }
    return res.json({ data: row });
  } catch (err) {
    console.error('getTesting error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

module.exports = { updateTesting, listTesting, getTesting };
