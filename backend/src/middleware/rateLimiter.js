/**
 * Rate Limiter Middleware
 * Protects against brute force and DDoS attacks
 */

const rateLimit = require('express-rate-limit');
const { HTTP_STATUS } = require('../config/constants');

/**
 * General API Rate Limiter
 */
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please try again later.',
      retryAfter: '15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
      }
    });
  }
});

/**
 * Strict Rate Limiter for Auth Routes
 */
const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again in an hour.'
    }
  },
  skipSuccessfulRequests: true
});

/**
 * Chat Rate Limiter
 */
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  message: {
    success: false,
    error: {
      message: 'Too many messages. Please slow down.'
    }
  }
});

module.exports = rateLimiter;
module.exports.authRateLimiter = authRateLimiter;
module.exports.chatRateLimiter = chatRateLimiter;
