/**
 * Document Model
 * Stores uploaded documents and their parsed content for AI context
 */

const mongoose = require('mongoose');
const { DOCUMENT_TYPES, DOCUMENT_STATUS } = require('../config/constants');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileType: {
    type: String,
    enum: Object.values(DOCUMENT_TYPES),
    required: [true, 'File type is required']
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  status: {
    type: String,
    enum: Object.values(DOCUMENT_STATUS),
    default: DOCUMENT_STATUS.PENDING
  },
  // Parsed and processed content
  content: {
    raw: {
      type: String,
      default: ''
    },
    // Chunked content for better AI context retrieval
    chunks: [{
      text: String,
      index: Number,
      startPosition: Number,
      endPosition: Number,
      embedding: [Number] // Optional: for vector search
    }]
  },
  // Metadata
  metadata: {
    pageCount: Number,
    wordCount: Number,
    language: String,
    author: String,
    createdDate: Date,
    lastModified: Date
  },
  // Processing information
  processing: {
    startedAt: Date,
    completedAt: Date,
    error: String,
    retryCount: {
      type: Number,
      default: 0
    }
  },
  // Access control
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Categorization
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Usage tracking
  usageCount: {
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
documentSchema.index({ title: 'text', 'content.raw': 'text' });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ isActive: 1, status: 1 });
documentSchema.index({ createdAt: -1 });

// Static method to get active processed documents
documentSchema.statics.getActiveDocuments = function(options = {}) {
  const { category, tags, limit = 100 } = options;
  
  const query = {
    isActive: true,
    status: DOCUMENT_STATUS.PROCESSED
  };
  
  if (category) query.category = category;
  if (tags && tags.length) query.tags = { $in: tags };
  
  return this.find(query)
    .select('-content.chunks.embedding')
    .sort({ usageCount: -1 })
    .limit(limit)
    .lean();
};

// Static method to search documents by content
documentSchema.statics.searchByContent = function(searchText, limit = 10) {
  return this.find(
    { 
      $text: { $search: searchText },
      isActive: true,
      status: DOCUMENT_STATUS.PROCESSED
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();
};

// Instance method to mark as processed
documentSchema.methods.markAsProcessed = function(content, metadata = {}) {
  this.status = DOCUMENT_STATUS.PROCESSED;
  this.content.raw = content;
  this.processing.completedAt = new Date();
  Object.assign(this.metadata, metadata);
  return this.save();
};

// Instance method to mark as failed
documentSchema.methods.markAsFailed = function(error) {
  this.status = DOCUMENT_STATUS.FAILED;
  this.processing.error = error;
  this.processing.retryCount += 1;
  return this.save();
};

// Instance method to increment usage
documentSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
