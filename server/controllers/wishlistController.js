/**
 * WISHLIST CONTROLLER
 * Handles user's saved/wishlisted properties
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route   POST /api/wishlist/add
 * @desc    Add a property to user's wishlist
 * @access  Private (Renter)
 */
exports.addToWishlist = async (req, res, next) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id;

    // Check if the property exists
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return res.status(404).json({ status: 'error', message: 'Property not found' });
    }

    // Check if it's already in the wishlist
    const existingWishlistItem = await prisma.wishlist.findFirst({
      where: { userId, propertyId }
    });

    if (existingWishlistItem) {
      return res.status(409).json({ status: 'error', message: 'Property is already in your wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        propertyId
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            price: true,
            images: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Property added to wishlist',
      data: { wishlistItem }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/wishlist/remove/:propertyId
 * @desc    Remove a property from user's wishlist
 * @access  Private (Renter)
 */
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    // Find the wishlist item to ensure it exists before deleting
    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId,
        propertyId
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found in your wishlist'
      });
    }

    // Delete the wishlist item
    await prisma.wishlist.delete({
      where: {
        id: wishlistItem.id
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Property removed from wishlist'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private (Renter)
 */
exports.getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            price: true,
            images: true,
            listingType: true,
            bedrooms: true,
            bathrooms: true,
            availability: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Process properties to convert images string to array
    const processedWishlist = wishlist.map(item => ({
      ...item,
      property: {
        ...item.property,
        images: item.property.images.split(',').filter(Boolean)
      }
    }));

    res.status(200).json({
      status: 'success',
      results: wishlist.length,
      data: { wishlist: processedWishlist }
    });

  } catch (error) {
    next(error);
  }
};
