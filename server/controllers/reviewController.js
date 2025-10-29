/**
 * REVIEW CONTROLLER
 * Handles property reviews and ratings
 */

const { Review, Booking, User } = require('../models');

/**
 * @route   POST /api/reviews/add
 * @desc    Add a review to a property
 * @access  Private (Renter who has booked the property)
 */
exports.createReview = async (req, res, next) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const renterId = req.user.id;

    // 1. Verify that the user has a completed booking for this property
    const validBooking = await Booking.findOne({
      where: {
        propertyId,
        renterId,
        status: 'ACCEPTED' // Must have an accepted booking to review
      }
    });

    if (!validBooking) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only review properties you have booked.'
      });
    }

    // 2. Check if the user has already reviewed this property
    const existingReview = await Review.findOne({
      where: {
        propertyId,
        renterId
      }
    });

    if (existingReview) {
      return res.status(409).json({
        status: 'error',
        message: 'You have already submitted a review for this property.'
      });
    }

    // 3. Create the new review
    const review = await Review.create({
      propertyId,
      renterId,
      rating: parseInt(rating),
      comment
    });

    const reviewWithRenter = await Review.findByPk(review.id, {
        include: {
            model: User,
            as: 'renter',
            attributes: ['fullName', 'avatar']
        }
    });

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully',
      data: { review: reviewWithRenter }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reviews/:propertyId
 * @desc    Get all reviews for a specific property
 *access  Public
 */
exports.getPropertyReviews = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const reviews = await Review.findAll({
      where: { propertyId },
      include: {
        model: User,
        as: 'renter',
        attributes: ['fullName', 'avatar']
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews }
    });

  } catch (error) {
    next(error);
  }
};
