/**
 * Chat Routes
 */

const express = require('express');
const router = express.Router();
const { chatController } = require('../controllers');
const { protect, chatValidation } = require('../middleware');
const { chatRateLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(protect);

// Chat routes
router.post('/message', chatRateLimiter, chatValidation.createMessage, chatController.sendMessage);
router.post('/new', chatController.createNewChat);
router.get('/history', chatValidation.pagination, chatController.getChatHistory);
router.get('/:chatId', chatValidation.getChatById, chatController.getChatById);
router.delete('/:chatId', chatValidation.getChatById, chatController.deleteChat);
router.post('/feedback/:messageId', chatController.addMessageFeedback);

module.exports = router;
