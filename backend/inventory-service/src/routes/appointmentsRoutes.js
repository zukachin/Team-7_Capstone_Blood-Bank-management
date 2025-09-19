// src/routes/appointmentsRoutes.js
const express = require('express');
const router = express.Router();
const authenticateUserWithDonor = require('../middlewares/verifyUserWithDonor');
const authenticateAdminMiddleware = require('../middlewares/authMiddlewares'); // your existing file exports authenticate & authorize
const apptCtrl = require('../controllers/appointmentsController');
const adminApptCtrl = require('../controllers/adminsAppointmentsController');

// user creates appointment (user token from donor service)
router.post('/', authenticateUserWithDonor, apptCtrl.createAppointment);

// admin list & update (use authenticate from your authMiddlewares file)
router.get('/admin', authenticateAdminMiddleware.authenticate, authenticateAdminMiddleware.authorize(['Admin','SuperAdmin']), adminApptCtrl.listAppointmentsForAdmin);
router.patch('/:id/status', authenticateAdminMiddleware.authenticate, authenticateAdminMiddleware.authorize(['Admin','SuperAdmin']), adminApptCtrl.updateAppointmentStatus);
// user deletes/cancels their appointment
router.delete('/:id', authenticateUserWithDonor, apptCtrl.deleteAppointment);

module.exports = router;
