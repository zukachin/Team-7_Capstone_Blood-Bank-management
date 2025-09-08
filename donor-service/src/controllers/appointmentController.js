const nodemailer = require("nodemailer");

// Temporary in-memory store for donors (replace with DB later)
let donors = [];

// Camps by location
const campData = {
  Chennai: ["Adyar Blood Bank", "Marina Camp Center", "Velachery Camp"],
  Bangalore: ["Indiranagar Blood Center", "Whitefield Camp", "BTM Layout Camp"],
  Delhi: ["AIIMS Center", "Connaught Place Camp"],
};

// Sample available dates
const availableDates = ["2025-09-12", "2025-09-14", "2025-09-16"];

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email config error:", err);
  } else {
    console.log("✅ Email server ready to send messages");
  }
});

// 1️⃣ Send camps email after donor registers
exports.sendCampOptions = async (req, res) => {
  try {
    const donorData = req.body;
    donors.push(donorData);

    const email = donorData.emailId;
    const locationKey =
      donorData.location.charAt(0).toUpperCase() +
      donorData.location.slice(1).toLowerCase();
    const camps = campData[locationKey] || ["No camps available"];

    // Build HTML email with clickable date links
    let campListHtml = "";
    camps.forEach((camp) => {
      campListHtml += `<h3 style="margin-bottom:5px;">${camp}</h3>`;
      availableDates.forEach((date) => {
        campListHtml += `<a href="http://localhost:4001/api/appointments/schedule?camp=${encodeURIComponent(
          camp
        )}&date=${date}&email=${encodeURIComponent(
          email
        )}" style="display:inline-block;margin:5px;padding:8px 12px;background:#1976d2;color:#fff;text-decoration:none;border-radius:5px;">
          Schedule on ${date}
        </a>`;
      });
    });

    // Send email
    await transporter.sendMail({
      from: `"Life Link" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Schedule Your Blood Donation Appointment",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
          <p>Dear <strong>${donorData.fullName}</strong>,</p>
          <p>Thank you for registering as a blood donor in <strong>${locationKey}</strong>. We are glad to have your support!</p>
          <p>Below are the donation camps available in your area along with available dates. Simply click on your preferred slot to schedule your donation:</p>
          ${campListHtml}
          <p style="margin-top:20px;">We look forward to your donation. Thank you for helping save lives!</p>
          <p>Best regards,<br/><strong>Blood Donation Team</strong></p>
        </div>
      `,
    });

    console.log(`✅ Camps email sent to ${email}`);
    res.json({ message: "Camps email sent successfully!" });
  } catch (err) {
    console.error("❌ Error in sendCampOptions:", err);
    res.status(500).json({ error: "Failed to send camps email" });
  }
};

// 2️⃣ Schedule appointment when user clicks email link
exports.scheduleAppointment = async (req, res) => {
  try {
    const { email, camp, date } = req.query;

    const donor = donors.find((d) => d.emailId === email);
    if (!donor) return res.status(404).send("Donor not found");

    donor.selectedCamp = camp;
    donor.appointmentDate = date;

    await transporter.sendMail({
    from: `"Life Link" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your Blood Donation Appointment is Confirmed",
      html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="text-align: center; color: #e63946;">Blood Donation Appointment Confirmation</h2>
      <p>Dear <strong>${donor.fullName}</strong>,</p>
      <p>Your blood donation appointment has been <strong>officially scheduled</strong> as follows:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 16px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; width: 40%;">Donor Name:</td>
          <td style="padding: 8px;">${donor.fullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Appointment Date:</td>
          <td style="padding: 8px;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Camp / Center:</td>
          <td style="padding: 8px;">${camp}</td>
        </tr>
      </table>

      <p style="margin-top: 20px; font-weight: bold; color: #555;">Important Instructions:</p>
      <ul style="margin-top: 5px; margin-left: 20px;">
        <li>Arrive at least <strong>10 minutes early</strong>.</li>
        <li>Carry a valid <strong>photo ID</strong>.</li>
        <li>You can <strong>print this email</strong> or show it on your phone at the camp.</li>
      </ul>

      <p style="margin-top: 30px;">Thank you for your valuable contribution. Your support helps save lives!</p>

      <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; text-align: center; font-size: 12px; color: #888;">
        <p>Blood Donation Team</p>
        <p><strong>Authorized by Life Link Organization</strong></p>
        <p>This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>
`

    });

    console.log(`✅ Appointment confirmation email sent to ${email}`);
    res.send(`<h2>✅ Appointment Confirmed</h2>
              <p>You are scheduled at <b>${camp}</b> on <b>${date}</b>. 
              A confirmation email has been sent to <b>${email}</b>.</p>`);
  } catch (err) {
    console.error("❌ Error in scheduleAppointment:", err);
    res.status(500).send("Failed to schedule appointment");
  }
};
