/**
 * MenuItem Model
 * Stores all food/beverage items with multilingual names
 */
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameTranslations: {
    hi: { type: String, default: '' }, // Hindi
    kn: { type: String, default: '' }, // Kannada
    ta: { type: String, default: '' }, // Tamil
    te: { type: String, default: '' }, // Telugu
  },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['South Indian', 'North Indian', 'Chinese', 'Chats', 'Juice', 'Tea'],
  },
  counter: {
    type: String,
    required: true,
    enum: ['South Indian', 'North Indian', 'Chinese', 'Chats', 'Juice', 'Tea'],
  },
  isVeg: { type: Boolean, default: true },
  spiceLevel: { type: String, enum: ['mild', 'medium', 'hot'], default: 'mild' },
  preparationTime: { type: Number, default: 10, min: 1 }, // in minutes
  isAvailable: { type: Boolean, default: true },
  image: { type: String, default: '' }, // Unsplash URL or emoji
  emoji: { type: String, default: '🍽️' },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
