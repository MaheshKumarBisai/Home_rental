/**
 * REVIEW ROUTES
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validate, createReviewSchema } = require('../middleware/validation');

// @route   POST /api/reviews/add
// @desc    Add a review to a property
// @access  Private
router.post(
  '/add',
  protect,
  validate(createReviewSchema),
  reviewController.createReview
);

// @route   GET /api/reviews/:propertyId
// @desc    Get all reviews for a property
// @access  Public
router.get('/:propertyId', reviewController.getPropertyReviews);

module.exports = router;
