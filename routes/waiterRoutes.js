/**
 * Waiter Call Routes
 */
const express = require('express');
const router = express.Router();
const WaiterCall = require('../models/WaiterCall');

// POST - Create a waiter call
router.post('/', async (req, res) => {
  const io = req.app.get('io');
  try {
    const { tableId, tableNumber, reason, message } = req.body;
    const call = await WaiterCall.create({ tableId, tableNumber, reason, message });

    // Notify admin room instantly
    io.to('admin').emit('waiter-called', {
      _id: call._id,
      tableId,
      tableNumber,
      reason,
      message,
      createdAt: call.createdAt,
    });

    res.status(201).json({ success: true, data: call });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - All pending waiter calls
router.get('/', async (req, res) => {
  try {
    const calls = await WaiterCall.find({ status: { $ne: 'resolved' } }).sort({ createdAt: -1 });
    res.json({ success: true, data: calls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH - Acknowledge/resolve waiter call
router.patch('/:id/status', async (req, res) => {
  const io = req.app.get('io');
  try {
    const { status } = req.body;
    const call = await WaiterCall.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!call) return res.status(404).json({ success: false, message: 'Call not found' });

    io.to(`table-${call.tableId}`).emit('waiter-acknowledged', {
      tableId: call.tableId,
      status,
    });

    res.json({ success: true, data: call });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
