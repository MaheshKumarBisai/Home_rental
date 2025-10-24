/**
 * CHAT CONTROLLER
 * Handles chat message retrieval
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route   GET /api/chat/booking/:id
 * @desc    Get chat history for a booking
 * @access  Private
 */
exports.getChatHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          select: { ownerId: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user is part of this booking
    const isRenter = booking.renterId === req.user.id;
    const isOwner = booking.property.ownerId === req.user.id;

    if (!isRenter && !isOwner && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this chat'
      });
    }

    // Get all messages for this booking
    const messages = await prisma.message.findMany({
      where: { bookingId: id },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read for current user
    await prisma.message.updateMany({
      where: {
        bookingId: id,
        receiverId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: { messages }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = exports;