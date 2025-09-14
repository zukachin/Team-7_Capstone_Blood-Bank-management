// src/validators/counselingValidator.js
const Joi = require("joi");

const counselingSchema = Joi.object({
  donor_id: Joi.number().integer().positive().required(),
  // Either camp_id or centre_id must be present
  camp_id: Joi.number().integer().optional().allow(null),
  centre_id: Joi.number().integer().optional().allow(null),

  counselling_date: Joi.date().iso().optional().allow(null),

  height: Joi.number().precision(2).positive().optional().allow(null),
  weight: Joi.number().precision(2).positive().required()
    .messages({ "any.required": "weight is required" }),

  hb_level: Joi.number().precision(2).positive().required()
    .messages({ "any.required": "hb_level is required" }),

  previous_donation_date: Joi.date().iso().optional().allow(null),

  drunk_last_12hrs: Joi.boolean().optional(),
  well_today: Joi.boolean().optional(),
  under_medication: Joi.boolean().optional(),
  fever_in_2_weeks: Joi.boolean().optional(),
  recently_delivered: Joi.boolean().optional(),
  pregnancy: Joi.boolean().optional(),
  surgery: Joi.boolean().optional(),
  disease_history: Joi.string().optional().allow(null, ""),

}).custom((value, helpers) => {
  // enforce either camp_id xor centre_id (at least one)
  if (!value.camp_id && !value.centre_id) {
    return helpers.error("any.custom", { message: "Either camp_id or centre_id must be provided" });
  }
  return value;
}, "camp/centre presence check");

module.exports = { counselingSchema };
