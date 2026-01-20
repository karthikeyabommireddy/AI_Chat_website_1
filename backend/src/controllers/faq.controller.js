/**
 * FAQ Controller
 * Handles FAQ-related HTTP requests
 */

const { faqService } = require('../services');
const { asyncHandler } = require('../middleware');
const { HTTP_STATUS } = require('../config/constants');

/**
 * @desc    Create a new FAQ
 * @route   POST /api/faqs
 * @access  Private/Admin
 */
const createFAQ = asyncHandler(async (req, res) => {
  const faq = await faqService.createFAQ(req.body, req.user._id);
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'FAQ created successfully',
    data: faq
  });
});

/**
 * @desc    Get all FAQs (Admin)
 * @route   GET /api/faqs/admin
 * @access  Private/Admin
 */
const getAllFAQs = asyncHandler(async (req, res) => {
  const { page, limit, category, search } = req.query;
  
  const result = await faqService.getFAQs({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    category,
    search,
    isPublic: null // Get all FAQs including private ones
  });
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Get public FAQs (Users)
 * @route   GET /api/faqs
 * @access  Public
 */
const getPublicFAQs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const faqs = await faqService.getPublicFAQs(category);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: faqs
  });
});

/**
 * @desc    Get FAQ by ID
 * @route   GET /api/faqs/:id
 * @access  Public
 */
const getFAQById = asyncHandler(async (req, res) => {
  const faq = await faqService.getFAQById(req.params.id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: faq
  });
});

/**
 * @desc    Update FAQ
 * @route   PUT /api/faqs/:id
 * @access  Private/Admin
 */
const updateFAQ = asyncHandler(async (req, res) => {
  const faq = await faqService.updateFAQ(req.params.id, req.body, req.user._id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'FAQ updated successfully',
    data: faq
  });
});

/**
 * @desc    Delete FAQ
 * @route   DELETE /api/faqs/:id
 * @access  Private/Admin
 */
const deleteFAQ = asyncHandler(async (req, res) => {
  await faqService.deleteFAQ(req.params.id, req.user._id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'FAQ deleted successfully'
  });
});

/**
 * @desc    Add feedback to FAQ
 * @route   POST /api/faqs/:id/feedback
 * @access  Public
 */
const addFeedback = asyncHandler(async (req, res) => {
  const { isUseful } = req.body;
  await faqService.addFeedback(req.params.id, isUseful);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Thank you for your feedback'
  });
});

/**
 * @desc    Get FAQ categories
 * @route   GET /api/faqs/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await faqService.getCategories();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: categories
  });
});

/**
 * @desc    Bulk import FAQs
 * @route   POST /api/faqs/bulk-import
 * @access  Private/Admin
 */
const bulkImport = asyncHandler(async (req, res) => {
  const { faqs } = req.body;
  
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Please provide an array of FAQs' }
    });
  }
  
  const result = await faqService.bulkImport(faqs, req.user._id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Import completed: ${result.success} successful, ${result.failed} failed`,
    data: result
  });
});

/**
 * @desc    Get FAQ analytics
 * @route   GET /api/faqs/analytics
 * @access  Private/Admin
 */
const getFAQAnalytics = asyncHandler(async (req, res) => {
  const analytics = await faqService.getFAQAnalytics();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: analytics
  });
});

module.exports = {
  createFAQ,
  getAllFAQs,
  getPublicFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  addFeedback,
  getCategories,
  bulkImport,
  getFAQAnalytics
};
