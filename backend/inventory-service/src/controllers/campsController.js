// src/controllers/campsController.js
const pool = require('../db/db');
const sendMail = require('../utils/email'); // your sendMail(to, subject, text, html)

function isValidDateStr(s) {
  return !!s && !isNaN(new Date(s));
}

function daysBetween(a,b){ return Math.floor( (a - b) / (24*60*60*1000) ); }

// Organizer creates a camp
exports.createCamp = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.user_id) return res.status(401).json({ message: 'Unauthenticated' });

    const { organizer_id, centre_id, state_id, district_id, camp_name, location, camp_date, camp_time, has_venue=false, organized_before=false } = req.body;

    // basic validations
    if (!organizer_id || !centre_id || !state_id || !district_id || !camp_name || !location || !camp_date) {
      return res.status(400).json({ message: 'organizer_id, centre_id, state_id, district_id, camp_name, location, camp_date required' });
    }
    if (!isValidDateStr(camp_date)) return res.status(400).json({ message: 'Invalid camp_date format' });

    // organizer must belong to user
    const orgRes = await pool.query('SELECT * FROM camp_organizers WHERE organizer_id = $1 LIMIT 1', [organizer_id]);
    if (!orgRes.rowCount) return res.status(404).json({ message: 'Organizer not found' });
    const organizer = orgRes.rows[0];
    if (Number(organizer.user_id) !== Number(user.user_id)) return res.status(403).json({ message: 'Not allowed: organizer does not belong to you' });

    // date must be in the future (>= tomorrow)
    const today = new Date(); today.setHours(0,0,0,0);
    const campDate = new Date(camp_date);
    campDate.setHours(0,0,0,0);
    if (campDate <= today) return res.status(400).json({ message: 'camp_date must be in the future' });

    // optional: validate centre belongs to district
    const centreCheck = (await pool.query('SELECT centre_id, district_id FROM centres WHERE centre_id::text = $1 LIMIT 1', [String(centre_id)])).rows[0];
    if (!centreCheck) return res.status(400).json({ message: 'Invalid centre_id' });
    if (Number(centreCheck.district_id) !== Number(district_id)) return res.status(400).json({ message: 'Selected centre does not belong to selected district' });

    // insert camp (status Pending)
    const q = `INSERT INTO camps (organizer_id, centre_id, state_id, district_id, camp_name, location, camp_date, camp_time, has_venue, organized_before, status, created_at, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Pending', now(), now()) RETURNING *`;
    const r = await pool.query(q, [organizer_id, centre_id, state_id, district_id, camp_name, location, camp_date, camp_time || null, has_venue, organized_before]);
    const camp = r.rows[0];

    // notify centre admins about new camp request (DB notifications)
    const admins = (await pool.query('SELECT admin_id, email FROM admins WHERE centre_id::text = $1', [String(centre_id)])).rows;
    for (const a of admins) {
      await pool.query('INSERT INTO notifications (admin_id, organizer_id, camp_id, message, is_read, created_at) VALUES ($1,$2,$3,$4,false,now())', [a.admin_id, organizer_id, camp.camp_id, `New camp request (#${camp.camp_id})`]);
      // optionally email admins:
      try {
        if (a.email) await sendMail(a.email, 'New Camp Request', `A new camp request (#${camp.camp_id}) by ${organizer.organization_name || organizer.contact_person}`, `<p>New camp request: <b>${camp.camp_name}</b> on ${camp.camp_date}</p>`);
      } catch(e){ console.error('email admin failed', e); }
    }

    // notify organizer (their request created)
    await pool.query('INSERT INTO notifications (organizer_id, camp_id, message, is_read, created_at) VALUES ($1,$2,$3,false,now())', [organizer_id, camp.camp_id, `Your camp request (#${camp.camp_id}) has been submitted and is pending approval`]);
    try {
      await sendMail(organizer.email, 'Camp Request Submitted', `Your camp "${camp.camp_name}" has been submitted and is pending approval.` , `<p>Hi ${organizer.contact_person || ''},</p><p>Your camp "${camp.camp_name}" has been submitted and is pending approval.</p>`);
    } catch(e){ console.error('email organizer failed', e); }

    return res.status(201).json({ camp });
  } catch (err) {
    console.error('createCamp', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Admin list camps
exports.listCampsForAdmin = async (req, res) => {
  try {
    const admin = req.user;
    if (!admin || !admin.role) return res.status(401).json({ message: 'Not authenticated' });
    if (admin.role !== 'Admin' && admin.role !== 'SuperAdmin') return res.status(403).json({ message: 'Not allowed' });

    // If admin has centre assigned, limit to that centre; SuperAdmin can pass centre_id/district_id filters
    const centreId = admin.centreId;
    const { status } = req.query;
    const params = [];
    let sql = `SELECT c.*, o.organization_name, o.contact_person, o.phone AS organizer_phone, o.email AS organizer_email
               FROM camps c LEFT JOIN camp_organizers o ON c.organizer_id = o.organizer_id WHERE 1=1`;

    if (centreId) { params.push(String(centreId)); sql += ` AND c.centre_id::text = $${params.length}`; }
    if (status) { params.push(status); sql += ` AND c.status = $${params.length}`; }
    sql += ` ORDER BY c.created_at DESC LIMIT 1000`;

    const r = await pool.query(sql, params);
    return res.json({ camps: r.rows });
  } catch (err) {
    console.error('listCampsForAdmin', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Admin approve/reject camp
exports.updateCampStatus = async (req, res) => {
  try {
    const admin = req.user;
    const campId = parseInt(req.params.id, 10);
    const { action, rejection_reason } = req.body;
    if (!['approve','reject'].includes(action)) return res.status(400).json({ message: 'action must be approve|reject' });

    const campRes = await pool.query('SELECT c.*, o.email AS organizer_email, o.organizer_id, o.contact_person FROM camps c LEFT JOIN camp_organizers o ON c.organizer_id = o.organizer_id WHERE c.camp_id = $1', [campId]);
    if (!campRes.rowCount) return res.status(404).json({ message: 'Camp not found' });
    const camp = campRes.rows[0];

    // authorize admin belongs to the centre (unless SuperAdmin)
    if (admin.role !== 'SuperAdmin' && String(camp.centre_id) !== String(admin.centreId)) return res.status(403).json({ message: 'Not allowed' });

    if (action === 'approve') {
      await pool.query('UPDATE camps SET status=$1, updated_at=now() WHERE camp_id=$2', ['Approved', campId]);

      // insert notification for organizer
      await pool.query('INSERT INTO notifications (admin_id, organizer_id, camp_id, message, is_read, created_at) VALUES ($1,$2,$3,$4,false,now())', [admin.admin_id || null, camp.organizer_id, campId, `Your camp (#${campId}) has been approved`]);

      // send email to organizer
      try {
        if (camp.organizer_email) await sendMail(camp.organizer_email, 'Camp Approved', `Your camp "${camp.camp_name}" scheduled on ${camp.camp_date} is approved.`, `<p>Hi ${camp.contact_person || ''},</p><p>Your camp "${camp.camp_name}" scheduled on <b>${camp.camp_date}</b> has been <b>approved</b>.</p>`);
      } catch(e){ console.error('email organizer failed', e); }

      // BULK notify users in district (DB notifications + email) — may be heavy, consider queue
      // Get users in the district
      const users = (await pool.query('SELECT id, name, email FROM users WHERE district_id = $1', [camp.district_id])).rows;
      const msg = `Camp "${camp.camp_name}" will take place on ${camp.camp_date} at ${camp.location}. Please donate if you can.`;
      // DB notifications
      for (const u of users) {
        await pool.query('INSERT INTO notifications (user_id, camp_id, message, is_read, created_at) VALUES ($1,$2,$3,false,now())', [u.id, campId, msg]);
      }
      // send emails — do in small batches in production or via queue. Here is a simple immediate loop:
      for (const u of users) {
        if (!u.email) continue;
        try {
          await sendMail(u.email, `Blood Donation Camp: ${camp.camp_name}`, `Hi ${u.name || ''},\n\n${msg}`, `<p>Hi ${u.name || ''},</p><p>${msg}</p>`);
        } catch (e) {
          console.error('bulk email failed for user', u.id, e);
        }
      }

      return res.json({ message: 'Camp approved' });
    } else {
      // reject
      await pool.query('UPDATE camps SET status=$1, rejection_reason=$2, updated_at=now() WHERE camp_id=$3', ['Rejected', rejection_reason || null, campId]);
      // notify organizer
      await pool.query('INSERT INTO notifications (admin_id, organizer_id, camp_id, message, is_read, created_at) VALUES ($1,$2,$3,$4,false,now())', [admin.admin_id || null, camp.organizer_id, campId, `Your camp (#${campId}) has been rejected${rejection_reason ? ': ' + rejection_reason : ''}`]);
      try {
        if (camp.organizer_email) await sendMail(camp.organizer_email, 'Camp Rejected', `Your camp "${camp.camp_name}" has been rejected. ${rejection_reason || ''}`, `<p>Hi ${camp.contact_person || ''},</p><p>Your camp "${camp.camp_name}" has been <b>rejected</b>. ${rejection_reason || ''}</p>`);
      } catch(e){ console.error('email organizer failed', e); }
      return res.json({ message: 'Camp rejected' });
    }

  } catch (err) {
    console.error('updateCampStatus', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// public listing of approved camps by district
exports.getApprovedCampsByDistrict = async (req, res) => {
  try {
    const district_id = Number(req.query.district_id);
    if (!district_id) return res.status(400).json({ message: 'district_id required' });
    const r = await pool.query('SELECT * FROM camps WHERE district_id = $1 AND status = $2 ORDER BY camp_date', [district_id, 'Approved']);
    return res.json({ camps: r.rows });
  } catch (err) {
    console.error('getApprovedCampsByDistrict', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// list organizer own camps
exports.listMyCamps = async (req, res) => {
  try {
    const user = req.user;
    const org = (await pool.query('SELECT * FROM camp_organizers WHERE user_id = $1 LIMIT 1', [user.user_id])).rows[0];
    if (!org) return res.json({ camps: [] });
    const r = await pool.query('SELECT * FROM camps WHERE organizer_id = $1 ORDER BY created_at DESC', [org.organizer_id]);
    return res.json({ camps: r.rows });
  } catch (err) {
    console.error('listMyCamps', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.searchApprovedCamps = async (req, res) => {
  try {
    const { state_id, district_id, camp_date } = req.query;

    const params = [];
    let sql = `
      SELECT c.*, o.organization_name, o.contact_person, o.phone AS organizer_phone, o.email AS organizer_email
      FROM camps c
      LEFT JOIN camp_organizers o ON c.organizer_id = o.organizer_id
      WHERE c.status = 'Approved'
    `;

    if (state_id) {
      params.push(state_id);
      sql += ` AND c.state_id = $${params.length}`;
    }
    if (district_id) {
      params.push(district_id);
      sql += ` AND c.district_id = $${params.length}`;
    }
    if (camp_date) {
      params.push(camp_date);
      sql += ` AND c.camp_date = $${params.length}`;
    }

    sql += ` ORDER BY c.camp_date ASC, c.camp_time ASC`;

    const result = await pool.query(sql, params);
    return res.json({ camps: result.rows });
  } catch (err) {
    console.error("searchApprovedCamps", err);
    return res.status(500).json({ message: "Server error" });
  }
};