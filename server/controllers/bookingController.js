/**
 * BOOKING CONTROLLER
 * Handles property bookings with double-booking prevention
 */

const { Booking, Property, User } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   POST /api/bookings/apply
 * @desc    Apply for a property
 * @access  Private (Renter)
 */
exports.applyForProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.body;
    const renterId = req.user.id;

    // Check if property exists
    const property = await Property.findByPk(propertyId);

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
    const existingApplication = await Booking.findOne({
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
    const application = await Booking.create({
      propertyId,
      renterId,
      status: 'PENDING'
    });

    const applicationWithProperty = await Booking.findByPk(application.id, {
        include: {
            model: Property,
            as: 'property',
            attributes: ['title', 'address', 'city']
        }
    });

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: { application: applicationWithProperty }
    });

  } catch (error) {
    console.error('Error in applyForProperty:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
    if (req.user.id !== parseInt(id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view these bookings'
      });
    }

    const bookings = await Booking.findAll({
      where: { renterId: id },
      include: {
        model: Property,
        as: 'property',
        attributes: ['id', 'title', 'address', 'city', 'images', 'price']
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });

  } catch (error) {
    console.error('Error in getUserBookings:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
    const property = await Property.findByPk(id);

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

    const bookings = await Booking.findAll({
      where: { propertyId: id },
      include: {
        model: User,
        as: 'renter',
        attributes: ['id', 'fullName', 'email', 'phone', 'avatar']
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });

  } catch (error) {
    console.error('Error in getPropertyBookings:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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

    const booking = await Booking.findByPk(id, {
        include: [
            {
                model: Property,
                as: 'property',
                include: {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'fullName', 'email', 'phone', 'avatar']
                }
            },
            {
                model: User,
                as: 'renter',
                attributes: ['id', 'fullName', 'email', 'phone', 'avatar']
            }
        ]
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
    console.error('Error in getBookingDetails:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
    const booking = await Booking.findByPk(id, { include: 'property' });

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
    await Booking.update({ status: 'CANCELLED' }, { where: { id }});
    const cancelledBooking = await Booking.findByPk(id);

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: { booking: cancelledBooking }
    });

  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
    const application = await Booking.findByPk(id, { include: 'property' });

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
    await Booking.update({ status }, { where: { id }});
    const updatedApplication = await Booking.findByPk(id);

    // If accepted, update property availability and deny other applications
    if (status === 'ACCEPTED') {
      // Mark property as booked
      await Property.update({ availability: 'Booked' }, { where: { id: application.propertyId } });

      // Deny other pending applications for this property
      await Booking.update({ status: 'DENIED' }, {
        where: {
          propertyId: application.propertyId,
          status: 'PENDING',
          id: { [Op.ne]: id } // Exclude the current application
        }
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Application has been ${status.toLowerCase()}.`,
      data: { application: updatedApplication }
    });

  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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

    const bookings = await Booking.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          where: { ownerId },
          attributes: ['id', 'title', 'city']
        },
        {
          model: User,
          as: 'renter',
          attributes: ['id', 'fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    console.error('Error in getOwnerBookings:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

module.exports = exports;
