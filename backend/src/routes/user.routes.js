/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { protect, userValidation } = require('../middleware');

// Protected routes
router.use(protect);

router.get('/search', userController.searchUsers);
router.get('/:id', userValidation.getById, userController.getUserById);

module.exports = router;
