const nodemailer = require("nodemailer");

async function sendOtpEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject: "Email Verification",
    text: `Your OTP code is ${otp}`,
  });
}

module.exports = { sendOtpEmail };
