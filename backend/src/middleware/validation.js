/**
 * Request Validation Middleware
 * Validates incoming request data using express-validator
 */

const { validationResult, body, param, query } = require('express-validator');
const { ApiError } = require('./errorHandler');
const { HTTP_STATUS, ROLES } = require('../config/constants');

/**
 * Validate Request
 * Checks for validation errors and throws if found
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Validation failed',
      true,
      errorMessages
    );
  }
  
  next();
};

/**
 * Auth Validation Rules
 */
const authValidation = {
  register: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),
    body('role')
      .optional()
      .isIn(Object.values(ROLES))
      .withMessage('Invalid role specified'),
    validate
  ],
  
  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    validate
  ],
  
  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
    validate
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    validate
  ]
};

/**
 * Chat Validation Rules
 */
const chatValidation = {
  createMessage: [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 10000 })
      .withMessage('Message cannot exceed 10000 characters'),
    body('chatId')
      .optional()
      .isMongoId()
      .withMessage('Invalid chat ID'),
    validate
  ],
  
  getChatById: [
    param('chatId')
      .isMongoId()
      .withMessage('Invalid chat ID'),
    validate
  ],
  
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    validate
  ]
};

/**
 * Document Validation Rules
 */
const documentValidation = {
  upload: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Category cannot exceed 100 characters'),
    validate
  ],
  
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid document ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    validate
  ],
  
  getById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid document ID'),
    validate
  ]
};

/**
 * FAQ Validation Rules
 */
const faqValidation = {
  create: [
    body('question')
      .trim()
      .notEmpty()
      .withMessage('Question is required')
      .isLength({ max: 500 })
      .withMessage('Question cannot exceed 500 characters'),
    body('answer')
      .trim()
      .notEmpty()
      .withMessage('Answer is required')
      .isLength({ max: 5000 })
      .withMessage('Answer cannot exceed 5000 characters'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Category cannot exceed 100 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('keywords')
      .optional()
      .isArray()
      .withMessage('Keywords must be an array'),
    body('priority')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Priority must be between 0 and 100'),
    validate
  ],
  
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid FAQ ID'),
    body('question')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Question cannot exceed 500 characters'),
    body('answer')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Answer cannot exceed 5000 characters'),
    validate
  ],
  
  getById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid FAQ ID'),
    validate
  ]
};

/**
 * User Validation Rules
 */
const userValidation = {
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),
    validate
  ],
  
  updateUser: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('role')
      .optional()
      .isIn(Object.values(ROLES))
      .withMessage('Invalid role specified'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    validate
  ],
  
  getById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    validate
  ]
};

module.exports = {
  validate,
  authValidation,
  chatValidation,
  documentValidation,
  faqValidation,
  userValidation
};
