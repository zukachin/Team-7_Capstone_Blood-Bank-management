// src/routes/segregation.js
const express = require('express');
const router = express.Router();
const segCtrl = require('../controllers/segregation');
const { authenticate, authorize } = require('../middlewares/authMiddlewares'); // use your auth

// segregate a collection (Admin/SuperAdmin or centre-bound Organizer/LabStaff)
router.post('/api/segregation/:collection_id', authenticate, authorize(['Admin','SuperAdmin','Organizer','LabStaff']), segCtrl.segregateCollection);

// list segregations
router.get('/api/segregation', authenticate, segCtrl.listSegregations);

// get segregation by id
router.get('/api/segregation/:segregation_id', authenticate, segCtrl.getSegregation);

module.exports = router;
