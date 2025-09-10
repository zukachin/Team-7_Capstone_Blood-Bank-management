// src/validators/profileValidators.js
const { body } = require("express-validator");
const { pool } = require("../db/pool"); 
const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit phone numbers starting 6-9
const GENDER_ENUM = ["Male", "Female", "Other", "Prefer not to say"];

const profileUpdateValidators = [
  // At least one known field should be present - we'll rely on controller to check empty body.
  body("name")
    .optional()
    .isString().withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters long")
    .trim(),

  body("email")
    .optional()
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),

  body("phone")
    .optional()
    .matches(PHONE_REGEX).withMessage("Phone must be a valid 10-digit Indian number"),

  body("address")
    .optional()
    .isString().withMessage("Address must be string")
    .isLength({ max: 500 }).withMessage("Address too long")
    .trim(),

  body("age")
    .optional()
    .isInt({ min: 16, max: 120 }).withMessage("Age must be an integer between 16 and 120"),

  body("weight")
    .optional()
    .isFloat({ min: 30, max: 250 }).withMessage("Weight must be a number between 30 and 250 (kg)"),

  body("gender")
    .optional()
    .isIn(GENDER_ENUM).withMessage(`Gender must be one of: ${GENDER_ENUM.join(", ")}`),

  body("blood_group_id")
  .optional()
  .isInt({ min: 1 }).withMessage("blood_group_id must be a positive integer")
  .bail()
  .custom(async (val) => {
    const res = await pool.query("SELECT id FROM blood_groups WHERE id=$1 LIMIT 1", [val]);
    if (!res.rows.length) {
      throw new Error("blood_group_id does not exist");
    }
    return true;
  })
];

module.exports = profileUpdateValidators;
