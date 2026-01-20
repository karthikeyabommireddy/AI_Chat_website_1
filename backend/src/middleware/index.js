/**
 * Middleware Index
 * Central export for all middleware
 */

const { ApiError, notFoundHandler, errorHandler, asyncHandler } = require('./errorHandler');
const rateLimiter = require('./rateLimiter');
const { 
  protect, 
  optionalAuth, 
  authorize, 
  adminOnly, 
  superAdminOnly,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('./auth');
const { 
  validate,
  authValidation,
  chatValidation,
  documentValidation,
  faqValidation,
  userValidation
} = require('./validation');
const { documentUpload, avatarUpload } = require('./upload');

module.exports = {
  // Error handling
  ApiError,
  notFoundHandler,
  errorHandler,
  asyncHandler,
  
  // Rate limiting
  rateLimiter,
  
  // Authentication
  protect,
  optionalAuth,
  authorize,
  adminOnly,
  superAdminOnly,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  
  // Validation
  validate,
  authValidation,
  chatValidation,
  documentValidation,
  faqValidation,
  userValidation,
  
  // File uploads
  documentUpload,
  avatarUpload
};
