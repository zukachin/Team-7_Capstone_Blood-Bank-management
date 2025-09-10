const express = require('express');
const router = express.Router();
const organizerCtrl = require('../controllers/organizersController');
const campsCtrl = require('../controllers/campsController');
const  authenticateUserWithDonor  = require('../middlewares/verifyUserWithDonor'); // user token
const { authenticate, authorize } = require('../middlewares/authMiddlewares'); // admin token

// Organizer: register / apply to be organizer (user provides details)
router.post('/organizers', authenticateUserWithDonor, organizerCtrl.registerOrganizer);

// Organizer: create camp (must be organizer user)
router.post('/camps', authenticateUserWithDonor, campsCtrl.createCamp);

// Organizer: get own camps
router.get('/organizers/me/camps', authenticateUserWithDonor, campsCtrl.listMyCamps);

// Admin: list camps for centre (or district)
router.get('/admin/camps', authenticate, campsCtrl.listCampsForAdmin);

// Admin: approve / reject camp
router.patch('/admin/camps/:id/status', authenticate, campsCtrl.updateCampStatus);

// Public: list approved camps by district (for users)
router.get('/public/by-district', campsCtrl.getApprovedCampsByDistrict);

router.get('/public/search', campsCtrl.searchApprovedCamps);

module.exports = router;
