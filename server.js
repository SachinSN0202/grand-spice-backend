/**
 * Grand Spice - Hotel Smart Ordering System
 * Main Server Entry Point
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'https://grand-spice-frontend.onrender.com',
  'https://grand-spice-frontend-01.onrender.com',
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    credentials: true,
  },
});

// Make io available to routes
app.set('io', io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/waiter', require('./routes/waiterRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Grand Spice API running 🍽️', time: new Date().toISOString() });
});

// ─── Socket.io Handler ────────────────────────────────────────────────────────
require('./socket/socketHandler')(io);

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/grand-spice';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(' MongoDB connected successfully');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Grand Spice server running on http://localhost:${PORT}`);
      console.log(`🔌 Socket.io ready for real-time connections`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = { io };
