/**
 * FAQ Service
 * Handles FAQ CRUD operations
 */

const { FAQ } = require('../models');
const { ApiError } = require('../middleware');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../config/logger');

class FAQService {
  /**
   * Create a new FAQ
   */
  async createFAQ(data, userId) {
    const {
      question,
      answer,
      category,
      tags,
      keywords,
      alternativeQuestions,
      priority,
      isPublic
    } = data;

    // Extract keywords from question if not provided
    const extractedKeywords = keywords || this.extractKeywords(question);

    const faq = await FAQ.create({
      question,
      answer,
      category: category || 'General',
      tags: tags || [],
      keywords: extractedKeywords,
      alternativeQuestions: alternativeQuestions || [],
      priority: priority || 0,
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: userId
    });

    logger.info(`FAQ created: ${faq._id} by user: ${userId}`);

    return faq;
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what',
      'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
      'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'my', 'your'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10);
  }

  /**
   * Get all FAQs with pagination
   */
  async getFAQs(options = {}) {
    const { page = 1, limit = 20, category, search, isPublic = true } = options;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    
    if (isPublic !== null) query.isPublic = isPublic;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const [faqs, total] = await Promise.all([
      FAQ.find(query)
        .populate('createdBy', 'firstName lastName')
        .sort({ priority: -1, viewCount: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FAQ.countDocuments(query)
    ]);

    return {
      faqs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get public FAQs for users
   */
  async getPublicFAQs(category = null) {
    const query = { isActive: true, isPublic: true };
    if (category) query.category = category;

    return FAQ.find(query)
      .select('question answer category tags')
      .sort({ priority: -1, viewCount: -1 })
      .lean();
  }

  /**
   * Get FAQ by ID
   */
  async getFAQById(faqId) {
    const faq = await FAQ.findById(faqId)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .lean();

    if (!faq) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ not found');
    }

    return faq;
  }

  /**
   * Update FAQ
   */
  async updateFAQ(faqId, updates, userId) {
    const allowedUpdates = [
      'question', 'answer', 'category', 'tags', 'keywords',
      'alternativeQuestions', 'priority', 'isActive', 'isPublic'
    ];

    const filteredUpdates = { updatedBy: userId };

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Re-extract keywords if question changed
    if (filteredUpdates.question && !filteredUpdates.keywords) {
      filteredUpdates.keywords = this.extractKeywords(filteredUpdates.question);
    }

    const faq = await FAQ.findByIdAndUpdate(
      faqId,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    if (!faq) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ not found');
    }

    logger.info(`FAQ updated: ${faqId} by user: ${userId}`);

    return faq;
  }

  /**
   * Delete FAQ
   */
  async deleteFAQ(faqId, userId) {
    const faq = await FAQ.findById(faqId);

    if (!faq) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ not found');
    }

    // Soft delete
    faq.isActive = false;
    await faq.save();

    logger.info(`FAQ deleted: ${faqId} by user: ${userId}`);

    return { message: 'FAQ deleted successfully' };
  }

  /**
   * Add feedback to FAQ
   */
  async addFeedback(faqId, isUseful) {
    const faq = await FAQ.findById(faqId);

    if (!faq) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ not found');
    }

    await faq.addFeedback(isUseful);

    return { message: 'Feedback recorded successfully' };
  }

  /**
   * Get FAQ categories
   */
  async getCategories() {
    return FAQ.getCategories();
  }

  /**
   * Bulk import FAQs
   */
  async bulkImport(faqs, userId) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const faqData of faqs) {
      try {
        await this.createFAQ(faqData, userId);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          question: faqData.question,
          error: error.message
        });
      }
    }

    logger.info(`Bulk FAQ import: ${results.success} success, ${results.failed} failed`);

    return results;
  }

  /**
   * Get FAQ analytics
   */
  async getFAQAnalytics() {
    const [
      totalFAQs,
      publicFAQs,
      faqsByCategory,
      topViewedFAQs,
      feedbackStats
    ] = await Promise.all([
      FAQ.countDocuments({ isActive: true }),
      FAQ.countDocuments({ isActive: true, isPublic: true }),
      FAQ.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      FAQ.find({ isActive: true })
        .select('question viewCount usefulCount notUsefulCount')
        .sort({ viewCount: -1 })
        .limit(10)
        .lean(),
      FAQ.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$viewCount' },
            totalUseful: { $sum: '$usefulCount' },
            totalNotUseful: { $sum: '$notUsefulCount' }
          }
        }
      ])
    ]);

    return {
      totalFAQs,
      publicFAQs,
      faqsByCategory,
      topViewedFAQs,
      feedbackStats: feedbackStats[0] || { totalViews: 0, totalUseful: 0, totalNotUseful: 0 }
    };
  }
}

module.exports = new FAQService();
