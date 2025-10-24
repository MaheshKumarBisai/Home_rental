/**
 * PROPERTY ROUTES
 */

const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  validate,
  createPropertySchema,
  updatePropertySchema
} = require('../middleware/validation');

// Public routes
router.get('/all', propertyController.getAllProperties);
router.get('/search', propertyController.searchProperties);
router.get('/:id', propertyController.getProperty);

// Protected routes
router.post(
  '/create',
  protect,
  restrictTo('OWNER', 'ADMIN'),
  validate(createPropertySchema),
  propertyController.createProperty
);

router.get(
  '/owner/my-properties',
  protect,
  restrictTo('OWNER', 'ADMIN'),
  propertyController.getMyProperties
);

router.put(
  '/update/:id',
  protect,
  restrictTo('OWNER', 'ADMIN'),
  validate(updatePropertySchema),
  propertyController.updateProperty
);

router.delete(
  '/delete/:id',
  protect,
  restrictTo('OWNER', 'ADMIN'),
  propertyController.deleteProperty
);

module.exports = router;