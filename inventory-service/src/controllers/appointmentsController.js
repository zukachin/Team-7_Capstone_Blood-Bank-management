// src/controllers/appointmentsController.js
const pool = require('../db/db');
const sendMail = require('../utils/email'); // your existing util

function daysBetween(dateA, dateB) {
  // returns difference in days: dateA - dateB
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((dateA - dateB) / msPerDay);
}

exports.createAppointment = async (req, res) => {
  try {
    const user = req.user; // from verifyUserWithDonor
    if (!user || !user.user_id) return res.status(401).json({ message: 'Unauthenticated' });

    const {
      district_id,
      centre_id,
      appointment_date = null,      // expected 'YYYY-MM-DD' or null
      appointment_time = null,
      weight = null,
      under_medication = 'No',
      last_donation_date = null    // expected 'YYYY-MM-DD' or null
    } = req.body;

    if (!district_id || !centre_id) return res.status(400).json({ message: 'district_id and centre_id required' });

    // basic validations
    if (weight !== null && Number(weight) <= 45) {
      return res.status(400).json({ message: 'Weight must be greater than 45 kg' });
    }

    if (!last_donation_date) {
      // require last_donation_date — you can relax if you prefer
      return res.status(400).json({ message: 'last_donation_date is required' });
    }

    // parse dates
    const today = new Date();
    const lastDonation = new Date(last_donation_date);
    if (isNaN(lastDonation)) return res.status(400).json({ message: 'Invalid last_donation_date format' });

    // If user provided appointment_date, compute difference vs last donation. Otherwise compare to today.
    let compareDate;
    if (appointment_date) {
      compareDate = new Date(appointment_date);
      if (isNaN(compareDate)) return res.status(400).json({ message: 'Invalid appointment_date format' });
    } else {
      compareDate = today;
    }

    const diffDays = daysBetween(compareDate, lastDonation);
    if (diffDays < 90) {
      return res.status(400).json({ message: 'At least 90 days must have passed since last donation' });
    }

    // verify centre exists & belongs to district
    const centreRow = (await pool.query(
      'SELECT centre_id, district_id FROM centres WHERE centre_id::text = $1 LIMIT 1',
      [String(centre_id)]
    )).rows[0];
    if (!centreRow) return res.status(400).json({ message: 'Invalid centre_id' });
    if (Number(centreRow.district_id) !== Number(district_id)) return res.status(400).json({ message: 'Selected centre does not belong to selected district' });

    // duplicate check (Pending or Approved)
    const dup = await pool.query(
      `SELECT appointment_id FROM appointments WHERE user_id = $1 AND appointment_date = $2 AND status IN ('Pending','Approved') LIMIT 1`,
      [user.user_id, appointment_date]
    );
    if (dup.rowCount) return res.status(409).json({ message: 'You already have an appointment on this date' });

    // insert appointment (status Pending)
    const insertSql = `INSERT INTO appointments
      (user_id, district_id, centre_id, appointment_date, appointment_time, weight, under_medication, last_donation_date, status, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Pending', now(), now()) RETURNING *`;
    const result = await pool.query(insertSql, [
      user.user_id, district_id, centre_id, appointment_date, appointment_time, weight, under_medication, last_donation_date
    ]);
    const appointment = result.rows[0];

    // notify centre admins DB-only (you already have helper notifyCentreAdmins)
   // notifyCentreAdmins(centre_id, appointment).catch(e => console.error('notifyCentreAdmins failed', e));

    // confirmation email to user
    try {
      await sendMail(
         "Life Link - Appointment Request Received",
    `Hi ${user.name}, your appointment request has been received.\n\nDate: ${appointment_date}\nTime: ${appointment_time}\nCentre: ${centre_id}\n\nStatus: Pending`,
    `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 25px;
      }
      .header {
        background-color: #d7d124ff;
        color: #fff;
        text-align: center;
        padding: 15px;
        border-radius: 12px 12px 0 0;
        font-size: 20px;
        font-weight: bold;
      }
      .content {
        color: #333;
        font-size: 15px;
        line-height: 1.6;
      }
      .details {
        background: #f1fdfc;
        padding: 12px;
        border-left: 4px solid #d7d124ff;
        margin: 15px 0;
        border-radius: 6px;
      }
      .details li {
        margin: 6px 0;
      }
      .status {
        font-weight: bold;
        color: #e63946;
      }
      .footer {
        text-align: center;
        color: #777;
        font-size: 13px;
        margin-top: 20px;
      }
      .footer b {
        color: #f1250aff;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Life Link Appointment Request</div>
      <div class="content">
        <p>Hi <b>${user.name}</b>,</p>
        <p>Your appointment request has been received with the following details:</p>
        <div class="details">
          <ul>
            <li><b>Date:</b> ${appointment_date || 'Not scheduled yet'}</li>
            <li><b>Time:</b> ${appointment_time || 'Not scheduled yet'}</li>
            <li><b>Centre:</b> ${centre_id}</li>
          </ul>
        </div>
        <p>Status: <span class="status">Pending approval</span></p>
        <p>You will receive another email once your appointment is confirmed or declined.</p>
        <p>Thank you for choosing <b>Life Link</b>.</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} <b>Life Link</b> | All rights reserved
      </div>
    </div>
  </body>
</html>
`
  );
    } catch (mailErr) {
      console.error('createAppointment: failed to send confirmation email', mailErr);
      // don't fail the request — appointment already saved
    }

    return res.status(201).json({ appointment });
  } catch (err) {
    console.error("createAppointment error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// cancel (soft delete) appointment by owner
exports.deleteAppointment = async (req, res) => {
  try {
    const user = req.user; // from verifyUserWithDonor
    if (!user || !user.user_id) return res.status(401).json({ message: 'Unauthenticated' });

    const appointmentId = parseInt(req.params.id, 10);
    if (!appointmentId) return res.status(400).json({ message: 'Invalid appointment id' });

    // fetch appointment
    const aRes = await pool.query('SELECT * FROM appointments WHERE appointment_id = $1 LIMIT 1', [appointmentId]);
    if (!aRes.rowCount) return res.status(404).json({ message: 'Appointment not found' });
    const appointment = aRes.rows[0];

    // only owner can cancel
    if (String(appointment.user_id) !== String(user.user_id)) {
      return res.status(403).json({ message: 'Not allowed to cancel this appointment' });
    }

    // optional: only allow cancelling Pending/Approved (or allow all)
    if (!['Pending','Approved'].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot cancel appointment with status ${appointment.status}` });
    }

    // soft-cancel
    await pool.query('UPDATE appointments SET status=$1, updated_at=now() WHERE appointment_id=$2', ['Cancelled', appointmentId]);

    // insert notification for admins (optional) and for user
    //await pool.query('INSERT INTO notifications (user_id, appointment_id, message, is_read, created_at) VALUES ($1,$2,$3,false,now())', [user.user_id, appointmentId, `You have cancelled appointment #${appointmentId}`]);

    // notify centre admins (optional) — insert notifications for admins of centre
    const adminsRes = await pool.query('SELECT admin_id FROM admins WHERE centre_id::text = $1', [String(appointment.centre_id)]);
    for (const ad of adminsRes.rows) {
      //await pool.query('INSERT INTO notifications (admin_id, appointment_id, message, is_read, created_at) VALUES ($1,$2,$3,false,now())', [ad.admin_id, appointmentId, `Appointment #${appointmentId} cancelled by user`]);
    }

    // email confirmation to user
    try {
      await sendMail(user.email, 
      "Life Link - Appointment Cancelled",
  `Hi ${user.name}, your appointment #${appointmentId} has been cancelled.`,
  `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 25px;
      }
      .header {
        background-color: #e63946; /* consistent red theme */
        color: #fff;
        text-align: center;
        padding: 15px;
        border-radius: 12px 12px 0 0;
        font-size: 20px;
        font-weight: bold;
      }
      .content {
        color: #333;
        font-size: 15px;
        line-height: 1.6;
      }
      .details {
        background: #fff5f5; /* light red background */
        padding: 12px;
        border-left: 4px solid #e63946;
        margin: 15px 0;
        border-radius: 6px;
      }
      .status {
        font-weight: bold;
        color: #e63946; /* red for cancelled */
      }
      .footer {
        text-align: center;
        color: #777;
        font-size: 13px;
        margin-top: 20px;
      }
      .footer b {
        color: #e63946;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Life Link Appointment Cancelled</div>
      <div class="content">
        <p>Hi <b>${user.name}</b>,</p>
        <p>We regret to inform you that your appointment <b>#${appointmentId}</b> has been <span class="status">cancelled</span>.</p>
        <div class="details">
          If this was not expected or you’d like to reschedule, please contact our support team
          or book a new appointment through the <b>Life Link</b> portal.
        </div>
        <p>We apologize for any inconvenience caused.</p>
        <p>Best regards,<br/><b>Life Link Team</b></p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} <b>Life Link</b> | All rights reserved
      </div>
    </div>
  </body>
</html>
`
);  } 
    catch (e) {
      console.error('Failed to send cancellation email', e);
    }

    return res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    console.error('deleteAppointment', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
