/**
 * Document Routes
 */

const express = require('express');
const router = express.Router();
const { documentController } = require('../controllers');
const { protect, adminOnly, documentUpload, documentValidation } = require('../middleware');

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// Document routes
router.get('/categories', documentController.getCategories);
router.get('/analytics', documentController.getDocumentAnalytics);
router.get('/', documentController.getDocuments);
router.get('/:id', documentValidation.getById, documentController.getDocumentById);

router.post(
  '/upload',
  documentUpload.single('document'),
  documentValidation.upload,
  documentController.uploadDocument
);

router.post(
  '/upload-multiple',
  documentUpload.array('documents', 5),
  documentController.uploadMultipleDocuments
);

router.put('/:id', documentValidation.update, documentController.updateDocument);
router.delete('/:id', documentValidation.getById, documentController.deleteDocument);
router.post('/:id/reprocess', documentValidation.getById, documentController.reprocessDocument);

module.exports = router;
