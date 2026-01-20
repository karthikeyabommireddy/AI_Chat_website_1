/**
 * Chat Controller
 * Handles chat-related HTTP requests
 */

const { chatService } = require('../services');
const { asyncHandler } = require('../middleware');
const { HTTP_STATUS } = require('../config/constants');

/**
 * @desc    Send a message and get AI response
 * @route   POST /api/chat/message
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { message, chatId } = req.body;
  const result = await chatService.sendMessage(req.user._id, message, chatId);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Get user's chat history
 * @route   GET /api/chat/history
 * @access  Private
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await chatService.getChatHistory(
    req.user._id,
    parseInt(page) || 1,
    parseInt(limit) || 20
  );
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Get a specific chat with messages
 * @route   GET /api/chat/:chatId
 * @access  Private
 */
const getChatById = asyncHandler(async (req, res) => {
  const chat = await chatService.getChatById(req.params.chatId, req.user._id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: chat
  });
});

/**
 * @desc    Delete a chat
 * @route   DELETE /api/chat/:chatId
 * @access  Private
 */
const deleteChat = asyncHandler(async (req, res) => {
  await chatService.deleteChat(req.params.chatId, req.user._id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Chat deleted successfully'
  });
});

/**
 * @desc    Add feedback to a message
 * @route   POST /api/chat/feedback/:messageId
 * @access  Private
 */
const addMessageFeedback = asyncHandler(async (req, res) => {
  const { helpful, feedbackText } = req.body;
  await chatService.addMessageFeedback(
    req.params.messageId,
    req.user._id,
    helpful,
    feedbackText
  );
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Feedback recorded successfully'
  });
});

/**
 * @desc    Create a new chat
 * @route   POST /api/chat/new
 * @access  Private
 */
const createNewChat = asyncHandler(async (req, res) => {
  const chat = await chatService.createOrGetChat(req.user._id);
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: chat
  });
});

module.exports = {
  sendMessage,
  getChatHistory,
  getChatById,
  deleteChat,
  addMessageFeedback,
  createNewChat
};
