/**
 * Authentication Middleware
 * JWT verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiError, asyncHandler } = require('./errorHandler');
const { HTTP_STATUS, ROLES } = require('../config/constants');
const logger = require('../config/logger');

/**
 * Protect Routes - Verify JWT Token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access denied. No token provided.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not found. Token invalid.');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Account has been deactivated.');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Token expired. Please login again.');
    }
    throw error;
  }
});

/**
 * Optional Authentication
 * Attaches user if token is valid, but doesn't block if not
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silent fail for optional auth
      logger.debug('Optional auth failed:', error.message);
    }
  }

  next();
});

/**
 * Role-based Authorization
 * Restricts access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        `Access denied. Required role: ${roles.join(' or ')}`
      );
    }

    next();
  };
};

/**
 * Admin Only Middleware
 */
const adminOnly = authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN);

/**
 * Super Admin Only Middleware
 */
const superAdminOnly = authorize(ROLES.SUPER_ADMIN);

/**
 * Generate JWT Token
 */
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  adminOnly,
  superAdminOnly,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
};
