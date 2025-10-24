/**
 * BOOKING CONTROLLER
 * Handles property bookings with double-booking prevention
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Check for date conflicts
 */
const checkDateConflict = async (propertyId, checkInDate, checkOutDate, excludeBookingId = null) => {
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      propertyId,
      status: 'CONFIRMED',
      ...(excludeBookingId && { id: { not: excludeBookingId } }),
      OR: [
        {
          // New booking starts during existing booking
          AND: [
            { checkInDate: { lte: checkInDate } },
            { checkOutDate: { gt: checkInDate } }
          ]
        },
        {
          // New booking ends during existing booking
          AND: [
            { checkInDate: { lt: checkOutDate } },
            { checkOutDate: { gte: checkOutDate } }
          ]
        },
        {
          // New booking completely covers existing booking
          AND: [
            { checkInDate: { gte: checkInDate } },
            { checkOutDate: { lte: checkOutDate } }
          ]
        }
      ]
    }
  });

  return conflictingBooking !== null;
};

/**
 * Calculate total price
 */
const calculateTotalPrice = (checkInDate, checkOutDate, pricePerNight) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return nights * pricePerNight;
};

/**
 * @route   POST /api/bookings/create
 * @desc    Create new booking
 * @access  Private
 */
exports.createBooking = async (req, res, next) => {
  try {
    const { propertyId, checkInDate, checkOutDate } = req.validatedBody;
    const renterId = req.user.id;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check if property is available
    if (!property.isAvailable) {
      return res.status(400).json({
        status: 'error',
        message: 'Property is not available for booking'
      });
    }

    // Check if user is trying to book their own property
    if (property.ownerId === renterId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot book your own property'
      });
    }

    // Check for date conflicts (PREVENT DOUBLE-BOOKING)
    const hasConflict = await checkDateConflict(propertyId, new Date(checkInDate), new Date(checkOutDate));

    if (hasConflict) {
      return res.status(409).json({
        status: 'error',
        message: 'Property is already booked for selected dates. Please choose different dates.'
      });
    }

    // Calculate total price
    const totalPrice = calculateTotalPrice(checkInDate, checkOutDate, property.price);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        propertyId,
        renterId,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        totalPrice,
        status: 'CONFIRMED'
      },
      include: {
        property: {
          select: {
            title: true,
            address: true,
            city: true,
            images: true
          }
        },
        renter: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: { booking }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookings/user/:id
 * @desc    Get all bookings by user
 * @access  Private
 */
exports.getUserBookings = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user can access these bookings
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view these bookings'
      });
    }

    const bookings = await prisma.booking.findMany({
      where: { renterId: id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            images: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookings/property/:id
 * @desc    Get all bookings for a property
 * @access  Private (Owner/Admin)
 */
exports.getPropertyBookings = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check if user is owner or admin
    if (property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view these bookings'
      });
    }

    const bookings = await prisma.booking.findMany({
      where: { propertyId: id },
      include: {
        renter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details
 * @access  Private
 */
exports.getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profileImage: true
              }
            }
          }
        },
        renter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check permissions
    const isOwner = booking.property.ownerId === req.user.id;
    const isRenter = booking.renterId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isRenter && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this booking'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/bookings/cancel/:id
 * @desc    Cancel booking
 * @access  Private
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if booking is already cancelled
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        status: 'error',
        message: 'Booking is already cancelled'
      });
    }

    // Check permissions (renter, owner, or admin)
    const isRenter = booking.renterId === req.user.id;
    const isOwner = booking.property.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isRenter && !isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to cancel this booking'
      });
    }

    // Update booking status
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: { booking: cancelledBooking }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = exports;