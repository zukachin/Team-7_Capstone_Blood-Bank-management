const nodemailer = require("nodemailer");

async function sendOtpEmail(to, otp) {
  try {
    // console.log("📧 Sending OTP email to:", to);
    // console.log("Using MAIL_USER:", process.env.MAIL_USER);

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Verify transporter (helps catch auth issues early)
    await transporter.verify();
    console.log("✅ SMTP Server is ready to take our messages");

    // Send email
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject: "Email Verification - OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    });

    console.log("✅ OTP email sent successfully:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error.message);
    return false;
  }
}

module.exports = { sendOtpEmail };

