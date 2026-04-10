/**
 * Socket.io Event Handler
 * Manages real-time communication between all screens
 */

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // ── Join Rooms ─────────────────────────────────────────────────────────
    socket.on('join-table', (tableId) => {
      socket.join(`table-${tableId}`);
      console.log(`📱 Client joined table room: table-${tableId}`);
    });

    socket.on('join-counter', (counterName) => {
      socket.join(`counter-${counterName}`);
      console.log(`🍳 Client joined counter room: counter-${counterName}`);
    });

    socket.on('join-billing', () => {
      socket.join('billing');
      console.log(`💰 Client joined billing room`);
    });

    socket.on('join-admin', () => {
      socket.join('admin');
      console.log(`👨‍💼 Client joined admin room`);
    });

    // ── Order Events ───────────────────────────────────────────────────────
    // Emitted by server routes when new order placed
    socket.on('new-order', (orderData) => {
      // Notify each counter of its relevant items
      orderData.counterOrders.forEach((co) => {
        io.to(`counter-${co.counter}`).emit('new-order', {
          orderId: orderData.orderId,
          tableId: orderData.tableId,
          tableNumber: orderData.tableNumber,
          counterOrder: co,
          createdAt: orderData.createdAt,
        });
      });
      // Notify billing of full order
      io.to('billing').emit('new-order-billing', orderData);
      // Notify admin
      io.to('admin').emit('new-order-admin', orderData);
    });

    // Counter status update (emitted by counter staff pressing buttons)
    socket.on('update-counter-status', (data) => {
      const { orderId, counter, status, tableId } = data;
      // Notify customer table
      io.to(`table-${tableId}`).emit('counter-status-updated', { orderId, counter, status });
      // Notify billing
      io.to('billing').emit('counter-status-updated', { orderId, counter, status, tableId });
      // Notify admin
      io.to('admin').emit('counter-status-updated', { orderId, counter, status, tableId });
    });

    // Timer delayed event
    socket.on('timer-delayed', (data) => {
      const { orderId, counter, tableId } = data;
      io.to(`table-${tableId}`).emit('timer-delayed', { orderId, counter });
      io.to('billing').emit('timer-delayed', { orderId, counter, tableId });
    });

    // ── Waiter Call ────────────────────────────────────────────────────────
    socket.on('call-waiter', (data) => {
      io.to('admin').emit('waiter-called', data);
      console.log(`🔔 Waiter called at Table ${data.tableNumber}: ${data.reason}`);
    });

    // Waiter call acknowledged
    socket.on('acknowledge-waiter', (data) => {
      io.to(`table-${data.tableId}`).emit('waiter-acknowledged', data);
    });

    // ── Payment Events ─────────────────────────────────────────────────────
    socket.on('payment-confirmed', (data) => {
      io.to(`table-${data.tableId}`).emit('payment-confirmed', data);
      io.to('admin').emit('payment-confirmed', data);
    });

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};
