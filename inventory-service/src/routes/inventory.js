// src/routes/inventory.js
const express = require('express');
const router = express.Router();
const inv = require('../controllers/inventory');
const { authenticate, authorize } = require('../middlewares/authMiddlewares'); // adjust path if needed

// Specific endpoints — put these BEFORE the param route to avoid ":inventory_id" capturing names
router.get('/api/inventory/summary', authenticate, inv.getInventorySummary);
router.get('/api/inventory/low-stock', authenticate, inv.getLowStock);
router.get('/api/inventory/export.csv', authenticate, inv.exportInventoryCSV);

// Admin-only global summary
router.get('/api/inventory/global-summary', authenticate, authorize(['Admin', 'SuperAdmin']), inv.getInventoryGlobal);

// List inventory (query filters)
router.get('/api/inventory', authenticate, inv.listInventory);

// Numeric-only inventory_id route using character class to avoid backslash issues
//router.get('/api/inventory/:inventory_id([0-9]+)', authenticate, inv.getInventory);

module.exports = router;
