const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const { pool } = require("../db/pool");

// ====================
// GET ALL STATES
// ====================
router.get("/states", async (req, res) => {
  try {
    const result = await pool.query("SELECT state_id, state_name FROM states ORDER BY state_name");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching states:", err);
    res.status(500).json({ message: "Error fetching states" });
  }
});

// ====================
// GET DISTRICTS BY STATE ID
// ====================
router.get("/districts/:stateId", async (req, res) => {
  try {
    const { stateId } = req.params;
    const result = await pool.query(
      "SELECT district_id, district_name FROM districts WHERE state_id = $1 ORDER BY district_name",
      [stateId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching districts:", err);
    res.status(500).json({ message: "Error fetching districts" });
  }
});

// ====================
// GET CENTRES BY DISTRICT ID
// ====================
router.get("/centres/:districtId", async (req, res) => {
  try {
    const { districtId } = req.params;
    const result = await pool.query(
      "SELECT centre_id, centre_name, address FROM centres WHERE district_id = $1 ORDER BY centre_name",
      [districtId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching centres:", err);
    res.status(500).json({ message: "Error fetching centres" });
  }
});

// ====================
// GET BLOOD GROUPS
// ====================
router.get("/blood-groups", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, group_name FROM blood_groups ORDER BY group_name");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching blood groups:", err);
    res.status(500).json({ message: "Error fetching blood groups" });
  }
});

// ====================
// REGISTER DONOR
// ====================
router.post("/register-donor", async (req, res) => {
  try {
    const donorData = req.body;

    // Check if email already exists
    const emailCheck = await pool.query("SELECT * FROM donors WHERE email = $1", [donorData.emailId]);
    if (emailCheck.rows.length > 0) return res.status(400).json({ message: "Email already registered" });

    // Capitalize gender
    const genderValue = donorData.gender.charAt(0).toUpperCase() + donorData.gender.slice(1).toLowerCase();

    // Insert donor
    const query = `
      INSERT INTO donors (
        first_name, last_name, dob, age, gender, mobile_no, email, blood_group_id, address,
        state_id, district_id, centre_id, donated_previously, willing_future_donation,
        contact_preference, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),NOW())
      RETURNING *;
    `;
    const values = [
      donorData.fullName.split(' ')[0],
      donorData.fullName.split(' ')[1] || '',
      donorData.dateOfBirth,
      parseInt(donorData.age),
      genderValue,
      donorData.phoneNumber,
      donorData.emailId,
      donorData.bloodGroupId,
      donorData.address,
      donorData.state,
      donorData.district,
      donorData.center,
      donorData.lastDonationDate !== '0000-00-00',
      true,
      donorData.consent
    ];

    const result = await pool.query(query, values);
    console.log("✅ Donor inserted into DB:", result.rows[0]);

    // Fetch human-readable names for email
    const stateName = await pool.query("SELECT state_name FROM states WHERE state_id = $1", [donorData.state]);
    const districtName = await pool.query("SELECT district_name FROM districts WHERE district_id = $1", [donorData.district]);
    const centreName = await pool.query("SELECT centre_name FROM centres WHERE centre_id = $1", [donorData.center]);
    const bloodGroupName = await pool.query("SELECT group_name FROM blood_groups WHERE id = $1", [donorData.bloodGroupId]);
    name = stateName.rows[0].state_name
    console.log("State Name:", name);
    // Send registration email
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
              <tr><td style="padding: 8px; font-weight: bold;">Address:</td><td style="padding: 8px;">${donorData.address}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Blood Group:</td><td style="padding: 8px;">${bloodGroupName.rows[0].group_name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Age:</td><td style="padding: 8px;">${donorData.age}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Gender:</td><td style="padding: 8px;">${genderValue}</td></tr>
             <tr><td style="padding: 8px; font-weight: bold;">State:</td><td style="padding: 8px;">${stateName.rows[0].state_name}</td></tr>
<tr><td style="padding: 8px; font-weight: bold;">District:</td><td style="padding: 8px;">${districtName.rows[0].district_name}</td></tr>
<tr><td style="padding: 8px; font-weight: bold;">Centre:</td><td style="padding: 8px;">${centreName.rows[0].centre_name}</td></tr>
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

    res.status(200).json({ message: "✅ Donor registered & emails sent successfully" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Error registering donor" });
  }
});

module.exports = router;
