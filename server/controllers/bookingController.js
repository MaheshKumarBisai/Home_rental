/**
 * BOOKING CONTROLLER
 * Handles property bookings with double-booking prevention
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route   POST /api/bookings/apply
 * @desc    Apply for a property
 * @access  Private (Renter)
 */
exports.applyForProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.validatedBody;
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
    if (property.availability === 'Booked') {
      return res.status(400).json({
        status: 'error',
        message: 'Property is no longer available'
      });
    }

    // Check if user is trying to book their own property
    if (property.ownerId === renterId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot apply for your own property'
      });
    }

    // Check if user has already applied for this property
    const existingApplication = await prisma.booking.findFirst({
        where: {
            propertyId,
            renterId
        }
    });

    if (existingApplication) {
        return res.status(409).json({
            status: 'error',
            message: 'You have already applied for this property.'
        });
    }

    // Create application (booking with PENDING status)
    const application = await prisma.booking.create({
      data: {
        propertyId,
        renterId,
        status: 'PENDING'
      },
      include: {
        property: {
          select: {
            title: true,
            address: true,
            city: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: { application }
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

/**
 * @route   PUT /api/bookings/applications/:id/status
 * @desc    Update application status (Accept/Deny)
 * @access  Private (Owner/Admin)
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects "ACCEPTED" or "DENIED"

    if (!['ACCEPTED', 'DENIED'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be ACCEPTED or DENIED.'
      });
    }

    // Find the application/booking
    const application = await prisma.booking.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    // Check permissions (only property owner or admin can decide)
    if (application.property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this application'
      });
    }

    // Update the application status
    const updatedApplication = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    // If accepted, update property availability and deny other applications
    if (status === 'ACCEPTED') {
      // Mark property as booked
      await prisma.property.update({
        where: { id: application.propertyId },
        data: { availability: 'Booked' }
      });

      // Deny other pending applications for this property
      await prisma.booking.updateMany({
        where: {
          propertyId: application.propertyId,
          status: 'PENDING',
          id: { not: id } // Exclude the current application
        },
        data: { status: 'DENIED' }
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Application has been ${status.toLowerCase()}.`,
      data: { application: updatedApplication }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookings/owner
 * @desc    Get all bookings for all properties of the logged-in owner
 * @access  Private (Owner)
 */
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: {
        property: {
          ownerId: ownerId,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
          },
        },
        renter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;