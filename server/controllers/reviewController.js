/**
 * REVIEW CONTROLLER
 * Handles property reviews and ratings
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route   POST /api/reviews/add
 * @desc    Add review for a property
 * @access  Private
 */
exports.addReview = async (req, res, next) => {
  try {
    const { propertyId, rating, comment } = req.validatedBody;
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

    // Check if user has completed booking for this property
    const completedBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        renterId,
        status: 'COMPLETED',
        checkOutDate: { lt: new Date() }
      }
    });

    if (!completedBooking) {
      return res.status(400).json({
        status: 'error',
        message: 'You can only review properties you have stayed in'
      });
    }

    // Check if user already reviewed this property
    const existingReview = await prisma.review.findUnique({
      where: {
        propertyId_renterId: {
          propertyId,
          renterId
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this property'
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        propertyId,
        renterId,
        rating,
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
      message: 'Review added successfully',
      data: { review }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reviews/property/:id
 * @desc    Get all reviews for a property
 * @access  Public
 */
exports.getPropertyReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reviews = await prisma.review.findMany({
      where: { propertyId: id },
      include: {
        renter: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
        averageRating: avgRating.toFixed(1),
        totalReviews: reviews.length
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (Renter/Admin)
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check permissions
    if (review.renterId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this review'
      });
    }

    await prisma.review.delete({
      where: { id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = exports;