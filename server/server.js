/**
 * SERVER.JS - Application Entry Point
 * Initializes HTTP server and Socket.io for real-time communication
 */

const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io for real-time chat
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Join a specific booking chat room
  socket.on('joinRoom', ({ bookingId }) => {
    socket.join(bookingId);
    console.log(`👤 User ${socket.id} joined room: ${bookingId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async ({ bookingId, senderId, receiverId, message }) => {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Save message to database
      const newMessage = await prisma.message.create({
        data: {
          bookingId,
          senderId,
          receiverId,
          message
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        }
      });

      // Emit message to all users in the booking room
      io.to(bookingId).emit('receiveMessage', newMessage);

      await prisma.$disconnect();
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log('=====================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log('=====================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = { io };