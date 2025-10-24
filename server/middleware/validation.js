/**
 * VALIDATION MIDDLEWARE - Request Validation with Joi
 * Ensures data integrity and security
 */

const Joi = require('joi');

// =====================================
// USER VALIDATION SCHEMAS
// =====================================

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters',
    'any.required': 'Last name is required'
  }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    'string.pattern.base': 'Phone number must be 10 digits'
  }),
  role: Joi.string().valid('RENTER', 'OWNER').default('RENTER')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  profileImage: Joi.string().uri().optional()
});

// =====================================
// PROPERTY VALIDATION SCHEMAS
// =====================================

const createPropertySchema = Joi.object({
  title: Joi.string().min(10).max(200).required().messages({
    'string.min': 'Title must be at least 10 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(50).required().messages({
    'string.min': 'Description must be at least 50 characters',
    'any.required': 'Description is required'
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required'
  }),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  type: Joi.string().valid('APARTMENT', 'VILLA', 'HOUSE', 'STUDIO', 'PG', 'CONDO', 'TOWNHOUSE').required(),
  bedrooms: Joi.number().integer().min(0).required(),
  bathrooms: Joi.number().integer().min(0).required(),
  area: Joi.number().positive().optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one image is required'
  })
});

const updatePropertySchema = Joi.object({
  title: Joi.string().min(10).max(200).optional(),
  description: Joi.string().min(50).optional(),
  price: Joi.number().positive().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  type: Joi.string().valid('APARTMENT', 'VILLA', 'HOUSE', 'STUDIO', 'PG', 'CONDO', 'TOWNHOUSE').optional(),
  bedrooms: Joi.number().integer().min(0).optional(),
  bathrooms: Joi.number().integer().min(0).optional(),
  area: Joi.number().positive().optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  isAvailable: Joi.boolean().optional()
});

// =====================================
// BOOKING VALIDATION SCHEMAS
// =====================================

const createBookingSchema = Joi.object({
  propertyId: Joi.string().uuid().required(),
  checkInDate: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Check-in date must be in the future'
  }),
  checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')).required().messages({
    'date.greater': 'Check-out date must be after check-in date'
  })
});

// =====================================
// REVIEW VALIDATION SCHEMAS
// =====================================

const createReviewSchema = Joi.object({
  propertyId: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be between 1 and 5',
    'number.max': 'Rating must be between 1 and 5'
  }),
  comment: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Comment must be at least 10 characters'
  })
});

// =====================================
// VALIDATION MIDDLEWARE FUNCTION
// =====================================

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createPropertySchema,
  updatePropertySchema,
  createBookingSchema,
  createReviewSchema
};