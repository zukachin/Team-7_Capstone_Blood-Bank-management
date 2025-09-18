// // utils/email.js
// require('dotenv').config();
// const nodemailer = require('nodemailer');

// function buildTransportOptions() {
//   // prefer explicit host if provided
//   if (process.env.MAIL_HOST) {
//     return {
//       host: process.env.MAIL_HOST,
//       port: Number(process.env.MAIL_PORT || 587),
//       secure: (process.env.MAIL_SECURE === 'true'), // true for 465, false for 587
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS
//       }
//     };
//   }

//   // fallback to named service (e.g., gmail) if provided
//   if (process.env.MAIL_SERVICE) {
//     return {
//       service: process.env.MAIL_SERVICE,
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS
//       }
//     };
//   }

//   // last resort: throw so we know config is missing
//   throw new Error('No MAIL_HOST or MAIL_SERVICE configured in env');
// }

// async function createTransporter() {
//   const opts = buildTransportOptions();
//   const transporter = nodemailer.createTransport(opts);
//   // verify only once per process; wrap in try/catch where used
//   await transporter.verify(); // will throw if unable to connect/auth
//   return transporter;
// }

// async function sendOtpEmail(to, otp) {
//   try {
//     const transporter = await createTransporter();
//     const info = await transporter.sendMail({
//       from: process.env.MAIL_FROM || process.env.MAIL_USER,
//       to,
//       subject: 'Email Verification - OTP Code',
//       text: `Your OTP code is ${otp}. It is valid for ${process.env.OTP_TTL_MINUTES || 10} minutes.`,
//       html: `<p>Your OTP code is <b>${otp}</b>. It is valid for ${process.env.OTP_TTL_MINUTES || 10} minutes.</p>`
//     });
//     console.log('✅ OTP email sent:', info.response || info);
//     return true;
//   } catch (err) {
//     // log detailed error server-side
//     console.error('sendOtpEmail failed', err && err.message, err);
//     // return false so callers can choose how to behave
//     return false;
//   }
// }

// module.exports = { sendOtpEmail };


require('dotenv').config();
const nodemailer = require('nodemailer');

function buildTransportOptions() {
  if (process.env.MAIL_HOST) {
    return {
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 587),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    };
  }

  if (process.env.MAIL_SERVICE) {
    return {
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    };
  }

  throw new Error('No MAIL_HOST or MAIL_SERVICE configured in env');
}

async function createTransporter() {
  const opts = buildTransportOptions();
  const transporter = nodemailer.createTransport(opts);
  await transporter.verify(); // Will throw if unable to connect/auth
  return transporter;
}

// Send OTP email (existing)
async function sendOtpEmail(to, otp) {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject: 'Email Verification - OTP Code',
      text: `Your OTP code is ${otp}. It is valid for ${process.env.OTP_TTL_MINUTES || 10} minutes.`,
      html: `<p>Your OTP code is <b>${otp}</b>. It is valid for ${process.env.OTP_TTL_MINUTES || 10} minutes.</p>`,
    });
    console.log('✅ OTP email sent:', info.response || info);
    return true;
  } catch (err) {
    console.error('❌ sendOtpEmail failed:', err.message, err);
    return false;
  }
}

// ✅ New: Send camp registration email (pending status)
async function sendCampRegistrationEmail(to, campDetails) {
  const { camp_name, camp_date, location, status } = campDetails;
  const subject = '📝 Camp Registered Successfully - Pending Approval';
  const html = `
    <h3>Camp Registered</h3>
    <p>Thank you for registering your blood donation camp.</p>
    <p><b>Camp Name:</b> ${camp_name}</p>
    <p><b>Date:</b> ${new Date(camp_date).toLocaleDateString()}</p>
    <p><b>Location:</b> ${location}</p>
    <p><b>Status:</b> <span style="color:orange;">${status.toUpperCase()}</span></p>
    <p>You will receive an email when it gets approved by an administrator.</p>
  `;

  return await sendEmail(to, subject, html);
}

// ✅ New: Send camp approval email
async function sendCampApprovalEmail(to, campDetails) {
  const { camp_name, camp_date, location } = campDetails;
  const subject = '✅ Your Blood Donation Camp Has Been Approved!';
  const html = `
    <h3>Camp Approved 🎉</h3>
    <p>Your blood donation camp has been approved and is now live.</p>
    <p><b>Camp Name:</b> ${camp_name}</p>
    <p><b>Date:</b> ${new Date(camp_date).toLocaleDateString()}</p>
    <p><b>Location:</b> ${location}</p>
    <p>Thank you for your contribution to saving lives!</p>
  `;

  return await sendEmail(to, subject, html);
}

// Internal reusable email sender
async function sendEmail(to, subject, html) {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}:`, info.response || info);
    return true;
  } catch (err) {
    console.error(`❌ Email send failed to ${to}:`, err.message, err);
    return false;
  }
}

module.exports = {
  sendOtpEmail,
  sendCampRegistrationEmail,
  sendCampApprovalEmail,
};
