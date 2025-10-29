/**
 * ADMIN CONTROLLER
 * Handles admin management operations
 */

const { User, Property, Booking } = require('../models');
const { Op } = require('sequelize');

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
      User.count(),
      Property.count(),
      Booking.count(),
      Booking.sum('totalPrice', { where: { status: { [Op.in]: ['CONFIRMED', 'COMPLETED'] } } }),
      Booking.count({ where: { status: 'CONFIRMED' } }),
      Booking.count({ where: { status: 'COMPLETED' } })
    ]);

    // Get user role distribution
    const usersByRole = await User.findAll({
      attributes: ['role', [User.sequelize.fn('COUNT', 'role'), 'count']],
      group: ['role']
    });

    // Get property type distribution
    const propertiesByType = await Property.findAll({
        attributes: ['type', [Property.sequelize.fn('COUNT', 'type'), 'count']],
        group: ['type']
    });

    // Get recent bookings
    const recentBookings = await Booking.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['title', 'city']
        },
        {
          model: User,
          as: 'renter',
          attributes: ['fullName', 'email']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalProperties,
          totalBookings,
          totalRevenue: totalRevenue || 0,
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
    const offset = (page - 1) * limit;
    const role = req.query.role;

    const where = role ? { role } : {};

    const { count, rows: users } = await User.findAndCountAll({
        where,
        offset,
        limit,
        attributes: ['id', 'email', 'fullName', 'phone', 'role', 'createdAt'],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
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

    const user = await User.findByPk(id, {
        attributes: ['id', 'email', 'fullName', 'phone', 'role', 'avatar', 'createdAt', 'updatedAt'],
        include: [
            {
                model: Property,
                as: 'properties',
                attributes: ['id', 'title', 'city', 'price', 'availability']
            },
            {
                model: Booking,
                as: 'bookings',
                attributes: ['id', 'checkInDate', 'checkOutDate', 'totalPrice', 'status'],
                include: {
                    model: Property,
                    as: 'property',
                    attributes: ['title', 'city']
                },
                order: [['createdAt', 'DESC']]
            }
        ]
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
    const user = await User.findByPk(id);

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
    const [updatedRows, [updatedUser]] = await User.update({ isBlocked }, {
        where: { id },
        returning: true,
        attributes: ['id', 'email', 'fullName', 'isBlocked']
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

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    await Property.destroy({ where: { id } });

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

    const user = await User.findByPk(id);

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

    await User.destroy({ where: { id } });

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = exports;
