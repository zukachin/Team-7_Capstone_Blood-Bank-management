const express = require('express');
const router = express.Router();
const adminsController = require('../controllers/adminsController');
const { authenticate, authorize } = require('../middlewares/authMiddlewares');


router.post('/', authenticate, authorize(['SuperAdmin']), adminsController.createAdmin);
router.get('/', authenticate, adminsController.getAdmins);
router.get('/:id', authenticate, adminsController.getAdminById);
router.patch('/:id', authenticate, adminsController.updateAdmin);

module.exports = router;
