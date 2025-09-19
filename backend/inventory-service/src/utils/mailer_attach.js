// src/utils/mailer_attach.js
const nodemailer = require('nodemailer');

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

/**
 * sendMailWithAttachment(to, subject, text, html, attachments)
 * attachments: array of { filename, content } or nodemailer-style attachments
 */
async function sendMailWithAttachment(to, subject, text, html, attachments = []) {
  const t = getTransporter();
  const mailOptions = {
    from: process.env.MAIL_FROM || '"Blood Bank" <no-reply@yourdomain.com>',
    to,
    subject,
    text,
    html,
    attachments,
  };
  return t.sendMail(mailOptions);
}

module.exports = { sendMailWithAttachment };
