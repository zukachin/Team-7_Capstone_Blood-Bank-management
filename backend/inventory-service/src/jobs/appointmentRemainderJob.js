// src/jobs/appointmentReminderJob.js
const cron = require('node-cron');
const pool = require('../db/db');
const sendMail = require('../utils/email');

// schedule: run every day at 08:00 IST
cron.schedule('0 8 * * *', async () => {
  try {
    console.log('Running appointment reminder job (Asia/Kolkata)');

    // compute tomorrow's date in YYYY-MM-DD (server tz could differ, so we convert using IST offset)
    const now = new Date();
    // convert to IST by adding offset (if your server already in IST adjust accordingly)
    // Better: use moment-timezone in production; here we compute naive tomorrow in local time.
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    const tomDateStr = `${y}-${m}-${d}`;

    // find approved appointments for tomorrow
    const q = `SELECT a.appointment_id, a.user_id, a.appointment_date, a.appointment_time, u.name AS user_name, u.email AS user_email, c.centre_name
               FROM appointments a
               LEFT JOIN users u ON a.user_id = u.id
               LEFT JOIN centres c ON a.centre_id::text = c.centre_id::text
               WHERE a.status = 'Approved' AND a.appointment_date = $1`;
    const res = await pool.query(q, [tomDateStr]);

    for (const appt of res.rows) {
      if (!appt.user_email) {
        console.warn('Reminder skipped - no user_email for appointment', appt.appointment_id);
        continue;
      }

      const subject = 'Reminder: Your Life Link Appointment is Tomorrow';
      const text = `Hi ${appt.user_name || ''},\n\nThis is a reminder that your appointment is scheduled for ${appt.appointment_date} at ${appt.appointment_time || 'N/A'} at ${appt.centre_name || 'the centre'}.\n\nPlease arrive on time.`;
      const html = `<div style="font-family:Arial,sans-serif;">
        <h3>Life Link — Appointment Reminder</h3>
        <p>Hi <b>${appt.user_name || ''}</b>,</p>
        <p>This is a reminder that your appointment is scheduled for <b>${appt.appointment_date}</b> at <b>${appt.appointment_time || 'N/A'}</b> at <b>${appt.centre_name || 'the centre'}</b>.</p>
        <p>Please arrive 10 minutes early and carry your ID.</p>
        <p>— Life Link Team</p>
      </div>`;

      // insert notification row (user)
      try {
        await pool.query('INSERT INTO notifications (user_id, appointment_id, message, is_read, created_at) VALUES ($1,$2,$3,false,now())',
          [appt.user_id, appt.appointment_id, `Reminder: your appointment is on ${appt.appointment_date} at ${appt.appointment_time || 'N/A'}`]);
      } catch (nerr) {
        console.error('Failed to insert reminder notification', nerr);
      }

      try {
        await sendMail(appt.user_email, subject, text, html);
        console.log('Sent reminder to', appt.user_email, 'for appt', appt.appointment_id);
      } catch (mailErr) {
        console.error('Failed to send reminder email', mailErr);
      }
    }
  } catch (err) {
    console.error('appointment reminder job failed', err);
  }
}, {
  timezone: 'Asia/Kolkata'
});
