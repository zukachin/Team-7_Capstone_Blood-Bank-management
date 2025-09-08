const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const { sendCampOptions } = require("../controllers/appointmentController");

// Donor registration route
router.post("/register-donor", async (req, res) => {
  try {
    const donorData = req.body;
    console.log("📩 Donor Data Received:", donorData);

    // 1️⃣ Send "Registration Successful" email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const registrationMailOptions = {
      from: `"Life Link" <${process.env.MAIL_USER}>`,
      to: donorData.emailId,
      subject: "✅ Life Link Donor Registration Successful",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #e63946; text-align: center;">Life Link</h2>
          <p>Hello <strong>${donorData.fullName}</strong>,</p>
          <p>Thank you for registering as a blood donor with <strong>Life Link</strong>! Your contribution can save lives.</p>
          <h3 style="color: #e63946;">Your Registration Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${donorData.fullName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${donorData.emailId}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${donorData.phoneNumber}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Location:</td><td style="padding: 8px;">${donorData.location}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Blood Group:</td><td style="padding: 8px;">${donorData.bloodGroup}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Age:</td><td style="padding: 8px;">${donorData.age}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Gender:</td><td style="padding: 8px;">${donorData.gender}</td></tr>
          </table>
          <p>We’ll contact you when a donation drive is scheduled in your area.</p>
          <p style="margin-top: 30px;">❤️ Thank you for helping save lives!<br>
          <strong>Life Link Team</strong></p>
          <hr style="margin-top: 20px; border-color: #ddd;">
          <p style="font-size: 12px; color: #888;">This is an automated email. Please do not reply.</p>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(registrationMailOptions);
    console.log(`✅ Registration email sent to ${donorData.emailId}`);

    // 2️⃣ Automatically send camp selection email
    await sendCampOptions({ body: donorData }, { json: () => {} });

    res.status(200).json({ message: "✅ Donor registered & emails sent successfully" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Error registering donor" });
  }
});

module.exports = router;
