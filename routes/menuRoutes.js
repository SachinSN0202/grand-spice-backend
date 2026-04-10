/**
 * Menu Routes
 * GET /api/menu           - Get all available menu items
 * GET /api/menu/:category - Get items by category
 * GET /api/menu/item/:id  - Get single item
 */
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get all available menu items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get items by category
router.get('/category/:category', async (req, res) => {
  try {
    const items = await MenuItem.find({
      category: req.params.category,
      isAvailable: true,
    });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single item
router.get('/item/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle availability (admin)
router.patch('/item/:id/toggle', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
