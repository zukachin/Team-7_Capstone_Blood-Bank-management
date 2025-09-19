// src/controllers/counselingController.js
const pool = require("../db/db");
const { counselingSchema } = require("../validators/counselingValidator");

/** Helper: is SuperAdmin */
const isSuperAdmin = (role) => role && role.toUpperCase() === "SUPER_ADMIN";

/**
 * POST /api/counseling
 * Create counseling record for an existing donor.
 * Enforces centre-binding for non-SuperAdmin users.
 * Eligibility rule: weight > 45, hb_level > 12.5, previous donation >= 90 days (or none).
 */
/** Helper: check existence of a value in a table */
async function existsInTable(table, column, value) {
  const q = `SELECT 1 FROM ${table} WHERE ${column} = $1 LIMIT 1`;
  const r = await pool.query(q, [value]);
  return r.rowCount > 0;
}

exports.registerCounseling = async (req, res) => {
  try {
    const { error, value } = counselingSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        msg: "Validation failed",
        errors: error.details.map((e) => e.message),
      });
    }

    const { donor_id, camp_id: bodyCamp, centre_id: bodyCentre, weight, hb_level, previous_donation_date } = value;
    const { id: authUserId, role, centreId: tokenCentre } = req.user || {};

    // 1) Ensure donor exists
    const donorRes = await pool.query("SELECT donor_id FROM donors WHERE donor_id = $1", [donor_id]);
    if (!donorRes.rowCount) {
      return res.status(404).json({ msg: "Donor not found" });
    }

    // 2) Determine centre/camp binding
    let centre_id = null;
    let camp_id = null;
    if (!isSuperAdmin(role)) {
      // non-superadmin: force centre to token centre
      centre_id = tokenCentre ?? null;
      camp_id = bodyCamp ?? null;
    } else {
      centre_id = bodyCentre ?? null;
      camp_id = bodyCamp ?? null;
    }

    // 3) Validate centre/camp existence (must exist in DB). If invalid -> return 400 and do not create counseling.
    if (centre_id !== null && typeof centre_id !== "undefined") {
      const okCentre = await existsInTable("centres", "centre_id", centre_id);
      if (!okCentre) {
        return res.status(400).json({ msg: "Invalid centre_id: centre not found" });
      }
    }

    if (camp_id !== null && typeof camp_id !== "undefined") {
      const okCamp = await existsInTable("camps", "camp_id", camp_id);
      if (!okCamp) {
        return res.status(400).json({ msg: "Invalid camp_id: camp not found" });
      }

      // If both provided, check camp belongs to the centre (defensive)
      if (centre_id !== null && typeof centre_id !== "undefined") {
        const r = await pool.query("SELECT 1 FROM camps WHERE camp_id = $1 AND centre_id = $2 LIMIT 1", [camp_id, centre_id]);
        if (!r.rowCount) {
          return res.status(400).json({ msg: "camp_id does not belong to the provided centre_id" });
        }
      }
    }

    // 4) Compute days since previous donation (if provided)
    let daysSinceDonation = null;
    if (previous_donation_date) {
      const prevDate = new Date(previous_donation_date);
      const today = new Date();
      daysSinceDonation = Math.floor((today - prevDate) / (1000 * 60 * 60 * 24));
    }

    // 5) Determine status using policy: weight > 45, hb > 12.5, previous >= 90 days (or none)
    let status = "Pending";
    const weightVal = Number(weight || 0);
    const hbVal = Number(hb_level || 0);

    if (weightVal > 45 && hbVal > 12.5 && (!daysSinceDonation || daysSinceDonation >= 90)) {
      status = "Accepted";
    } else {
      status = "Rejected";
    }

    // 6) Insert counseling row (only after validations passed)
    const sql = `
      INSERT INTO donor_counseling
      (donor_id, camp_id, centre_id, counselling_date, height, weight, hb_level,
       previous_donation_date, drunk_last_12hrs, well_today, under_medication,
       fever_in_2_weeks, recently_delivered, pregnancy, surgery, disease_history,
       status, created_by, created_at, updated_at)
      VALUES
      ($1,$2,$3,CURRENT_TIMESTAMP,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, now(), now())
      RETURNING *
    `;

    const params = [
      donor_id,
      camp_id,
      centre_id,
      value.height || null,
      weight || null,
      hb_level || null,
      previous_donation_date || null,
      value.drunk_last_12hrs ?? false,
      value.well_today ?? true,
      value.under_medication ?? false,
      value.fever_in_2_weeks ?? false,
      value.recently_delivered ?? false,
      value.pregnancy ?? false,
      value.surgery ?? false,
      value.disease_history || null,
      status,
      authUserId || null
    ];

    const result = await pool.query(sql, params);
    return res.status(201).json({ msg: "Counseling registered successfully", counseling: result.rows[0] });
  } catch (err) {
    console.error("Error in registerCounseling:", err);
    if (err.code === "23503") {
      return res.status(400).json({ msg: "Referential integrity error", detail: err.detail });
    }
    return res.status(500).json({ msg: "Error registering counseling", error: err.message });
  }
};
/**
 * GET /api/counseling/:id
 */
exports.getCounselingById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "Invalid counseling id" });

    const result = await pool.query("SELECT * FROM donor_counseling WHERE counseling_id = $1", [id]);
    if (!result.rowCount) return res.status(404).json({ msg: "Counseling not found" });

    // enforce centre scoping for non-superadmin
    const record = result.rows[0];
    if (!isSuperAdmin(req.user?.role) && req.user?.centreId && record.centre_id !== req.user.centreId) {
      return res.status(403).json({ msg: "Forbidden: not allowed to access counseling from other centres" });
    }

    return res.json({ counseling: record });
  } catch (err) {
    console.error("Error in getCounselingById:", err);
    return res.status(500).json({ msg: "Error fetching counseling", error: err.message });
  }
};

/**
 * PATCH /api/counseling/:id
 * Update counseling record (restrict edits based on your policy). We enforce centre-binding for non-SuperAdmin.
 */
exports.updateCounseling = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "Invalid counseling id" });

    // Validate body minimally here or use a dedicated update validator
    const allowedFields = [
      "height", "weight", "hb_level", "previous_donation_date", "drunk_last_12hrs",
      "well_today", "under_medication", "fever_in_2_weeks", "recently_delivered",
      "pregnancy", "surgery", "disease_history", "camp_id", "centre_id"
    ];

    const updates = [];
    const params = [];
    let idx = 1;
    allowedFields.forEach((f) => {
      if (Object.prototype.hasOwnProperty.call(req.body, f)) {
        // If non-superadmin and trying to set centre_id, ignore/override later
        updates.push(`${f} = $${idx++}`);
        params.push(req.body[f]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ msg: "No editable fields provided" });
    }

    // If caller is non-superadmin, force centre_id to user's centre (if included)
    if (!isSuperAdmin(req.user?.role)) {
      if (!req.user?.centreId) {
        return res.status(400).json({ msg: "User has no centre bound" });
      }
      // append/replace centre_id param
      updates.push(`centre_id = $${idx++}`);
      params.push(req.user.centreId);
    } else {
      // superadmin: if centre_id provided in body already included; if not, no change
    }

    // append updated_by and updated_at
    updates.push(`updated_by = $${idx++}`);
    params.push(req.user?.id || null);
    updates.push(`updated_at = now()`);

    params.push(id);
    const sql = `UPDATE donor_counseling SET ${updates.join(", ")} WHERE counseling_id = $${params.length} RETURNING *`;
    const result = await pool.query(sql, params);
    if (!result.rowCount) return res.status(404).json({ msg: "Counseling not found" });

    return res.json({ msg: "Counseling updated", counseling: result.rows[0] });
  } catch (err) {
    console.error("Error in updateCounseling:", err);
    return res.status(500).json({ msg: "Error updating counseling", error: err.message });
  }
};

/**
 * DELETE /api/counseling/:id
 * Delete counseling record (restrict via route middleware to Admin/SuperAdmin)
 */
exports.deleteCounseling = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "Invalid counseling id" });

    await pool.query("DELETE FROM donor_counseling WHERE counseling_id = $1", [id]);
    return res.json({ msg: "Counseling deleted" });
  } catch (err) {
    console.error("Error in deleteCounseling:", err);
    return res.status(500).json({ msg: "Error deleting counseling", error: err.message });
  }
};
// inside src/controllers/counselingController.js

exports.getAllCounselings = async (req, res) => {
  try {
    const { role, centreId } = req.user || {};
    const { centre_id, donor_id, camp_id, limit = 100, offset = 0 } = req.query;

    // Input validation
    const parsedLimit = Math.min(parseInt(limit) || 100, 1000); // Max 1000 records
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);
    
    let sql = `SELECT 
      counseling_id,
      donor_id,
      centre_id,
      camp_id,
      counselling_date,
      height,
      weight,
      hb_level,
      previous_donation_date,
      drunk_last_12hrs,
      well_today,
      under_medication,
      fever_in_2_weeks,
      recently_delivered,
      pregnancy,
      surgery,
      disease_history,
      status,
      created_at,
      updated_at
    FROM donor_counseling`;
    
    const params = [];
    const where = [];

    // Role-based access control
    if (!isSuperAdmin(role)) {
      if (!centreId) {
        return res.status(403).json({ 
          success: false,
          msg: "Access denied: No centre assigned to user" 
        });
      }
      where.push(`centre_id = $${params.length + 1}`);
      params.push(centreId);
    } else {
      // SuperAdmin can optionally filter by centre
      if (centre_id && centre_id.trim()) {
        const parsedCentreId = parseInt(centre_id);
        if (!isNaN(parsedCentreId)) {
          where.push(`centre_id = $${params.length + 1}`);
          params.push(parsedCentreId);
        }
      }
    }

    // Donor ID filter
    if (donor_id && donor_id.trim()) {
      const parsedDonorId = parseInt(donor_id);
      if (!isNaN(parsedDonorId)) {
        where.push(`donor_id = $${params.length + 1}`);
        params.push(parsedDonorId);
      } else {
        return res.status(400).json({
          success: false,
          msg: "Invalid donor_id format. Must be a number."
        });
      }
    }

    // Camp ID filter
    if (camp_id && camp_id.trim()) {
      const parsedCampId = parseInt(camp_id);
      if (!isNaN(parsedCampId)) {
        where.push(`camp_id = $${params.length + 1}`);
        params.push(parsedCampId);
      } else {
        return res.status(400).json({
          success: false,
          msg: "Invalid camp_id format. Must be a number."
        });
      }
    }

    // Build final query
    if (where.length) {
      sql += ` WHERE ${where.join(" AND ")}`;
    }
    
    sql += ` ORDER BY counselling_date DESC, counseling_id DESC`;
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parsedLimit, parsedOffset);

    // Execute query
    const result = await pool.query(sql, params);

    // Get total count for pagination (optional)
    let totalCount = 0;
    if (result.rows.length > 0) {
      let countSql = `SELECT COUNT(*) as total FROM donor_counseling`;
      if (where.length) {
        countSql += ` WHERE ${where.join(" AND ")}`;
      }
      const countResult = await pool.query(countSql, params.slice(0, -2)); // Remove limit/offset params
      totalCount = parseInt(countResult.rows[0]?.total || 0);
    }

    // Format response
    const counselings = result.rows.map(row => ({
      ...row,
      // Ensure boolean fields are properly formatted
      drunk_last_12hrs: !!row.drunk_last_12hrs,
      well_today: !!row.well_today,
      under_medication: !!row.under_medication,
      fever_in_2_weeks: !!row.fever_in_2_weeks,
      recently_delivered: !!row.recently_delivered,
      pregnancy: !!row.pregnancy,
      surgery: !!row.surgery,
      // Format dates
      counselling_date: row.counselling_date ? new Date(row.counselling_date).toISOString() : null,
      previous_donation_date: row.previous_donation_date ? new Date(row.previous_donation_date).toISOString() : null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null
    }));

    return res.status(200).json({
      success: true,
      counseling: counselings,
      pagination: {
        total: totalCount,
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: totalCount > (parsedOffset + parsedLimit)
      },
      filters: {
        centre_id: centre_id || (isSuperAdmin(role) ? null : centreId),
        donor_id: donor_id || null,
        camp_id: camp_id || null
      }
    });

  } catch (err) {
    console.error("Error in getAllCounselings:", err);
    
    // Return appropriate error based on error type
    if (err.code === '22P02') { // PostgreSQL invalid text representation
      return res.status(400).json({ 
        success: false,
        msg: "Invalid parameter format", 
        error: err.message 
      });
    }
    
    if (err.code === '42703') { // PostgreSQL undefined column
      return res.status(500).json({ 
        success: false,
        msg: "Database schema error", 
        error: "Invalid column reference" 
      });
    }

    return res.status(500).json({ 
      success: false,
      msg: "Error fetching counseling records", 
      error: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
    });
  }
};