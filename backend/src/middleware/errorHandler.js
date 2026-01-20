/**
 * Centralized Error Handler Middleware
 * Handles all errors consistently across the application
 */

const logger = require('../config/logger');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Custom API Error Class
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Route not found: ${req.method} ${req.originalUrl}`
  );
  next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid resource ID format');
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(
      HTTP_STATUS.CONFLICT,
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    );
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error = new ApiError(HTTP_STATUS.BAD_REQUEST, messages.join(', '));
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Token expired');
  }

  // Multer Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ApiError(HTTP_STATUS.BAD_REQUEST, 'File size exceeds limit');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new ApiError(HTTP_STATUS.BAD_REQUEST, 'Unexpected file field');
  }

  // Default error response
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
  const message = error.message || 'Internal Server Error';

  const response = {
    success: false,
    error: {
      message,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  };

  res.status(statusCode).json(response);
};

/**
 * Async Handler Wrapper
 * Eliminates try-catch blocks in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler,
  asyncHandler
};
