// src/jobs/campReminderJob.js
const cron = require('node-cron');
const pool = require('../db/db');
const sendMail = require('../utils/email');

cron.schedule('0 8 * * *', async () => { // 08:00 IST
  try {
    console.log('Running camp reminder job (Asia/Kolkata)');
    const now = new Date(); // server tz; cron schedule uses timezone option below
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear(); const mm = String(tomorrow.getMonth()+1).padStart(2,'0'); const dd = String(tomorrow.getDate()).padStart(2,'0');
    const tomDateStr = `${yyyy}-${mm}-${dd}`;

    // find approved camps happening tomorrow
    const q = `SELECT c.camp_id, c.camp_name, c.camp_date, c.camp_time, c.district_id, c.location, o.contact_person, o.email AS organizer_email
               FROM camps c LEFT JOIN camp_organizers o ON c.organizer_id = o.organizer_id
               WHERE c.status = 'Approved' AND c.camp_date = $1`;
    const res = await pool.query(q, [tomDateStr]);
    for (const camp of res.rows) {
      // get users in district
      const users = (await pool.query('SELECT id, name, email FROM users WHERE district_id = $1', [camp.district_id])).rows;
      const msg = `Reminder: camp "${camp.camp_name}" is tomorrow (${camp.camp_date}) at ${camp.location}`;

      // db notifications and mail
      for (const u of users) {
        await pool.query('INSERT INTO notifications (user_id, camp_id, message, is_read, created_at) VALUES ($1,$2,$3,false,now())', [u.id, camp.camp_id, msg]);
        if (!u.email) continue;
        try { await sendMail(u.email, `Reminder: ${camp.camp_name} is tomorrow`, `Hi ${u.name||''},\n\n${msg}`, `<p>Hi ${u.name||''},</p><p>${msg}</p>`); }
        catch(e){ console.error('camp reminder mail failed', e); }
      }

      // notify organizer too
      await pool.query('INSERT INTO notifications (organizer_id, camp_id, message, is_read, created_at) VALUES ($1,$2,$3,false,now())', [camp.organizer_id, camp.camp_id, `Reminder: your camp "${camp.camp_name}" is tomorrow`]);
      if (camp.organizer_email) {
        try { await sendMail(camp.organizer_email, `Reminder: your camp "${camp.camp_name}" is tomorrow`, `Hi ${camp.contact_person||''},\n\nYour camp is tomorrow: ${camp.camp_date} at ${camp.location}`); }
        catch(e){ console.error('organizer reminder failed', e); }
      }
    }
  } catch (err) {
    console.error('camp reminder job failed', err);
  }
}, {
  timezone: 'Asia/Kolkata'
});
