// src/validators/donorValidator.js
const Joi = require("joi");

const donorSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional().allow(null),
  donor_name: Joi.string().trim().min(2).required(),
  dob: Joi.date().iso().optional().allow(null),
  age: Joi.number().integer().min(0).optional(),
  gender: Joi.string().valid("Male", "Female", "Other").required(),
  mobile_no: Joi.string().trim().min(7).max(20).optional().allow(null),
  email: Joi.string().email().optional().allow(null),
  blood_group_id: Joi.number().integer().optional().allow(null),
  marital_status: Joi.string().optional().allow(null, ""),
  address: Joi.string().optional().allow(null, ""),
  state_id: Joi.number().integer().optional().allow(null),
  district_id: Joi.number().integer().optional().allow(null),
  centre_id: Joi.number().integer().optional().allow(null),
  camp_id: Joi.number().integer().optional().allow(null),
  registration_type: Joi.string().valid("Camp", "Centre").optional().allow(null),
  donated_previously: Joi.boolean().optional(),
  willing_future_donation: Joi.boolean().optional(),
  contact_preference: Joi.boolean().optional(),
});

const donorUpdateSchema = Joi.object({
  donor_name: Joi.string().trim().min(2).optional(),
  dob: Joi.date().iso().optional().allow(null),
  age: Joi.number().integer().min(0).optional(),
  gender: Joi.string().valid("Male", "Female", "Other").optional(),
  mobile_no: Joi.string().trim().min(7).max(20).optional().allow(null),
  email: Joi.string().email().optional().allow(null),
  blood_group_id: Joi.number().integer().optional().allow(null),
  marital_status: Joi.string().optional().allow(null, ""),
  address: Joi.string().optional().allow(null, ""),
  state_id: Joi.number().integer().optional().allow(null),
  district_id: Joi.number().integer().optional().allow(null),
  camp_id: Joi.number().integer().optional().allow(null),
  registration_type: Joi.string().valid("Camp", "Centre").optional().allow(null),
  donated_previously: Joi.boolean().optional(),
  willing_future_donation: Joi.boolean().optional(),
  contact_preference: Joi.boolean().optional(),
});

module.exports = {
  donorSchema,
  donorUpdateSchema,
};
