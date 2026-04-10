/**
 * Table Model
 * 15 tables (TABLE-001 to TABLE-015)
 */
const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableId: { type: String, required: true, unique: true }, // TABLE-001
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, default: 4 },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available',
  },
  qrCode: { type: String, default: '' }, // Base64 QR code image
  currentOrderId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
