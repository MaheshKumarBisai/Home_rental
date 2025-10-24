/**
 * ADMIN ROUTES
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All admin routes are protected and restricted to ADMIN role
router.use(protect, restrictTo('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/user/:id', adminController.getUserDetails);
router.put('/block/:id', adminController.blockUser);
router.delete('/property/:id', adminController.deleteProperty);
router.delete('/user/:id', adminController.deleteUser);

module.exports = router;