/**
 * REVIEW CONTROLLER
 * Handles property reviews and ratings
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    const validBooking = await prisma.booking.findFirst({
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
    const existingReview = await prisma.review.findFirst({
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
    const review = await prisma.review.create({
      data: {
        propertyId,
        renterId,
        rating: parseInt(rating),
        comment
      },
      include: {
        renter: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully',
      data: { review }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reviews/:propertyId
 * @desc    Get all reviews for a specific property
 * @access  Public
 */
exports.getPropertyReviews = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { propertyId },
      include: {
        renter: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
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
