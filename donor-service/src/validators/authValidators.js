// validators/authValidators.js
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool'); // make sure path is correct

const nameRules = body('name')
  .exists({ checkNull: true, checkFalsy: true }).withMessage('Name is required')
  .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters');

const emailRules = body('email')
  .exists({ checkNull: true, checkFalsy: true }).withMessage('Email is required')
  .isEmail().withMessage('Invalid email address')
  .normalizeEmail();

const passwordRules = body('password')
  .exists({ checkNull: true, checkFalsy: true }).withMessage('Password is required')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
  .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
  .matches(/\d/).withMessage('Password must contain a digit')
  .matches(/[@$!%*?&#^()_\-+=]/).withMessage('Password must contain a special character');

const phoneRules = body('phone')
  .optional({ nullable: true, checkFalsy: true })
  .matches(/^\+?\d{7,15}$/).withMessage('Phone must be digits (optional +) and 7-15 characters');

// gender: accept limited set
// gender: must be one of the ENUM values
const genderRules = body('gender')
  .exists({ checkFalsy: true }).withMessage('Gender is required')
  .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other');

// state and district: required (you asked to include those in registration)

// validators/authValidators.js (excerpt)


const stateIdRules = body('state_id')
  .exists({ checkFalsy: true }).withMessage('state_id is required')
  .bail()
  .isInt({ gt: 0 }).withMessage('state_id must be a positive integer')
  .bail()
  .custom(async (state_id) => {
    try {
      const r = await pool.query('SELECT state_id FROM states WHERE state_id = $1', [state_id]);
      if (!r.rows.length) throw new Error('Invalid state');
      return true;
    } catch (err) {
      console.error('state validator DB error:', err.message);
      // throw a user-friendly message so express-validator handles it
      throw new Error('Could not validate state (internal error)');
    }
  });

const districtIdRules = body('district_id')
  .exists({ checkFalsy: true }).withMessage('district_id is required')
  .bail()
  .isInt({ gt: 0 }).withMessage('district_id must be a positive integer')
  .bail()
  .custom(async (district_id, { req }) => {
    const stateId = Number(req.body.state_id);
    if (!Number.isInteger(stateId) || stateId <= 0) throw new Error('state_id must be provided and valid before district validation');

    try {
      const r = await pool.query('SELECT district_id FROM districts WHERE district_id = $1 AND state_id = $2', [district_id, stateId]);
      if (!r.rows.length) throw new Error('Invalid district for the selected state');
      return true;
    } catch (err) {
      console.error('district validator DB error:', err.message);
      throw new Error('Could not validate district (internal error)');
    }
  });

const addressRules = body('address')
  .exists({ checkNull: true, checkFalsy: true }).withMessage('Address is required')
  .isLength({ min: 5, max: 500 }).withMessage('Address must be 5-500 characters');

const otpRules = body('otp')
  .exists({ checkNull: true, checkFalsy: true }).withMessage('OTP is required')
  .isLength({ min: 4, max: 8 }).withMessage('OTP must be 4-8 digits')
  .matches(/^\d+$/).withMessage('OTP must be numeric');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = {};
  errors.array().forEach(err => {
    if (!formatted[err.param]) formatted[err.param] = err.msg;
  });

  return res.status(400).json({ message: 'Validation failed', errors: formatted });
};

module.exports = {
  nameRules,
  emailRules,
  passwordRules,
  phoneRules,
  genderRules,
  stateIdRules,
  districtIdRules,
  addressRules,
  otpRules,
  handleValidation
};
