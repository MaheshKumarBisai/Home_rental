/**
 * CHAT ROUTES
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All chat routes are protected
router.get('/booking/:id', protect, chatController.getChatHistory);

module.exports = router;