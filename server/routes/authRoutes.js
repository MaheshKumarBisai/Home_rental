/**
 * AUTH ROUTES
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema
} = require('../middleware/validation');

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, validate(updateProfileSchema), authController.updateProfile);
router.post('/logout', protect, authController.logout);

module.exports = router;