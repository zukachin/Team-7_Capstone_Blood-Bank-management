// utils/email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

function buildTransportOptions() {
  // prefer explicit host if provided
  if (process.env.MAIL_HOST) {
    return {
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 587),
      secure: (process.env.MAIL_SECURE === 'true'), // true for 465, false for 587
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    };
  }

  // fallback to named service (e.g., gmail) if provided
  if (process.env.MAIL_SERVICE) {
    return {
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    };
  }

  // last resort: throw so we know config is missing
  throw new Error('No MAIL_HOST or MAIL_SERVICE configured in env');
}

async function createTransporter() {
  const opts = buildTransportOptions();
  const transporter = nodemailer.createTransport(opts);
  // verify only once per process; wrap in try/catch where used
  await transporter.verify(); // will throw if unable to connect/auth
  return transporter;
}

async function sendOtpEmail(to, otp) {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject: 'Email Verification - OTP Code',
      text: `Your OTP code is ${otp}. It is valid for ${process.env.OTP_TTL_MINUTES || 10} minutes.`,
      html: `<p>Your OTP code is <b>${otp}</b>. It is valid for ${process.env.OTP_TTL_MINUTES || 10} minutes.</p>`
    });
    console.log('✅ OTP email sent:', info.response || info);
    return true;
  } catch (err) {
    // log detailed error server-side
    console.error('sendOtpEmail failed', err && err.message, err);
    // return false so callers can choose how to behave
    return false;
  }
}

module.exports = { sendOtpEmail };
