/**
 * Document Controller
 * Handles document-related HTTP requests
 */

const { documentService } = require('../services');
const { asyncHandler } = require('../middleware');
const { HTTP_STATUS } = require('../config/constants');

/**
 * @desc    Upload a document
 * @route   POST /api/documents/upload
 * @access  Private/Admin
 */
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Please upload a file' }
    });
  }

  const document = await documentService.uploadDocument(
    req.file,
    req.body,
    req.user._id
  );
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Document uploaded successfully. Processing in background.',
    data: document
  });
});

/**
 * @desc    Upload multiple documents
 * @route   POST /api/documents/upload-multiple
 * @access  Private/Admin
 */
const uploadMultipleDocuments = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Please upload at least one file' }
    });
  }

  const documents = await Promise.all(
    req.files.map(file => documentService.uploadDocument(
      file,
      { title: file.originalname, category: req.body.category },
      req.user._id
    ))
  );
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: `${documents.length} documents uploaded successfully`,
    data: documents
  });
});

/**
 * @desc    Get all documents
 * @route   GET /api/documents
 * @access  Private/Admin
 */
const getDocuments = asyncHandler(async (req, res) => {
  const { page, limit, category, status, search } = req.query;
  
  const result = await documentService.getDocuments({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    category,
    status,
    search
  });
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Get document by ID
 * @route   GET /api/documents/:id
 * @access  Private/Admin
 */
const getDocumentById = asyncHandler(async (req, res) => {
  const document = await documentService.getDocumentById(req.params.id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: document
  });
});

/**
 * @desc    Update document
 * @route   PUT /api/documents/:id
 * @access  Private/Admin
 */
const updateDocument = asyncHandler(async (req, res) => {
  const document = await documentService.updateDocument(
    req.params.id,
    req.body,
    req.user._id
  );
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Document updated successfully',
    data: document
  });
});

/**
 * @desc    Delete document
 * @route   DELETE /api/documents/:id
 * @access  Private/Admin
 */
const deleteDocument = asyncHandler(async (req, res) => {
  await documentService.deleteDocument(req.params.id, req.user._id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Document deleted successfully'
  });
});

/**
 * @desc    Get document categories
 * @route   GET /api/documents/categories
 * @access  Private/Admin
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await documentService.getCategories();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: categories
  });
});

/**
 * @desc    Reprocess a failed document
 * @route   POST /api/documents/:id/reprocess
 * @access  Private/Admin
 */
const reprocessDocument = asyncHandler(async (req, res) => {
  await documentService.reprocessDocument(req.params.id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Document reprocessing started'
  });
});

/**
 * @desc    Get document analytics
 * @route   GET /api/documents/analytics
 * @access  Private/Admin
 */
const getDocumentAnalytics = asyncHandler(async (req, res) => {
  const analytics = await documentService.getDocumentAnalytics();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: analytics
  });
});

module.exports = {
  uploadDocument,
  uploadMultipleDocuments,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getCategories,
  reprocessDocument,
  getDocumentAnalytics
};
