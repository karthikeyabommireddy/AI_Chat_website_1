/**
 * Chat Model
 * Represents a conversation session between user and AI
 */

const mongoose = require('mongoose');
const { CHAT_STATUS } = require('../config/constants');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation',
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: Object.values(CHAT_STATUS),
    default: CHAT_STATUS.ACTIVE
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ status: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ 'rating.score': 1 });

// Virtual for messages
chatSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chatId',
  options: { sort: { createdAt: 1 } }
});

// Pre-save middleware to update timestamps
chatSchema.pre('save', function(next) {
  if (this.isNew) {
    this.lastMessageAt = new Date();
  }
  next();
});

// Static method to get user's recent chats
chatSchema.statics.getRecentByUser = function(userId, limit = 20) {
  return this.find({ userId, status: CHAT_STATUS.ACTIVE })
    .sort({ lastMessageAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get chat with messages
chatSchema.statics.getWithMessages = function(chatId, userId) {
  return this.findOne({ _id: chatId, userId })
    .populate({
      path: 'messages',
      options: { sort: { createdAt: 1 } }
    });
};

// Instance method to add message and update counts
chatSchema.methods.addMessage = async function() {
  this.messageCount += 1;
  this.lastMessageAt = new Date();
  return this.save();
};

// Instance method to archive chat
chatSchema.methods.archive = function() {
  this.status = CHAT_STATUS.ARCHIVED;
  return this.save();
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
