/**
 * Message Model
 * Stores individual messages within a chat conversation
 */

const mongoose = require('mongoose');
const { MESSAGE_TYPES } = require('../config/constants');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: [true, 'Chat ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: Object.values(MESSAGE_TYPES),
    required: [true, 'Message type is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [50000, 'Message content cannot exceed 50000 characters']
  },
  metadata: {
    // AI response metadata
    model: String,
    provider: String,
    tokensUsed: {
      prompt: Number,
      completion: Number,
      total: Number
    },
    responseTime: Number, // in milliseconds
    
    // Context used for AI response
    contextSources: [{
      type: {
        type: String,
        enum: ['document', 'faq']
      },
      sourceId: mongoose.Schema.Types.ObjectId,
      title: String,
      relevanceScore: Number
    }],
    
    // Error information (if any)
    error: {
      code: String,
      message: String
    }
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  feedback: {
    helpful: {
      type: Boolean,
      default: null
    },
    feedbackText: String,
    feedbackAt: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ chatId: 1, type: 1 });
messageSchema.index({ createdAt: -1 });

// Static method to get messages for a chat with pagination
messageSchema.statics.getByChat = function(chatId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({ chatId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method to get recent messages for context
messageSchema.statics.getRecentContext = function(chatId, limit = 10) {
  return this.find({ chatId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .then(messages => messages.reverse());
};

// Static method to count messages in a chat
messageSchema.statics.countByChat = function(chatId) {
  return this.countDocuments({ chatId });
};

// Instance method to add feedback
messageSchema.methods.addFeedback = function(helpful, feedbackText) {
  this.feedback = {
    helpful,
    feedbackText,
    feedbackAt: new Date()
  };
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
