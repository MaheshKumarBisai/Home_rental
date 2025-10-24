/**
 * REVIEW ROUTES
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validate, createReviewSchema } = require('../middleware/validation');

// Public route
router.get('/property/:id', reviewController.getPropertyReviews);

// Protected routes
router.post(
  '/add',
  protect,
  validate(createReviewSchema),
  reviewController.addReview
);

router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;