// assumes module.exports = sendMail

// exports.listAppointmentsForAdmin = async (req, res) => {
//   try {
//     const admin = req.user;
//     if (!admin || !admin.role) return res.status(401).json({ message: 'Not authenticated' });

//     const centreId = admin.centreId;
//     if (!centreId) return res.status(400).json({ message: 'Admin has no centre assigned' });

//     const statusMap = {
//       pending: "Pending",
//       approved: "Approved",
//       rejected: "Rejected",
//       cancelled: "Cancelled",
//       completed: "Completed",
//     };

//     let status = req.query.status || null;
//     if (status) {
//       status = status.toLowerCase();
//       if (!statusMap[status]) {
//         return res.status(400).json({ message: `Invalid appointment status: ${status}` });
//       }
//       status = statusMap[status];
//     }

//     const params = [centreId];
//     let sql = `SELECT a.*, u.name AS user_name, u.email AS user_email, u.id AS user_id
//                FROM appointments a
//                LEFT JOIN users u ON a.user_id = u.id
//                WHERE a.centre_id::text = $1`;
//     if (status) {
//       params.push(status);
//       sql += ` AND a.status = $${params.length}`;
//     }
//     sql += ` ORDER BY a.created_at DESC LIMIT 1000`;

//     const r = await pool.query(sql, params);

//     return res.json({ appointments: r.rows });
//   } catch (err) {
//     console.error("listAppointmentsForAdmin ERROR:", err.message);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };


const pool = require('../db/db');
const sendMail = require('../utils/email');
const { generateAppointmentLetter } = require('../utils/pdf');


exports.listAppointmentsForAdmin = async (req, res) => {
  try {
    const admin = req.user;
    if (!admin || !admin.role) return res.status(401).json({ message: 'Not authenticated' });

    const centreId = admin.centreId;
    if (!centreId) return res.status(400).json({ message: 'Admin has no centre assigned' });

    const statusFilter = req.query.status;

    const params = [centreId];
    let query = `
      SELECT a.*, u.name AS user_name, u.email AS user_email, u.id AS user_id
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.centre_id::text = $1
    `;

    if (statusFilter && statusFilter !== 'All') {
      query += ` AND a.status = $2`;
      params.push(statusFilter);
    }

    query += ` ORDER BY a.created_at DESC LIMIT 1000`;

    const result = await pool.query(query, params);

    return res.json({ appointments: result.rows });
  } catch (err) {
    console.error("listAppointmentsForAdmin ERROR:", err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.updateAppointmentStatus = async (req, res) => {
  try {
    const admin = req.user;
    const appointmentId = parseInt(req.params.id, 10);

    // read body early
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'action must be approve|reject' });

    const appRes = await pool.query(
      `SELECT a.*, u.name AS user_name, u.email AS user_email, u.id AS user_id
       FROM appointments a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.appointment_id = $1`,
      [appointmentId]
    );
    if (!appRes.rowCount) return res.status(404).json({ message: 'Appointment not found' });
    const appointment = appRes.rows[0];

    if (admin.role !== 'SuperAdmin' && String(appointment.centre_id) !== String(admin.centreId)) {
      return res.status(403).json({ message: 'Not allowed to update this appointment' });
    }

    if (action === 'approve') {
      const seq = await pool.query(`SELECT nextval('appointment_token_seq') AS token`);
      const token_no = seq.rows[0].token.toString();

      const scheduled_date = req.body.scheduled_date || appointment.appointment_date;
      const scheduled_time = req.body.scheduled_time || appointment.appointment_time;

      await pool.query(
        `UPDATE appointments
         SET status = 'Approved', token_no = $1, approved_by = $2, approved_at = now(), appointment_date = $3, appointment_time = $4, updated_at = now()
         WHERE appointment_id = $5`,
        [token_no, admin.admin_id || null, scheduled_date, scheduled_time, appointmentId]
      );

      // create/update donors mapping (optional)
      const userId = appointment.user_id;
      const donorCheck = await pool.query('SELECT donor_id FROM donors WHERE user_id = $1 LIMIT 1', [userId]);
      if (!donorCheck.rowCount) {
        const u = (await pool.query('SELECT name,email,phone,age,gender,address,state_id,district_id FROM users WHERE id = $1 LIMIT 1', [userId])).rows[0] || {};
        await pool.query(
          `INSERT INTO donors (
    user_id, donor_name, dob, age, gender, mobile_no,
    email, address, state_id, district_id, centre_id, created_at
  ) VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8, $9, $10, $11, now()
  )`,
          [
            userId,
            u.name || null,
            null, // dob
            u.age || null,
            u.gender || null,
            u.phone || null,
            u.email || null,
            u.address || null,
            u.state_id || null,
            u.district_id || null,
            appointment.centre_id || null
          ]
        );

      } else {
        await pool.query('UPDATE donors SET centre_id = $1, updated_at = now() WHERE user_id = $2', [appointment.centre_id, userId]);
      }

      // insert notification for user
      const userMessage = `Your appointment (#${appointmentId}) has been approved. Token: ${token_no}`;
      //await insertNotification({ admin_id: admin.admin_id || null, user_id: userId, appointment_id: appointmentId, message: userMessage });

      // send approval email — use user_email & user_name fields that exist in appointment row
      if (appointment.user_email) {
        await sendMail(
          appointment.user_email,
          "Appointment Approved",
          `Hi ${appointment.user_name || ''}, your appointment has been approved.\n\nDate: ${scheduled_date || appointment.appointment_date}\nTime: ${scheduled_time || appointment.appointment_time}\nToken: ${token_no}`,
          `<p>Hi <b>${appointment.user_name || ''}</b>,</p>
           <p>Your appointment has been <b>Approved</b>.</p>
           <p>Date: ${scheduled_date || appointment.appointment_date}<br>
              Time: ${scheduled_time || appointment.appointment_time}<br>
              Token No: <b>${token_no}</b></p>`
        );
      } else {
        console.warn('No user_email for appointment', appointmentId);
      }

      return res.json({ message: 'Appointment approved', token_no });
    } else {
      // reject
      const reason = req.body.rejection_reason || null;
      await pool.query('UPDATE appointments SET status=$1, rejection_reason=$2, approved_by=$3, approved_at=now(), updated_at=now() WHERE appointment_id=$4', ['Rejected', reason, admin.admin_id || null, appointmentId]);

      // insert DB notification
      const userMessage = `Your appointment (#${appointmentId}) was rejected${reason ? ': ' + reason : ''}`;
      // await insertNotification({ admin_id: admin.admin_id || null, user_id: appointment.user_id, appointment_id: appointmentId, message: userMessage });

      // send rejection email using user_email & user_name
      if (appointment.user_email) {
        await sendMail(
          appointment.user_email,
          "Life Link Appointment Update",
          `Hi ${appointment.user_name || ''}, we regret to inform you that your appointment request has been declined. Reason: ${reason || "Not specified"}`,
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
        background-color: #e63946;
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
      .reason {
        background: #f1f1f1;
        padding: 12px;
        border-left: 4px solid #e63946;
        margin: 15px 0;
        border-radius: 6px;
        font-style: italic;
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
      <div class="header">Life Link Appointment Update</div>
      <div class="content">
        <p>Dear <b>${appointment.user_name || ''}</b>,</p>
        <p>
          Thank you for your interest in scheduling an appointment with <b>Life Link</b>.
          After careful review, we regret to inform you that your appointment request has been
          <b style="color:#e63946;">declined</b>.
        </p>
        <div class="reason">
          <b>Reason:</b> ${reason || "Not specified"}
        </div>
        <p>
          We apologize for any inconvenience this may cause. Please feel free to reach out to our support
          team if you have any questions or wish to reschedule in the future.
        </p>
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
      } else {
        console.warn('No user_email for appointment', appointmentId);
      }

      return res.json({ message: 'Appointment rejected' });
    }
  } catch (err) {
    console.error('updateAppointmentStatus', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


// const { generateAppointmentLetter } = require('../utils/pdf');

exports.getAppointmentPDF = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const result = await pool.query(
      `SELECT a.*, c.name AS centre_name, c.address AS centre_address
       FROM appointments a
       JOIN centres c ON a.centre_id = c.centre_id
       WHERE a.appointment_id = $1 AND a.user_id = $2 AND a.status = 'Approved'`,
      [id, user.user_id]
    );

    if (!result.rowCount) return res.status(404).json({ message: 'Approved appointment not found' });

    const appointment = result.rows[0];

    const pdfBuffer = await generateAppointmentLetter(
      {
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      appointment,
      {
        name: appointment.centre_name,
        address: appointment.centre_address
      }
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=appointment-letter.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('getAppointmentPDF error', err);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};
