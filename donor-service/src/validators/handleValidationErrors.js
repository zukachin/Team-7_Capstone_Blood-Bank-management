// src/validators/handleValidationErrors.js
const { validationResult } = require("express-validator");

/**
 * Call this after validators in route handlers.
 * Returns 400 with standardized error array if validation failed.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  // Map errors to { field, msg } format
  const formatted = errors.array().map(err => ({
    field: err.param,
    msg: err.msg
  }));

  return res.status(400).json({
    message: "Validation failed",
    errors: formatted
  });
}

module.exports = handleValidationErrors;
