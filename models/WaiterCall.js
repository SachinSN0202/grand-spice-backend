/**
 * WaiterCall Model
 * Tracks customer requests for waiter assistance
 */
const mongoose = require('mongoose');

const waiterCallSchema = new mongoose.Schema({
  tableId: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  reason: {
    type: String,
    enum: ['waiter', 'help', 'bill', 'issue'],
    default: 'waiter',
  },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'resolved'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('WaiterCall', waiterCallSchema);
