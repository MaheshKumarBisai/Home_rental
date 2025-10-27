/**
 * BOOKING ROUTES
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, isOwnerOrAdmin } = require('../middleware/authMiddleware');
const { validate, applyForPropertySchema, updateApplicationStatusSchema } = require('../middleware/validation');

// @route   POST /api/bookings/apply
// @desc    Apply for a property
// @access  Private (Renter)
router.post(
  '/apply',
  protect,
  validate(applyForPropertySchema),
  bookingController.applyForProperty
);

// @route   GET /api/bookings/user/:id
// @desc    Get all bookings for a specific user
// @access  Private
router.get('/user/:id', protect, bookingController.getUserBookings);

// @route   GET /api/bookings/owner
// @desc    Get all bookings for the logged-in owner's properties
// @access  Private (Owner)
router.get('/owner', protect, isOwnerOrAdmin, bookingController.getOwnerBookings);

// @route   GET /api/bookings/property/:id
// @desc    Get all bookings for a specific property
// @access  Private (Owner/Admin)
router.get('/property/:id', protect, isOwnerOrAdmin, bookingController.getPropertyBookings);

// @route   PUT /api/bookings/applications/:id/status
// @desc    Update the status of a booking application
// @access  Private (Owner/Admin)
router.put(
  '/applications/:id/status',
  protect,
  isOwnerOrAdmin,
  validate(updateApplicationStatusSchema),
  bookingController.updateApplicationStatus
);

// @route   GET /api/bookings/:id
// @desc    Get details of a specific booking
// @access  Private
router.get('/:id', protect, bookingController.getBookingDetails);

// @route   DELETE /api/bookings/cancel/:id
// @desc    Cancel a booking
// @access  Private
router.delete('/cancel/:id', protect, bookingController.cancelBooking);

module.exports = router;
