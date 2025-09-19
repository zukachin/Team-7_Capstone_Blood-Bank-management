const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

async function sendMail(to, subject, text, html = null) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Life Link" <noreply@lifelink.org>',
    to,
    subject,
    text,
    html: html || text
  };
  await transporter.sendMail(mailOptions);
}

module.exports =  sendMail;
