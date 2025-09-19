// src/routes/collections.js
const express = require('express');
const router = express.Router();
const collections = require('../controllers/collections');
const { authenticate, authorize } = require('../middlewares/authMiddlewares'); // replace with your auth

router.post('/api/collections', authenticate, authorize(['Admin','SuperAdmin','Organizer','LabStaff']), collections.createCollection);
router.get('/api/collections', authenticate, collections.listCollections);
router.get('/api/collections/:collection_id', authenticate, collections.getCollection);

module.exports = router;
