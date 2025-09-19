// src/controllers/donorController.js
const pool = require("../db/db");
const { donorSchema, donorUpdateSchema } = require("../validators/donorValidator");
const { sendInviteEmail } = require("../utils/mailer");

const crypto = require("crypto");
const bcrypt = require("bcrypt");

/** Helper: is SuperAdmin */
const isSuperAdmin = (role) => role && role.toUpperCase() === "SUPER_ADMIN";

/**
 * POST /api/donors
 * Create donor (Admin/Organizer/SuperAdmin/Donor-self allowed by middleware)
 */
async function existsInTable(table, column, value) {
  const q = `SELECT 1 FROM ${table} WHERE ${column} = $1 LIMIT 1`;
  const r = await pool.query(q, [value]);
  return r.rowCount > 0;
}

exports.registerDonor = async (req, res) => {
  try {
    const { error, value } = donorSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
      return res.status(400).json({ msg: "Validation failed", errors: error.details.map((e) => e.message) });
    }

    const { role, centreId: tokenCentre, id: authUserId } = req.user || {};

    // determine centre_id (non-superadmin -> token centre)
    let centre_id = tokenCentre ?? null;
    if (isSuperAdmin(role) && (value.centre_id || value.centre_id === 0)) {
      centre_id = value.centre_id;
    }
    const camp_id = value.camp_id ?? null;

    // validate centre and camp existence as before
    if (centre_id !== null) {
      const okCentre = await existsInTable("centres", "centre_id", centre_id);
      if (!okCentre) return res.status(400).json({ msg: "Invalid centre_id: centre not found" });
    }
    if (camp_id !== null) {
      const okCamp = await existsInTable("camps", "camp_id", camp_id);
      if (!okCamp) return res.status(400).json({ msg: "Invalid camp_id: camp not found" });
      if (centre_id !== null) {
        const r = await pool.query("SELECT 1 FROM camps WHERE camp_id = $1 AND centre_id = $2 LIMIT 1", [camp_id, centre_id]);
        if (!r.rowCount) return res.status(400).json({ msg: "camp_id does not belong to the provided centre_id" });
      }
    }

    // ------------------  user linkage / creation logic ------------------
    // If email provided, try to find existing user by email (case-insensitive)
    let linkedUserId = null;
    if (value.email) {
      const userRes = await pool.query("SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1", [value.email]);
      if (userRes.rowCount) {
        linkedUserId = userRes.rows[0].id;
      } else {
        // Create user record (auto-create)
        // Build user fields from donor payload
        const userName = value.donor_name || "Donor";
        const userPhone = value.mobile_no || null;
        const userAddress = value.address || null;
        const userState = value.state_id || null;
        const userDistrict = value.district_id || null;
        const userBloodGroup = value.blood_group_id || null;
        const userGender = value.gender || null;
        const userAge = value.age || null;

        // Generate a secure temporary password (random), hash it
        const tempPassword = crypto.randomBytes(6).toString("base64"); // ~8 chars
        const saltRounds = 10;
        const hashedPwd = await bcrypt.hash(tempPassword, saltRounds);

        const insertUserSql = `
          INSERT INTO users (name, email, phone, password, address, state_id, district_id, blood_group_id, gender, is_verified, created_at, updated_at, age)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, false, now(), now(), $10)
          RETURNING id, email
        `;
        const userParams = [userName, value.email, userPhone, hashedPwd, userAddress, userState, userDistrict, userBloodGroup, userGender, userAge];
        const newUserRes = await pool.query(insertUserSql, userParams);
        linkedUserId = newUserRes.rows[0].id;

        // Send invite email synchronously (if mail fails we still proceed but include warning)
        try {
          const signupUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/complete-signup`; // adapt frontend path
          await sendInviteEmail({
            to: value.email,
            name: userName,
            tempPassword,
            signupUrl,
            note: "We created an account for you to make it easy to track donations. Please login with the temporary password and reset it."
          });
        } catch (mailErr) {
          console.error("Invite email failed:", mailErr);
          // We choose to continue — donor & user are created — but inform client
          // We'll fall through and create donor, then return warning.
        }
      }
    }

    // ------------------  Insert donor with linked user_id ------------------
    const sql = `
      INSERT INTO donors
      (user_id, donor_name, dob, age, gender, mobile_no, email, blood_group_id,
       marital_status, address, state_id, district_id, centre_id, camp_id, registration_type,
       donated_previously, willing_future_donation, contact_preference,created_by,created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,now(), now())
      RETURNING donor_id, donor_name, mobile_no, email, created_at
    `;

    const params = [
      linkedUserId || null,
      value.donor_name,
      value.dob || null,
      value.age || null,
      value.gender || null,
      value.mobile_no || null,
      value.email || null,
      value.blood_group_id || null,
      value.marital_status || null,
      value.address || null,
      value.state_id || null,
      value.district_id || null,
      centre_id,
      camp_id,
      value.registration_type || null,
      value.donated_previously === true,
      value.willing_future_donation === false ? false : true,
      value.contact_preference === false ? false : true,
      authUserId || null
    ];

    const result = await pool.query(sql, params);

    // if invite email failed earlier (we caught it) we might want to inform client.
    // For simplicity return created donor and a note if mail failed (see above logs).
    return res.status(201).json({ msg: "Donor registered successfully", donor: result.rows[0], user_id: linkedUserId || null });
  } catch (err) {
    console.error("Error in registerDonor:", err);
    if (err.code === "23503") {
      return res.status(400).json({ msg: "Referential integrity error", detail: err.detail });
    }
    return res.status(500).json({ msg: "Error registering donor", error: err.message });
  }
}

/**
 * GET /api/donors/search?mobile=...&email=...
 * Quick search endpoint used by the counter UI to find donors
 */
exports.searchDonors = async (req, res) => {
  try {
    const { mobile, email, name } = req.query;
    const params = [];
    let where = [];

    if (mobile) {
      params.push(mobile);
      where.push(`mobile_no = $${params.length}`);
    }
    if (email) {
      params.push(email.toLowerCase());
      where.push(`lower(email) = $${params.length}`);
    }
    if (name) {
      params.push(`%${name.toLowerCase()}%`);
      where.push(`lower(donor_name) LIKE $${params.length}`);
    }

    if (where.length === 0) {
      return res.status(400).json({ msg: "Provide at least one search parameter (mobile/email/name)" });
    }

    const sql = `SELECT donor_id, donor_name, mobile_no, email, centre_id, camp_id, created_at FROM donors WHERE ${where.join(" OR ")} ORDER BY created_at DESC LIMIT 10`;
    const result = await pool.query(sql, params);
    return res.json({ donors: result.rows });
  } catch (err) {
    console.error("Error in searchDonors:", err);
    return res.status(500).json({ msg: "Error searching donors", error: err.message });
  }
};

/**
 * GET /api/donors
 * List donors (scoped to centre for non-SuperAdmin)
 */
exports.getAllDonors = async (req, res) => {
  try {
    const { role, centreId } = req.user || {};
    const { centre_id } = req.query;

    let sql = `SELECT donor_id, donor_name, mobile_no, email, blood_group_id, centre_id, camp_id, created_at, updated_at FROM donors`;
    const params = [];

    if (!isSuperAdmin(role)) {
      sql += ` WHERE centre_id = $1`;
      params.push(centreId);
    } else if (centre_id) {
      sql += ` WHERE centre_id = $1`;
      params.push(centre_id);
    }

    const result = await pool.query(sql, params);
    return res.json({ donors: result.rows });
  } catch (err) {
    console.error("Error in getAllDonors:", err);
    return res.status(500).json({ msg: "Error fetching donors", error: err.message });
  }
};

/**
 * GET /api/donors/:id
 */
exports.getDonorById = async (req, res) => {
  try {
    const donor_id = parseInt(req.params.id, 10);
    if (Number.isNaN(donor_id)) return res.status(400).json({ msg: "Invalid donor id" });

    const result = await pool.query(`SELECT * FROM donors WHERE donor_id = $1`, [donor_id]);
    if (!result.rowCount) return res.status(404).json({ msg: "Donor not found" });

    return res.json({ donor: result.rows[0] });
  } catch (err) {
    console.error("Error in getDonorById:", err);
    return res.status(500).json({ msg: "Error fetching donor", error: err.message });
  }
};

/**
 * PATCH /api/donors/:id
 * Update donor - ALLOW global edits by any authorized actor (Admin, Organizer, SuperAdmin, donor-self)
 * Route-level authorization should restrict who can call this endpoint.
 */
exports.updateDonor = async (req, res) => {
  try {
    const donor_id = parseInt(req.params.id, 10);
    if (Number.isNaN(donor_id)) return res.status(400).json({ msg: "Invalid donor id" });

    const { error, value } = donorUpdateSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
      return res.status(400).json({ msg: "Validation failed", errors: error.details.map(e => e.message) });
    }

    // Check donor exists
    const existingRes = await pool.query(`SELECT * FROM donors WHERE donor_id = $1`, [donor_id]);
    if (!existingRes.rowCount) return res.status(404).json({ msg: "Donor not found" });

    // Build dynamic update
    const updates = [];
    const params = [];
    let idx = 1;

    const updatableFields = [
      "donor_name", "dob", "age", "gender", "mobile_no", "email",
      "blood_group_id", "marital_status", "address", "state_id", "district_id",
      "camp_id", "registration_type", "donated_previously", "willing_future_donation",
      "contact_preference"
    ];

    updatableFields.forEach((f) => {
      if (Object.prototype.hasOwnProperty.call(value, f)) {
        updates.push(`${f} = $${idx++}`);
        params.push(value[f]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ msg: "No editable fields provided" });
    }

    // append updated_by and updated_at
    params.push(req.user?.id || null);
    updates.push(`updated_by = $${idx++}`);
    updates.push(`updated_at = now()`);

    params.push(donor_id);
    const sql = `UPDATE donors SET ${updates.join(", ")} WHERE donor_id = $${params.length} RETURNING *`;
    const result = await pool.query(sql, params);
    return res.json({ msg: "Donor updated", donor: result.rows[0] });
  } catch (err) {
    console.error("Error in updateDonor:", err);
    return res.status(500).json({ msg: "Error updating donor", error: err.message });
  }
};

/**
 * DELETE /api/donors/:id
 * Soft-delete or hard-delete depending on your policy.
 * Here we perform hard delete for simplicity (restrict this to SuperAdmin/Admin via route middleware).
 */
exports.deleteDonor = async (req, res) => {
  try {
    const donor_id = parseInt(req.params.id, 10);
    if (Number.isNaN(donor_id)) return res.status(400).json({ msg: "Invalid donor id" });

    await pool.query(`DELETE FROM donors WHERE donor_id = $1`, [donor_id]);
    return res.json({ msg: "Donor deleted" });
  } catch (err) {
    console.error("Error in deleteDonor:", err);
    return res.status(500).json({ msg: "Error deleting donor", error: err.message });
  }
};
