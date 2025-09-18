// src/controllers/appointmentsController.js
const pool = require('../db/db');
const sendMail = require('../utils/email');

function daysBetween(dateA, dateB) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((dateA - dateB) / msPerDay);
}

// ----------------- CREATE APPOINTMENT -----------------
exports.createAppointment = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.user_id) return res.status(401).json({ message: 'Unauthenticated' });

    const {
      district_id,
      centre_id,
      appointment_date = null,
      appointment_time = null,
      weight = null,
      under_medication = 'No',
      last_donation_date = null,
    } = req.body;

    if (!district_id || !centre_id) return res.status(400).json({ message: 'district_id and centre_id required' });

    if (weight !== null && Number(weight) <= 45) return res.status(400).json({ message: 'Weight must be greater than 45 kg' });

    // Validate dates
    const today = new Date();
    const lastDonation = new Date(last_donation_date);
    if (isNaN(lastDonation)) return res.status(400).json({ message: 'Invalid last_donation_date format' });

    let compareDate = appointment_date ? new Date(appointment_date) : today;
    if (appointment_date && isNaN(compareDate)) return res.status(400).json({ message: 'Invalid appointment_date format' });

    if (daysBetween(compareDate, lastDonation) < 90) return res.status(400).json({ message: 'At least 90 days must have passed since last donation' });

    // Verify centre exists
    const centreRow = (await pool.query(
      'SELECT centre_id, district_id FROM centres WHERE centre_id::text = $1 LIMIT 1',
      [String(centre_id)]
    )).rows[0];
    if (!centreRow) return res.status(400).json({ message: 'Invalid centre_id' });
    if (Number(centreRow.district_id) !== Number(district_id)) return res.status(400).json({ message: 'Selected centre does not belong to selected district' });

    // Duplicate check
    const dup = await pool.query(
      `SELECT appointment_id FROM appointments 
       WHERE user_id = $1 AND appointment_date = $2 AND status IN ('Pending','Approved') LIMIT 1`,
      [user.user_id, appointment_date]
    );
    if (dup.rowCount) return res.status(409).json({ message: 'You already have an appointment on this date' });

    // Insert appointment
    const insertSql = `
      INSERT INTO appointments
        (user_id, district_id, centre_id, appointment_date, appointment_time,
         weight, under_medication, last_donation_date, status, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Pending', now(), now())
      RETURNING *`;
    const result = await pool.query(insertSql, [
      user.user_id, district_id, centre_id, appointment_date, appointment_time,
      weight, under_medication, last_donation_date,
    ]);
    const appointment = result.rows[0];

    // Confirmation email
    try {
      const recipient = user.email || user.user_email || null;
      if (!recipient) {
        console.warn("⚠️ No email found for user, skipping confirmation email");
      } else {
        await sendMail(
  recipient,
  "Life Link - Appointment Request Received",
  `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
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
        background-color: #2a9d8f;
        color: #fff;
        text-align: center;
        padding: 15px;
        border-radius: 12px 12px 0 0;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        color: #333;
        font-size: 16px;
        line-height: 1.6;
        margin-top: 15px;
      }
      .details {
        background: #e0f7f5;
        border-left: 5px solid #2a9d8f;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .details b {
        color: #2a9d8f;
      }
      .status {
        font-weight: bold;
        color: #f4a261;
      }
      .footer {
        text-align: center;
        color: #777;
        font-size: 13px;
        margin-top: 25px;
      }
      .footer b {
        color: #2a9d8f;
      }
      a {
        color: #2a9d8f;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
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

        console.log(`📨 Confirmation email sent to ${recipient}`);
      }
    } catch (mailErr) {
      console.error('createAppointment: failed to send confirmation email', mailErr);
    }

    return res.status(201).json({ appointment });
  } catch (err) {
    console.error("createAppointment error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ----------------- DELETE APPOINTMENT -----------------
exports.deleteAppointment = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.user_id) return res.status(401).json({ message: 'Unauthenticated' });

    const appointmentId = parseInt(req.params.id, 10);
    if (!appointmentId) return res.status(400).json({ message: 'Invalid appointment id' });

    const aRes = await pool.query('SELECT * FROM appointments WHERE appointment_id = $1 LIMIT 1', [appointmentId]);
    if (!aRes.rowCount) return res.status(404).json({ message: 'Appointment not found' });
    const appointment = aRes.rows[0];

    if (String(appointment.user_id) !== String(user.user_id)) return res.status(403).json({ message: 'Not allowed to cancel this appointment' });
    if (!['Pending','Approved'].includes(appointment.status)) return res.status(400).json({ message: `Cannot cancel appointment with status ${appointment.status}` });

    await pool.query('UPDATE appointments SET status=$1, updated_at=now() WHERE appointment_id=$2', ['Cancelled', appointmentId]);

    // Cancellation email
    try {
      const recipient = user.email || user.user_email || null;
      if (!recipient) {
        console.warn("⚠️ No email found for user, skipping cancellation email");
      } else {
        await sendMail(
          recipient,
          
  "Life Link - Appointment Cancelled",
  `Hi ${user.name}, your appointment #${appointmentId} has been cancelled.`,
  `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
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
        background-color: #e63946;
        color: #fff;
        text-align: center;
        padding: 15px;
        border-radius: 12px 12px 0 0;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        color: #333;
        font-size: 16px;
        line-height: 1.6;
        margin-top: 15px;
      }
      .details {
        background: #ffe6e6;
        border-left: 5px solid #e63946;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .details b {
        color: #e63946;
      }
      .footer {
        text-align: center;
        color: #777;
        font-size: 13px;
        margin-top: 25px;
      }
      .footer b {
        color: #e63946;
      }
      a {
        color: #e63946;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Life Link Appointment Cancelled</div>
      <div class="content">
        <p>Hi <b>${user.name}</b>,</p>
        <p>We regret to inform you that your appointment <b>#${appointmentId}</b> has been <span style="color:red;">cancelled</span>.</p>
        <div class="details">
          If this was not expected or you’d like to reschedule, please contact our support team or book a new appointment through the <a href="https://your-portal-link.com"><b>Life Link</b></a> portal.
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
);

        console.log(`📨 Cancellation email sent to ${recipient}`);
      }
    } catch (e) {
      console.error('Failed to send cancellation email', e);
    }

    return res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    console.error('deleteAppointment error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
