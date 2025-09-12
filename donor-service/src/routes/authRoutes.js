// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // all controller funcs
const validators = require('../validators/authValidators');     // import whole validators module
const { body } = require('express-validator');

// quick runtime sanity check (will print once when module loads)
(function sanityChecks() {
  // controller functions we expect
  const expectedCtrls = ['register','verifyOtp','resendOtp','login','forgotPassword','resetPassword'];
  expectedCtrls.forEach(fn => {
    if (typeof authController[fn] !== 'function') {
      console.warn(`[authRoutes] Warning: authController.${fn} is not a function (typeof=${typeof authController[fn]})`);
    }
  });

  // validator functions we expect
  const expectedVals = [
    'nameRules','emailRules','passwordRules','phoneRules',
    'genderRules','stateIdRules','districtIdRules','addressRules',
    'otpRules','handleValidation'
  ];
  expectedVals.forEach(v => {
    if (typeof validators[v] === 'undefined') {
      console.warn(`[authRoutes] Warning: validators.${v} is undefined`);
    }
  });
})();

// simple health check
router.get('/', (req, res) => res.send('Hello from auth'));

// Register
router.post(
  '/register',
  [
    validators.nameRules,
    validators.emailRules,
    validators.passwordRules,
    validators.phoneRules,
    validators.genderRules,
    validators.stateIdRules,
    validators.districtIdRules,
    validators.addressRules,
    validators.ageRules,
    validators.bloodGroupRules
  ],
  validators.handleValidation,
  authController.register
);

// Verify OTP
router.post(
  '/verify-otp',
  [validators.emailRules, validators.otpRules],
  validators.handleValidation,
  authController.verifyOtp
);

// Resend OTP
router.post(
  '/resend-otp',
  [validators.emailRules],
  validators.handleValidation,
  authController.resendOtp
);

// Login
router.post(
  '/login',
  [
    validators.emailRules,
    body('password').exists({ checkFalsy: true }).withMessage('Password required')
  ],
  validators.handleValidation,
  authController.login
);

// Forgot password
router.post(
  '/forgot-password',
  [validators.emailRules],
  validators.handleValidation,
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [validators.emailRules, validators.otpRules, body('newPassword').isLength({ min: 8 }).withMessage('New password must be 8+ chars')],
  validators.handleValidation,
  authController.resetPassword
);

module.exports = router;
