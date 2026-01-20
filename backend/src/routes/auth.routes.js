/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect, authValidation } = require('../middleware');
const { authRateLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/register', authRateLimiter, authValidation.register, authController.register);
router.post('/login', authRateLimiter, authValidation.login, authController.login);
router.post('/refresh', authValidation.refreshToken, authController.refreshToken);

// Protected routes
router.use(protect);
router.post('/logout', authController.logout);
router.get('/me', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/password', authValidation.changePassword, authController.changePassword);

module.exports = router;
