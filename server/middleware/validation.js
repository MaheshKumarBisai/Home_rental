/**
 * DATA VALIDATION MIDDLEWARE
 * Uses Joi to validate request body and query parameters
 */

const Joi = require('joi');

// Helper function for validation
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      const errors = error.details.map(err => ({
        field: err.path[0],
        message: err.message.replace(/"/g, "'")
      }));
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }
    req.body = value;
    next();
  };
};

// ========================================
// AUTHENTICATION SCHEMAS
// ========================================

// Register User
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().allow('').optional(),
  role: Joi.string().valid('RENTER', 'OWNER').optional()
});

// Login User
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Update Profile
const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().allow('').optional(),
  profileImage: Joi.string().uri().optional()
});

// ========================================
// PROPERTY SCHEMAS
// ========================================

// Create Property
const createPropertySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  listingType: Joi.string().valid('RENT', 'SALE').required(),
  price: Joi.number().positive().required(),
  currency: Joi.string().default('INR'),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  type: Joi.string().required(),
  bedrooms: Joi.number().integer().min(0).required(),
  bathrooms: Joi.number().integer().min(0).required(),
  area: Joi.number().positive().optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  availability: Joi.string().optional()
});

// Update Property
const updatePropertySchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  listingType: Joi.string().valid('RENT', 'SALE').optional(),
  price: Joi.number().positive().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  type: Joi.string().optional(),
  bedrooms: Joi.number().integer().min(0).optional(),
  bathrooms: Joi.number().integer().min(0).optional(),
  area: Joi.number().positive().optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  availability: Joi.string().optional()
});

// ========================================
// BOOKING & APPLICATION SCHEMAS
// ========================================

// Apply for Property
const applySchema = Joi.object({
  propertyId: Joi.number().integer().required()
});

// Update Application Status
const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('ACCEPTED', 'DENIED').required()
});


module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createPropertySchema,
  updatePropertySchema,
  applySchema,
  updateApplicationStatusSchema
};
