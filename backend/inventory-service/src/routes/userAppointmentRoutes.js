// src/routes/userAppointmentsRoutes.js
const express = require('express');
const router = express.Router();
const authenticateUserWithDonor = require('../middlewares/verifyUserWithDonor');
const ctrl = require('../controllers/userAppointmentsController');

router.get('/mine', authenticateUserWithDonor, ctrl.getMyAppointments);


module.exports = router;
