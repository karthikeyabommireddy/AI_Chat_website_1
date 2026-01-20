/**
 * FAQ Model
 * Stores frequently asked questions for AI context
 */

const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
    maxlength: [5000, 'Answer cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Alternative phrasings for better matching
  alternativeQuestions: [{
    type: String,
    trim: true
  }],
  // Keywords for search
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Priority for display ordering
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Usage analytics
  viewCount: {
    type: Number,
    default: 0
  },
  usefulCount: {
    type: Number,
    default: 0
  },
  notUsefulCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
faqSchema.index({ question: 'text', answer: 'text', keywords: 'text' });
faqSchema.index({ category: 1 });
faqSchema.index({ tags: 1 });
faqSchema.index({ keywords: 1 });
faqSchema.index({ isActive: 1, isPublic: 1 });
faqSchema.index({ priority: -1 });
faqSchema.index({ createdAt: -1 });

// Static method to get active FAQs
faqSchema.statics.getActiveFAQs = function(options = {}) {
  const { category, limit = 100 } = options;
  
  const query = { isActive: true, isPublic: true };
  if (category) query.category = category;
  
  return this.find(query)
    .sort({ priority: -1, viewCount: -1 })
    .limit(limit)
    .lean();
};

// Static method to search FAQs
faqSchema.statics.searchFAQs = function(searchText, limit = 10) {
  return this.find(
    { 
      $text: { $search: searchText },
      isActive: true,
      isPublic: true
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();
};

// Static method to find by keywords
faqSchema.statics.findByKeywords = function(keywords, limit = 5) {
  const keywordsLower = keywords.map(k => k.toLowerCase());
  
  return this.find({
    keywords: { $in: keywordsLower },
    isActive: true,
    isPublic: true
  })
    .sort({ priority: -1 })
    .limit(limit)
    .lean();
};

// Static method to get categories
faqSchema.statics.getCategories = function() {
  return this.distinct('category', { isActive: true });
};

// Instance method to increment view count
faqSchema.methods.incrementView = function() {
  this.viewCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

// Instance method to mark as useful/not useful
faqSchema.methods.addFeedback = function(isUseful) {
  if (isUseful) {
    this.usefulCount += 1;
  } else {
    this.notUsefulCount += 1;
  }
  return this.save();
};

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
