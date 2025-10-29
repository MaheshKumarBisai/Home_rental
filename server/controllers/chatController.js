/**
 * CHAT CONTROLLER
 * Handles chat message retrieval
 */

const { Message, Booking, User } = require('../models');

/**
 * @route   GET /api/chat/booking/:id
 * @desc    Get chat history for a booking
 * @access  Private
 */
exports.getChatHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if booking exists
    const booking = await Booking.findByPk(id, {
        include: {
            model: Property,
            as: 'property',
            attributes: ['ownerId']
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
    const messages = await Message.findAll({
      where: { bookingId: id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'fullName', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'fullName', 'avatar']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Mark messages as read for current user
    await Message.update({ isRead: true }, {
      where: {
        bookingId: id,
        receiverId: req.user.id,
        isRead: false
      }
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
