// src/routes/testing.js
const express = require('express');
const router = express.Router();
const testing = require('../controllers/testing');
const { authenticate, authorize } = require('../middlewares/authMiddlewares'); // replace with your auth

router.patch('/api/testing/:collection_id', authenticate, authorize(['Admin','SuperAdmin','LabStaff']), testing.updateTesting);
router.get('/api/testing', authenticate, testing.listTesting);
router.get('/api/testing/:test_id', authenticate, testing.getTesting);

module.exports = router;
