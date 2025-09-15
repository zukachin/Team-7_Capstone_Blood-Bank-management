// src/jobs/notificationDispatcher.js
const cron = require('node-cron');
const db = require('../db/db');
const sendMail = require('../utils/email');
const TIMEZONE = process.env.TIMEZONE || 'Asia/Kolkata';

async function dispatchTodayNotifications() {
  const client = await db.getClient();
  try {
    const todayRes = await client.query('SELECT now()::date as today');
    const today = todayRes.rows[0].today;

    const q = `SELECT notification_id, user_id, subject, body
               FROM public.notifications
               WHERE scheduled_at = $1 AND status = 'Pending'`;
    const r = await client.query(q, [today]);

    for (const row of r.rows) {
      try {
        let recipientEmail = null;
        if (row.user_id) {
          const u = await client.query('SELECT email FROM public.users WHERE id = $1 LIMIT 1', [row.user_id]);
          if (u.rowCount) recipientEmail = u.rows[0].email;
        }
        if (!recipientEmail) {
          // can't resolve recipient — mark failed
          await client.query('UPDATE public.notifications SET status = $1 WHERE notification_id = $2', ['Failed', row.notification_id]);
          console.warn('notificationDispatcher: no recipient for', row.notification_id);
          continue;
        }

        await sendMail(recipientEmail, row.subject || 'Notification', row.body || '', row.body || '');
        await client.query('UPDATE public.notifications SET status = $1, sent_at = now() WHERE notification_id = $2', ['Sent', row.notification_id]);
        console.log('notificationDispatcher: sent', row.notification_id, 'to', recipientEmail);
      } catch (err) {
        console.error('notificationDispatcher: send failed for', row.notification_id, err);
        await client.query('UPDATE public.notifications SET status = $1 WHERE notification_id = $2', ['Failed', row.notification_id]);
      }
    }
  } catch (err) {
    console.error('notificationDispatcher error', err);
  } finally {
    client.release();
  }
}

function startNotificationDispatcher() {
  // schedule at 08:00 Asia/Kolkata daily
  cron.schedule('0 8 * * *', () => {
    console.log('notificationDispatcher: running at', new Date().toISOString());
    dispatchTodayNotifications();
  }, { scheduled: true, timezone: TIMEZONE });

  console.log('notificationDispatcher scheduled (daily at 08:00 ' + TIMEZONE + ')');
}

module.exports = { startNotificationDispatcher, dispatchTodayNotifications };
