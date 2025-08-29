// src/controllers/donorController.js
const pool = require("../db/db");
const { donorSchema, donorUpdateSchema } = require("../validators/donorValidator");

/**
 * Helper to check if user is SuperAdmin
 */
const isSuperAdmin = (role) => role?.toUpperCase() === "SUPER_ADMIN";

/**
 * POST /donor/donor-register
 * - Admin: can register donors only in their own centre
 * - SuperAdmin: can register donors in any centre
 */
exports.registerDonor = async (req, res) => {
  try {
    const { error, value } = donorSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
      return res.status(400).json({
        msg: "Validation failed",
        errors: error.details.map((e) => e.message),
      });
    }

    const { role, centreId: tokenCentre } = req.user;

    // Decide centre_id (Admin cannot override; SuperAdmin may)
    let centre_id = tokenCentre;
    if (isSuperAdmin(role) && value.centre_id) {
      centre_id = value.centre_id;
    }

    const {
      first_name, last_name, dob, age, gender, mobile_no, email,
      blood_group_id, marital_status, address, district, state, country,
      camp_id, registration_type, donated_previously, willing_future_donation,
      contact_preference,
    } = value;

    const sql = `
      INSERT INTO donors
      (first_name, last_name, dob, age, gender, mobile_no, email, blood_group_id,
       marital_status, address, district, state, country, centre_id, registration_type,
       donated_previously, willing_future_donation, contact_preference, camp_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING donor_id, created_at
    `;

    const params = [
      first_name, last_name, dob, age, gender, mobile_no, email, blood_group_id || null,
      marital_status || null, address || null, district || null, state || "Tamil Nadu",
      country || "India", centre_id, registration_type, !!donated_previously,
      (willing_future_donation !== undefined ? willing_future_donation : true),
      (contact_preference !== undefined ? contact_preference : true),
      camp_id || null,
    ];

    const result = await pool.query(sql, params);
    return res.status(201).json({ msg: "Donor registered successfully", donor: result.rows[0] });
  } catch (err) {
    console.error("Error in registerDonor:", err);
    return res.status(500).json({ msg: "Error registering donor", error: err.message });
  }
};

/**
 * GET /donor  (list)
 * - Admin: only own centre
 * - SuperAdmin: all centres or filter by ?centre_id=X
 */
exports.getAllDonors = async (req, res) => {
  try {
    const { role, centreId } = req.user; // from JWT
    const { centre_id } = req.query;      // optional filter for SuperAdmin

    let sql = `
      SELECT donor_id, first_name, last_name, mobile_no, blood_group_id, centre_id, camp_id, created_at
      FROM donors
    `;
    const params = [];

    if (isSuperAdmin(role)) {
      if (centre_id) {
        sql += ` WHERE centre_id ILIKE $1`;
        params.push(centre_id);
      }
      // Else: SuperAdmin fetches all donors, no WHERE needed
    } else {
      // Admins only see their own centre
      sql += ` WHERE centre_id = $1`;
      params.push(centreId);
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await pool.query(sql, params);
    return res.status(200).json({ donors: result.rows });
  } catch (err) {
    console.error("Error in getAllDonors:", err);
    return res.status(500).json({ msg: "Error fetching donors", error: err.message });
  }
};

/**
 * GET /donor/search
 * Search donors by multiple filters
 * - Admin: default own centre
 * - SuperAdmin: any centre
 */
exports.searchDonors = async (req, res) => {
  try {
    const { role, centreId } = req.user;
    const {
      name, mobile_no, blood_group_id, state, district, camp_id, centre_id, page = 1, limit = 20,
    } = req.query;

    const conditions = [];
    const values = [];
    let i = 1;

    if (name) { conditions.push(`(first_name ILIKE $${i} OR last_name ILIKE $${i})`); values.push(`%${name}%`); i++; }
    if (mobile_no) { conditions.push(`mobile_no = $${i}`); values.push(mobile_no); i++; }
    if (blood_group_id) { conditions.push(`blood_group_id = $${i}`); values.push(parseInt(blood_group_id, 10)); i++; }
    if (state) { conditions.push(`state ILIKE $${i}`); values.push(`%${state}%`); i++; }
    if (district) { conditions.push(`district ILIKE $${i}`); values.push(`%${district}%`); i++; }
    if (camp_id) { conditions.push(`camp_id = $${i}`); values.push(parseInt(camp_id, 10)); i++; }

    // Centre scoping
    if (isSuperAdmin(role)) {
      if (centre_id) { conditions.push(`centre_id = $${i}`); values.push(centre_id.toUpperCase()); i++; }
      // else SuperAdmin sees all centres
    } else {
      if (centre_id) { conditions.push(`centre_id = $${i}`); values.push(centre_id.toUpperCase()); i++; }
      else { conditions.push(`centre_id = $${i}`); values.push(centreId); i++; }
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const lim = parseInt(limit, 10);

    const sql = `
      SELECT donor_id, first_name, last_name, mobile_no, blood_group_id, centre_id, camp_id, created_at
      FROM donors
      ${where}
      ORDER BY created_at DESC
      LIMIT ${lim} OFFSET ${offset}
    `;

    const result = await pool.query(sql, values);
    return res.status(200).json({ donors: result.rows, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("Error in searchDonors:", err);
    return res.status(500).json({ msg: "Error searching donors", error: err.message });
  }
};

/**
 * GET /donor/camp/:camp_id
 * - Admin: default own centre
 * - SuperAdmin: any centre
 */
exports.getDonorsByCamp = async (req, res) => {
  try {
    const { role, centreId } = req.user;
    const camp_id = parseInt(req.params.camp_id, 10);
    const { centre_id } = req.query;

    if (Number.isNaN(camp_id)) return res.status(400).json({ msg: "Invalid camp_id" });

    let sql = `
      SELECT donor_id, first_name, last_name, mobile_no, blood_group_id, centre_id, camp_id, created_at
      FROM donors
      WHERE camp_id = $1
    `;
    const params = [camp_id];

    if (isSuperAdmin(role)) {
      if (centre_id) { sql += ` AND centre_id = $2`; params.push(centre_id.toUpperCase()); }
    } else {
      if (centre_id) { sql += ` AND centre_id = $2`; params.push(centre_id.toUpperCase()); }
      else { sql += ` AND centre_id = $2`; params.push(centreId); }
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await pool.query(sql, params);
    return res.status(200).json({ donors: result.rows });
  } catch (err) {
    console.error("Error in getDonorsByCamp:", err);
    return res.status(500).json({ msg: "Error fetching donors by camp", error: err.message });
  }
};

/**
 * GET /donor/:id
 * - Admin & SuperAdmin can view any donor
 */
exports.getDonorById = async (req, res) => {
  try {
    const donor_id = parseInt(req.params.id, 10);
    if (Number.isNaN(donor_id)) return res.status(400).json({ msg: "Invalid donor id" });

    const result = await pool.query("SELECT * FROM donors WHERE donor_id = $1", [donor_id]);
    if (!result.rowCount) return res.status(404).json({ msg: "Donor not found" });

    return res.status(200).json({ donor: result.rows[0] });
  } catch (err) {
    console.error("Error in getDonorById:", err);
    return res.status(500).json({ msg: "Error fetching donor", error: err.message });
  }
};

/**
 * PATCH /donor/:id
 * - Admin: can only edit donors in own centre
 * - SuperAdmin: can edit any donor, including centre_id
 */
exports.updateDonor = async (req, res) => {
  try {
    const donor_id = parseInt(req.params.id, 10);
    if (Number.isNaN(donor_id)) return res.status(400).json({ msg: "Invalid donor id" });

    const { error, value } = donorUpdateSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
      return res.status(400).json({
        msg: "Validation failed",
        errors: error.details.map((e) => e.message),
      });
    }

    // Find donor to enforce centre rules
    const donorRes = await pool.query("SELECT * FROM donors WHERE donor_id = $1", [donor_id]);
    if (!donorRes.rowCount) return res.status(404).json({ msg: "Donor not found" });

    const donor = donorRes.rows[0];
    const { role, centreId } = req.user;

    // Admin cannot update other centres
    if (!isSuperAdmin(role) && donor.centre_id !== centreId) {
      return res.status(403).json({ msg: "Access denied: cannot edit other centres" });
    }

    // Admin cannot update centre_id
    if (!isSuperAdmin(role) && "centre_id" in value) {
      delete value.centre_id;
    }

    const fields = Object.keys(value);
    if (!fields.length) {
      return res.status(400).json({ msg: "No fields to update" });
    }

    const sets = fields.map((f, idx) => `${f}=$${idx + 1}`).join(", ");
    const params = fields.map((f) => value[f]);

    const sql = `
      UPDATE donors
      SET ${sets}, updated_at = CURRENT_TIMESTAMP
      WHERE donor_id = $${params.length + 1}
      RETURNING *
    `;
    params.push(donor_id);

    const updated = await pool.query(sql, params);
    return res.status(200).json({ msg: "Donor updated successfully", donor: updated.rows[0] });
  } catch (err) {
    console.error("Error in updateDonor:", err);
    return res.status(500).json({ msg: "Error updating donor", error: err.message });
  }
};
