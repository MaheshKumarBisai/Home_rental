const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, isOwnerOrAdmin } = require('../middleware/authMiddleware');
const { validate, applySchema, updateApplicationStatusSchema } = require('../middleware/validation');

// Apply for a property
router.post('/apply', protect, validate(applySchema), bookingController.applyForProperty);

// Get all bookings for a user
router.get('/user/:id', protect, bookingController.getUserBookings);

// Get all bookings for a property (owner view)
router.get('/property/:id', protect, isOwnerOrAdmin, bookingController.getPropertyBookings);

// Get all bookings for the logged-in owner
router.get('/owner', protect, isOwnerOrAdmin, bookingController.getOwnerBookings);

// Get booking details
router.get('/:id', protect, bookingController.getBookingDetails);

// Cancel a booking
router.delete('/cancel/:id', protect, bookingController.cancelBooking);

// Update application status (accept/deny)
router.put('/applications/:id/status', protect, isOwnerOrAdmin, validate(updateApplicationStatusSchema), bookingController.updateApplicationStatus);

module.exports = router;
