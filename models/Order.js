/**
 * Order Model
 * Stores customer orders with per-counter sub-documents
 */
const mongoose = require('mongoose');

// Sub-document: individual item within a counter order
const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isVeg: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 10 },
});

// Sub-document: order for one specific counter
const counterOrderSchema = new mongoose.Schema({
  counter: {
    type: String,
    required: true,
    enum: ['South Indian', 'North Indian', 'Chinese', 'Chats', 'Juice', 'Tea'],
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivered', 'delayed'],
    default: 'pending',
  },
  estimatedTime: { type: Number, default: 0 }, // max prep time in minutes
  preparingStartedAt: { type: Date, default: null },
  statusUpdatedAt: { type: Date, default: Date.now },
  counterTotal: { type: Number, default: 0 },
});

// Main Order schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  tableId: { type: String, required: true },   // e.g. "TABLE-001"
  tableNumber: { type: Number, required: true }, // e.g. 1
  counterOrders: [counterOrderSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },         // 5% GST
  grandTotal: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'qr', null],
    default: null,
  },
  orderStatus: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  customerNote: { type: String, default: '' },
  language: { type: String, default: 'en' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
