/**
 * BOOKING ROUTES
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { validate, createBookingSchema } = require('../middleware/validation');

// All booking routes are protected
router.post(
  '/create',
  protect,
  validate(createBookingSchema),
  bookingController.createBooking
);

router.get('/user/:id', protect, bookingController.getUserBookings);
router.get('/property/:id', protect, bookingController.getPropertyBookings);
router.get('/:id', protect, bookingController.getBookingDetails);
router.delete('/cancel/:id', protect, bookingController.cancelBooking);

module.exports = router;