/**
 * FAQ Routes
 */

const express = require('express');
const router = express.Router();
const { faqController } = require('../controllers');
const { protect, adminOnly, faqValidation } = require('../middleware');

// Public routes
router.get('/', faqController.getPublicFAQs);
router.get('/categories', faqController.getCategories);
router.get('/:id', faqValidation.getById, faqController.getFAQById);
router.post('/:id/feedback', faqController.addFeedback);

// Admin routes
router.use(protect);
router.use(adminOnly);

router.get('/admin/all', faqController.getAllFAQs);
router.get('/admin/analytics', faqController.getFAQAnalytics);
router.post('/', faqValidation.create, faqController.createFAQ);
router.post('/bulk-import', faqController.bulkImport);
router.put('/:id', faqValidation.update, faqController.updateFAQ);
router.delete('/:id', faqValidation.getById, faqController.deleteFAQ);

module.exports = router;
