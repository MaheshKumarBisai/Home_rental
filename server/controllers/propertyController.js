/**
 * PROPERTY CONTROLLER
 * Handles property CRUD operations
 */

const { Property, User, Review, Booking } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   POST /api/properties/create
 * @desc    Create new property
 * @access  Private (Owner/Admin)
 */
exports.createProperty = async (req, res, next) => {
  try {
    const { amenities, images, ...propertyData } = req.body;
    const ownerId = req.user.id;

    // Convert arrays to comma-separated strings for SQLite
    const amenitiesString = amenities ? amenities.join(',') : '';
    const imagesString = images ? images.join(',') : '';

    const property = await Property.create({
      ...propertyData,
      amenities: amenitiesString,
      images: imagesString,
      ownerId
    });

    const propertyWithOwner = await Property.findByPk(property.id, {
        include: {
            model: User,
            as: 'owner',
            attributes: ['id', 'fullName', 'email']
        }
    });

    res.status(201).json({
      status: 'success',
      message: 'Property created successfully',
      data: { property: propertyWithOwner }
    });

  } catch (error) {
    console.error('Error in createProperty:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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

    const property = await Property.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'fullName', 'email', 'phone', 'avatar']
        },
        {
          model: Review,
          as: 'reviews',
          include: {
            model: User,
            as: 'renter',
            attributes: ['fullName', 'avatar']
          },
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Convert string fields back to arrays
    const propertyJson = property.toJSON();
    propertyJson.amenities = property.amenities ? property.amenities.split(',') : [];
    propertyJson.images = property.images ? property.images.split(',') : [];

    // Calculate average rating
    const avgRating = property.reviews.length > 0
      ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        property: {
          ...propertyJson,
          averageRating: avgRating.toFixed(1),
          totalReviews: property.reviews.length
        }
      }
    });

  } catch (error) {
    console.error('Error in getProperty:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

    const where = {
      availability: { [Op.ne]: "Booked" }
    };

    const { count, rows: properties } = await Property.findAndCountAll({
        where,
        offset,
        limit,
        order: [[sortBy, order]],
        include: [
            {
                model: User,
                as: 'owner',
                attributes: ['fullName']
            },
            {
                model: Review,
                as: 'reviews',
                attributes: ['rating']
            }
        ]
    });

    // Process properties to convert strings to arrays and calculate ratings
    const processedProperties = properties.map(property => {
      const propertyJson = property.toJSON();
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;

      return {
        ...propertyJson,
        amenities: property.amenities ? property.amenities.split(',') : [],
        images: property.images ? property.images.split(',') : [],
        averageRating: avgRating.toFixed(1),
        totalReviews: property.reviews.length
      };
    });

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: {
        properties: processedProperties,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Error in getAllProperties:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
      listingType,
      priceMin,
      priceMax,
      bedrooms,
      bathrooms,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      availability: { [Op.ne]: "Booked" },
      ...(city && { city: { [Op.like]: `%${city}%` } }),
      ...(type && { type }),
      ...(listingType && { listingType }),
      ...(bedrooms && { bedrooms: { [Op.gte]: parseInt(bedrooms) } }),
      ...(bathrooms && { bathrooms: { [Op.gte]: parseInt(bathrooms) } })
    };

    if (priceMin && priceMax) {
      where.price = { [Op.between]: [parseFloat(priceMin), parseFloat(priceMax)] };
    } else if (priceMin) {
      where.price = { [Op.gte]: parseFloat(priceMin) };
    } else if (priceMax) {
      where.price = { [Op.lte]: parseFloat(priceMax) };
    }

    const { count, rows: properties } = await Property.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        order: [[sortBy, order.toUpperCase()]],
        include: [
            {
                model: User,
                as: 'owner',
                attributes: ['fullName']
            },
            {
                model: Review,
                as: 'reviews',
                attributes: ['rating']
            }
        ]
    });

    const processedProperties = properties.map(property => {
      const propertyJson = property.toJSON();
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;

      return {
        ...propertyJson,
        amenities: property.amenities ? property.amenities.split(',') : [],
        images: property.images ? property.images.split(',') : [],
        averageRating: avgRating.toFixed(1),
        totalReviews: property.reviews.length
      };
    });

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: {
        properties: processedProperties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in searchProperties:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
    const updateData = req.body;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ status: 'error', message: 'Property not found' });
    }

    if (property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to update this property' });
    }

    await Property.update(updateData, {
      where: { id },
    });

    const updatedProperty = await Property.findByPk(id);

    res.status(200).json({
      status: 'success',
      message: 'Property updated successfully',
      data: { property: updatedProperty }
    });

  } catch (error) {
    console.error('Error in updateProperty:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ status: 'error', message: 'Property not found' });
    }

    if (property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to delete this property' });
    }

    await Property.destroy({ where: { id } });

    res.status(200).json({ status: 'success', message: 'Property deleted successfully' });

  } catch (error) {
    console.error('Error in deleteProperty:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

/**
 * @route   GET /api/properties/owner/my-properties
 * @desc    Get all properties of logged-in owner
 * @access  Private (Owner)
 */
exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.findAll({
      where: { ownerId: req.user.id },
      include: [
        { model: Review, as: 'reviews', attributes: ['rating'] },
        { model: Booking, as: 'bookings', where: { status: 'CONFIRMED' }, required: false }
      ],
      order: [['createdAt', 'DESC']]
    });

    const processedProperties = properties.map(property => {
      const propertyJson = property.toJSON();
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;

      return {
        ...propertyJson,
        amenities: property.amenities ? property.amenities.split(',') : [],
        images: property.images ? property.images.split(',') : [],
        averageRating: avgRating.toFixed(1),
        totalReviews: property.reviews.length,
        activeBookings: property.bookings.length
      };
    });

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: { properties: processedProperties }
    });

  } catch (error) {
    console.error('Error in getMyProperties:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

module.exports = exports;
