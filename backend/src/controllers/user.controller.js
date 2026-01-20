/**
 * User Controller
 * Handles user-related HTTP requests
 */

const { userService } = require('../services');
const { asyncHandler } = require('../middleware');
const { HTTP_STATUS } = require('../config/constants');

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q, limit } = req.query;
  
  if (!q) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Search query is required' }
    });
  }
  
  const users = await userService.searchUsers(q, parseInt(limit) || 10);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: users
  });
});

module.exports = {
  getUserById,
  searchUsers
};
