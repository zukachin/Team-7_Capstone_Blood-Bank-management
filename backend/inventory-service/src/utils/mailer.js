// src/utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendInviteEmail({ to, name, tempPassword, signupUrl, note }) {
  const html = `
    <p>Hi ${name},</p>
    <p>An account has been created for you at our Blood Bank system.</p>
    <p><strong>Temporary password:</strong> <code>${tempPassword}</code></p>
    <p>Please visit <a href="${signupUrl}">${signupUrl}</a> to sign in and reset your password.</p>
    <p>${note || ""}</p>
    <p>Regards,<br/>Blood Bank Team</p>
  `;
  const text = `Hi ${name},\n\nAn account has been created for you.\nTemporary password: ${tempPassword}\nVisit ${signupUrl} to login and reset your password.\n\nRegards,\nBlood Bank Team`;

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Blood Bank" <no-reply@bloodbank.example>',
    to,
    subject: "Your Blood Bank account — temporary password",
    text,
    html,
  });

  return info;
}

module.exports = { sendInviteEmail };
