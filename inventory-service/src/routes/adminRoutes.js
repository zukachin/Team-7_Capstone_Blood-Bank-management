const express = require('express');
const router = express.Router();
const adminsController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/authMiddlewares');

// console.log('adminsController:', adminsController);

// Create a new admin (SuperAdmin only)
router.post('/', authenticate, authorize(['SuperAdmin']), adminsController.createAdmin);

// Get all admins (SuperAdmin) or own data (Admin)
router.get('/', authenticate, adminsController.getAdmins);

// Get single admin by ID
router.get('/:id', authenticate, adminsController.getAdminById);

// Update admin
router.patch('/:id', authenticate, adminsController.updateAdmin);

// ✅ Get donor registration notifications (Admin)
router.get('/notifications', authenticate, authorize(['Admin', 'SuperAdmin']), adminsController.getDonorNotifications);

// ✅ Accept a donor notification (Admin)
router.post('/notifications/:donorId/accept', authenticate, authorize(['Admin', 'SuperAdmin']), adminsController.acceptDonorNotification);

module.exports = router;
