// src/validators/donorValidator.js
const Joi = require("joi");

const normalizeEnum = (allowed) =>
  Joi.string()
    .valid(...allowed)
    .insensitive()
    .custom((v, helpers) => {
      const match = allowed.find(a => a.toLowerCase() === String(v).toLowerCase());
      return match || helpers.error("any.invalid");
    });

const donorSchema = Joi.object({
  first_name: Joi.string().max(50).required(),
  last_name: Joi.string().max(50).required(),
  dob: Joi.date().required(),
  age: Joi.number().integer().min(18).required(),
  gender: normalizeEnum(["Male", "Female", "Other"]).required(),
  mobile_no: Joi.string().pattern(/^\d{10}$/).required(),
  email: Joi.string().email().optional().allow(""),
  blood_group_id: Joi.number().integer().optional(),
  marital_status: normalizeEnum(["Single", "Married", "Divorced", "Widowed"]).optional(),
  address: Joi.string().optional().allow(""),
  district: Joi.string().optional().allow(""),
  state: Joi.string().optional().allow(""),
  country: Joi.string().optional().allow(""),
  registration_type: normalizeEnum(["Centre", "Camp"]).required(),
  donated_previously: Joi.boolean().optional(),
  willing_future_donation: Joi.boolean().optional(),
  contact_preference: Joi.boolean().optional(),
  camp_id: Joi.number().integer().optional(),
  // Only SuperAdmin can use this; Admin value (if sent) will be ignored in controller
  centre_id: Joi.string().length(1).uppercase().pattern(/^[A-Z]$/).optional(),
});

const donorUpdateSchema = Joi.object({
  first_name: Joi.string().max(50).optional(),
  last_name: Joi.string().max(50).optional(),
  dob: Joi.date().optional(),
  age: Joi.number().integer().min(18).optional(),
  gender: normalizeEnum(["Male", "Female", "Other"]).optional(),
  mobile_no: Joi.string().pattern(/^\d{10}$/).optional(),
  email: Joi.string().email().optional().allow(""),
  blood_group_id: Joi.number().integer().optional(),
  marital_status: normalizeEnum(["Single", "Married", "Divorced", "Widowed"]).optional(),
  address: Joi.string().optional().allow(""),
  district: Joi.string().optional().allow(""),
  state: Joi.string().optional().allow(""),
  country: Joi.string().optional().allow(""),
  registration_type: normalizeEnum(["Centre", "Camp"]).optional(),
  donated_previously: Joi.boolean().optional(),
  willing_future_donation: Joi.boolean().optional(),
  contact_preference: Joi.boolean().optional(),
  camp_id: Joi.number().integer().optional(),
  // Only SuperAdmin may change this (controller enforces)
  centre_id: Joi.string().length(1).uppercase().pattern(/^[A-Z]$/).optional(),
}).min(1); // must send at least one field

module.exports = { donorSchema, donorUpdateSchema };
