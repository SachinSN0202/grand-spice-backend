/**
 * Table Routes
 */
const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// GET all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json({ success: true, data: tables });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single table
router.get('/:tableId', async (req, res) => {
  try {
    const table = await Table.findOne({ tableId: req.params.tableId });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update table status
router.patch('/:tableId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findOneAndUpdate(
      { tableId: req.params.tableId },
      { status },
      { new: true }
    );
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
