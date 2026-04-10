/**
 * Order Routes
 */
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');

// POST /api/orders - Place a new order
router.post('/', async (req, res) => {
  const io = req.app.get('io');
  try {
    const { tableId, items, customerNote, language } = req.body;

    // Validate table
    const table = await Table.findOne({ tableId });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

    // Fetch menu items and group by counter
    const counterMap = {};
    let subtotal = 0;

    for (const cartItem of items) {
      const menuItem = await MenuItem.findById(cartItem.menuItemId);
      if (!menuItem || !menuItem.isAvailable) continue;

      const counter = menuItem.counter;
      if (!counterMap[counter]) counterMap[counter] = { counter, items: [], counterTotal: 0 };

      const lineTotal = menuItem.price * cartItem.quantity;
      subtotal += lineTotal;

      counterMap[counter].items.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: cartItem.quantity,
        isVeg: menuItem.isVeg,
        preparationTime: menuItem.preparationTime,
      });
      counterMap[counter].counterTotal += lineTotal;
    }

    // Compute estimated time per counter (max prep time of items)
    Object.values(counterMap).forEach((co) => {
      co.estimatedTime = Math.max(...co.items.map((i) => i.preparationTime));
    });

    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const grandTotal = parseFloat((subtotal + tax).toFixed(2));
    const timestamp = Date.now();
    const orderId = `ORD-${table.tableNumber.toString().padStart(3, '0')}-${timestamp}`;

    const order = await Order.create({
      orderId,
      tableId,
      tableNumber: table.tableNumber,
      counterOrders: Object.values(counterMap),
      subtotal,
      tax,
      grandTotal,
      customerNote: customerNote || '',
      language: language || 'en',
    });

    // Update table status
    await Table.findOneAndUpdate({ tableId }, { status: 'occupied', currentOrderId: orderId });

    // Emit to all relevant rooms
    const orderData = order.toObject();
    orderData.counterOrders.forEach((co) => {
      io.to(`counter-${co.counter}`).emit('new-order', {
        orderId: order.orderId,
        tableId: order.tableId,
        tableNumber: order.tableNumber,
        counterOrder: co,
        createdAt: order.createdAt,
      });
    });
    io.to('billing').emit('new-order-billing', orderData);
    io.to('admin').emit('new-order-admin', orderData);

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:orderId - Get order by orderId
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders - Get all active orders (billing/admin)
router.get('/', async (req, res) => {
  try {
    const { status, tableId } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (tableId) query.tableId = tableId;
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:orderId/counter-status - Update counter status
router.patch('/:orderId/counter-status', async (req, res) => {
  const io = req.app.get('io');
  try {
    const { counter, status } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const counterOrder = order.counterOrders.find((co) => co.counter === counter);
    if (!counterOrder) return res.status(404).json({ success: false, message: 'Counter order not found' });

    counterOrder.status = status;
    counterOrder.statusUpdatedAt = new Date();

    if (status === 'preparing') {
      counterOrder.preparingStartedAt = new Date();
    }

    await order.save();

    // Emit real-time update
    io.to(`table-${order.tableId}`).emit('counter-status-updated', {
      orderId: order.orderId,
      counter,
      status,
    });
    io.to('billing').emit('counter-status-updated', {
      orderId: order.orderId, counter, status, tableId: order.tableId,
    });
    io.to('admin').emit('counter-status-updated', {
      orderId: order.orderId, counter, status, tableId: order.tableId,
    });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:orderId/payment - Mark as paid
router.patch('/:orderId/payment', async (req, res) => {
  const io = req.app.get('io');
  try {
    const { paymentMethod } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod;
    order.orderStatus = 'completed';
    await order.save();

    // Free the table
    await Table.findOneAndUpdate(
      { tableId: order.tableId },
      { status: 'available', currentOrderId: null }
    );

    io.to(`table-${order.tableId}`).emit('payment-confirmed', { orderId: order.orderId });
    io.to('billing').emit('order-completed', { orderId: order.orderId, tableId: order.tableId });
    io.to('admin').emit('order-completed', { orderId: order.orderId });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
