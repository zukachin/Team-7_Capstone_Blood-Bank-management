const express = require('express');
const router = express.Router();
const centresController = require('../controllers/centresController');
const { authenticate, authorize } = require('../middlewares/authMiddlewares');


router.post('/', authenticate, authorize(['SuperAdmin']), centresController.createCentre);

router.get('/', authenticate, centresController.getAllCentres);


router.get('/:id', authenticate, centresController.getCentreById);
router.get('/public/by-district', centresController.getCentresByDistrictPublic);

module.exports = router;
