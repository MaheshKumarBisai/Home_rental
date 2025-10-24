/**
 * ADMIN CONTROLLER
 * Handles admin management operations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform statistics
 * @access  Private (Admin)
 */
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      totalRevenue,
      activeBookings,
      completedBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }
      }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } })
    ]);

    // Get user role distribution
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    // Get property type distribution
    const propertiesByType = await prisma.property.groupBy({
      by: ['type'],
      _count: true
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            title: true,
            city: true
          }
        },
        renter: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalProperties,
          totalBookings,
          totalRevenue: totalRevenue._sum.totalPrice || 0,
          activeBookings,
          completedBookings
        },
        usersByRole,
        propertiesByType,
        recentBookings
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Private (Admin)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role;

    const where = role ? { role } : {};

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isBlocked: true,
          createdAt: true,
          _count: {
            select: {
              properties: true,
              bookings: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
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
 * @route   GET /api/admin/user/:id
 * @desc    Get user details
 * @access  Private (Admin)
 */
exports.getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isBlocked: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        properties: {
          select: {
            id: true,
            title: true,
            city: true,
            price: true,
            isAvailable: true
          }
        },
        bookings: {
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            totalPrice: true,
            status: true,
            property: {
              select: {
                title: true,
                city: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/block/:id
 * @desc    Block or unblock user
 * @access  Private (Admin)
 */
exports.blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Cannot block admin users
    if (user.role === 'ADMIN') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot block admin users'
      });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isBlocked: true
      }
    });

    res.status(200).json({
      status: 'success',
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: { user: updatedUser }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/property/:id
 * @desc    Delete any property (admin privilege)
 * @access  Private (Admin)
 */
exports.deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
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
 * @route   DELETE /api/admin/user/:id
 * @desc    Delete user account
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Cannot delete admin users
    if (user.role === 'ADMIN') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete admin users'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = exports;