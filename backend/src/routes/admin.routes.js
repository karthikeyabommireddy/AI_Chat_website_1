/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { protect, adminOnly, userValidation } = require('../middleware');

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Chat management
router.get('/chats', adminController.getAllChats);
router.get('/chats/:chatId', adminController.getChatDetails);
router.delete('/chats/:chatId', adminController.deleteChat);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', userValidation.updateUser, adminController.updateUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', userValidation.getById, adminController.deleteUser);

// System
router.get('/system/health', adminController.getSystemHealth);

module.exports = router;
