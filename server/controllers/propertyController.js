/**
 * PROPERTY CONTROLLER
 * Handles property CRUD operations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route   POST /api/properties/create
 * @desc    Create new property
 * @access  Private (Owner/Admin)
 */
exports.createProperty = async (req, res, next) => {
  try {
    const propertyData = req.validatedBody;
    const ownerId = req.user.id;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Property created successfully',
      data: { property }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/properties/:id
 * @desc    Get property by ID
 * @access  Public
 */
exports.getProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
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
        },
        reviews: {
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
        }
      }
    });

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Calculate average rating
    const avgRating = property.reviews.length > 0
      ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        property: {
          ...property,
          averageRating: avgRating.toFixed(1),
          totalReviews: property.reviews.length
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/properties/all
 * @desc    Get all properties with pagination
 * @access  Public
 */
exports.getAllProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 'asc' : 'desc';

    const where = {
      isAvailable: true
    };

    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        }
      }),
      prisma.property.count({ where })
    ]);

    // Add average rating to each property
    const propertiesWithRating = properties.map(property => {
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;

      return {
        ...property,
        averageRating: avgRating.toFixed(1),
        totalReviews: property.reviews.length
      };
    });

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: {
        properties: propertiesWithRating,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/properties/search
 * @desc    Search and filter properties
 * @access  Public
 */
exports.searchProperties = async (req, res, next) => {
  try {
    const {
      city,
      type,
      priceMin,
      priceMax,
      bedrooms,
      bathrooms,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      isAvailable: true,
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(type && { type }),
      ...(priceMin && { price: { gte: parseFloat(priceMin) } }),
      ...(priceMax && { price: { lte: parseFloat(priceMax) } }),
      ...(bedrooms && { bedrooms: { gte: parseInt(bedrooms) } }),
      ...(bathrooms && { bathrooms: { gte: parseInt(bathrooms) } })
    };

    // Handle price range
    if (priceMin && priceMax) {
      where.price = {
        gte: parseFloat(priceMin),
        lte: parseFloat(priceMax)
      };
    }

    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        }
      }),
      prisma.property.count({ where })
    ]);

    // Add average rating
    const propertiesWithRating = properties.map(property => {
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;

      return {
        ...property,
        averageRating: avgRating.toFixed(1),
        totalReviews: property.reviews.length
      };
    });

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: {
        properties: propertiesWithRating,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/properties/update/:id
 * @desc    Update property
 * @access  Private (Owner/Admin)
 */
exports.updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedBody;

    // Check if property exists and user is owner
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    if (property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this property'
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Property updated successfully',
      data: { property: updatedProperty }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/properties/delete/:id
 * @desc    Delete property
 * @access  Private (Owner/Admin)
 */
exports.deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if property exists and user is owner
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    if (property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this property'
      });
    }

    await prisma.property.delete({
      where: { id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Property deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/properties/owner/my-properties
 * @desc    Get all properties of logged-in owner
 * @access  Private (Owner)
 */
exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await prisma.property.findMany({
      where: {
        ownerId: req.user.id
      },
      include: {
        reviews: {
          select: {
            rating: true
          }
        },
        bookings: {
          where: {
            status: 'CONFIRMED'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add stats to each property
    const propertiesWithStats = properties.map(property => {
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;

      return {
        ...property,
        averageRating: avgRating.toFixed(1),
        totalReviews: property.reviews.length,
        activeBookings: property.bookings.length
      };
    });

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: { properties: propertiesWithStats }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = exports;