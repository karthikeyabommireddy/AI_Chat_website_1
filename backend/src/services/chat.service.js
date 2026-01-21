/**
 * Chat Service
 * Handles chat conversations and AI responses
 */

const { Chat, Message, Document, FAQ } = require('../models');
const aiService = require('./ai.service');
const { ApiError } = require('../middleware');
const { HTTP_STATUS, CHAT_STATUS, MESSAGE_TYPES, DOCUMENT_STATUS } = require('../config/constants');
const logger = require('../config/logger');

class ChatService {
  /**
   * Create a new chat or get existing active chat
   */
  async createOrGetChat(userId, chatId = null) {
    if (chatId) {
      const chat = await Chat.findOne({
        _id: chatId,
        userId,
        status: CHAT_STATUS.ACTIVE
      });

      if (!chat) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Chat not found');
      }

      return chat;
    }

    // Create new chat
    const chat = await Chat.create({
      userId,
      title: 'New Conversation'
    });

    logger.info(`New chat created: ${chat._id} for user: ${userId}`);
    return chat;
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(userId, message, chatId = null) {
    // Get or create chat
    const chat = await this.createOrGetChat(userId, chatId);

    // Save user message
    const userMessage = await Message.create({
      chatId: chat._id,
      type: MESSAGE_TYPES.USER,
      content: message
    });

    // Update chat
    await chat.addMessage();

    // Update chat title if it's the first message
    if (chat.messageCount === 1) {
      chat.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      await chat.save();
    }

    try {
      // Get context for AI
      const context = await this.getContextForAI(message);

      // Get recent chat history for context
      const recentMessages = await Message.getRecentContext(chat._id, 10);

      // Build system prompt
      const systemPrompt = aiService.buildSystemPrompt(context);

      // Generate AI response
      const aiResponse = await aiService.generateResponse(recentMessages, systemPrompt);

      // Save AI message
      const aiMessage = await Message.create({
        chatId: chat._id,
        type: MESSAGE_TYPES.AI,
        content: aiResponse.content,
        metadata: {
          ...aiResponse.metadata,
          contextSources: context.sources
        }
      });

      // Update chat
      await chat.addMessage();

      // Update document usage counts
      await this.updateContextUsage(context.sources);

      return {
        chatId: chat._id,
        userMessage: {
          id: userMessage._id,
          content: userMessage.content,
          type: userMessage.type,
          createdAt: userMessage.createdAt
        },
        aiMessage: {
          id: aiMessage._id,
          content: aiMessage.content,
          type: aiMessage.type,
          createdAt: aiMessage.createdAt,
          metadata: aiMessage.metadata
        }
      };
    } catch (error) {
      logger.error('AI response generation failed:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      console.error('FULL AI ERROR:', error);

      // Save error message
      const errorMessage = await Message.create({
        chatId: chat._id,
        type: MESSAGE_TYPES.AI,
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact human support.',
        metadata: {
          error: {
            code: error.code || 'AI_ERROR',
            message: error.message
          }
        }
      });

      await chat.addMessage();

      return {
        chatId: chat._id,
        userMessage: {
          id: userMessage._id,
          content: userMessage.content,
          type: userMessage.type,
          createdAt: userMessage.createdAt
        },
        aiMessage: {
          id: errorMessage._id,
          content: errorMessage.content,
          type: errorMessage.type,
          createdAt: errorMessage.createdAt,
          isError: true
        }
      };
    }
  }

  /**
   * Get relevant context for AI response
   */
  async getContextForAI(query) {
    const sources = [];

    // Search documents
    const documents = await Document.find({
      isActive: true,
      status: DOCUMENT_STATUS.PROCESSED,
      $text: { $search: query }
    })
      .select('title content.raw category')
      .limit(3)
      .lean();

    documents.forEach(doc => {
      sources.push({
        type: 'document',
        sourceId: doc._id,
        title: doc.title,
        relevanceScore: 1
      });
    });

    // If no text search results, get top documents by usage
    let contextDocs = documents;
    if (contextDocs.length === 0) {
      contextDocs = await Document.find({
        isActive: true,
        status: DOCUMENT_STATUS.PROCESSED
      })
        .select('title content.raw category')
        .sort({ usageCount: -1 })
        .limit(3)
        .lean();
    }

    // Search FAQs
    const faqs = await FAQ.find({
      isActive: true,
      isPublic: true,
      $text: { $search: query }
    })
      .select('question answer category')
      .limit(5)
      .lean();

    faqs.forEach(faq => {
      sources.push({
        type: 'faq',
        sourceId: faq._id,
        title: faq.question,
        relevanceScore: 1
      });
    });

    // If no text search results, get top FAQs by priority
    let contextFaqs = faqs;
    if (contextFaqs.length === 0) {
      contextFaqs = await FAQ.find({
        isActive: true,
        isPublic: true
      })
        .select('question answer category')
        .sort({ priority: -1, viewCount: -1 })
        .limit(5)
        .lean();
    }

    return {
      documents: contextDocs,
      faqs: contextFaqs,
      sources
    };
  }

  /**
   * Update usage counts for context sources
   */
  async updateContextUsage(sources) {
    for (const source of sources) {
      if (source.type === 'document') {
        await Document.findByIdAndUpdate(source.sourceId, {
          $inc: { usageCount: 1 },
          lastUsedAt: new Date()
        });
      } else if (source.type === 'faq') {
        await FAQ.findByIdAndUpdate(source.sourceId, {
          $inc: { viewCount: 1 },
          lastUsedAt: new Date()
        });
      }
    }
  }

  /**
   * Get user's chat history
   */
  async getChatHistory(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      Chat.find({ userId, status: CHAT_STATUS.ACTIVE })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Chat.countDocuments({ userId, status: CHAT_STATUS.ACTIVE })
    ]);

    return {
      chats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get chat with messages
   */
  async getChatById(chatId, userId) {
    const query = { _id: chatId };
    // If userId is provided, filter by it (for regular users)
    // If userId is null, allow access (for admin)
    if (userId) {
      query.userId = userId;
    }
    
    const chat = await Chat.findOne(query).lean();

    if (!chat) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Chat not found');
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .lean();

    return {
      ...chat,
      messages
    };
  }

  /**
   * Delete chat (permanently removes from database)
   */
  async deleteChat(chatId, userId, isAdmin = false) {
    const query = { _id: chatId };
    // If not admin, filter by userId
    if (!isAdmin && userId) {
      query.userId = userId;
    }
    
    const chat = await Chat.findOne(query);

    if (!chat) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Chat not found');
    }

    // Delete all messages associated with this chat
    await Message.deleteMany({ chatId: chatId });
    
    // Permanently delete the chat
    await Chat.deleteOne({ _id: chatId });

    logger.info(`Chat permanently deleted: ${chatId} by user: ${userId}`);

    return { message: 'Chat deleted successfully' };
  }

  /**
   * Add feedback to a message
   */
  async addMessageFeedback(messageId, userId, helpful, feedbackText = null) {
    const message = await Message.findById(messageId).populate({
      path: 'chatId',
      select: 'userId'
    });

    if (!message) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Message not found');
    }

    // Verify ownership
    if (message.chatId.userId.toString() !== userId.toString()) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Access denied');
    }

    await message.addFeedback(helpful, feedbackText);

    return { message: 'Feedback added successfully' };
  }

  /**
   * Get all chats (Admin)
   */
  async getAllChats(options = {}) {
    const { page = 1, limit = 20, userId, status, search } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const [chats, total] = await Promise.all([
      Chat.find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Chat.countDocuments(query)
    ]);

    return {
      chats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get chat analytics (Admin)
   */
  async getChatAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalChats,
      activeChats,
      totalMessages,
      messagesToday,
      avgMessagesPerChat,
      chatsByDay
    ] = await Promise.all([
      Chat.countDocuments(),
      Chat.countDocuments({ status: CHAT_STATUS.ACTIVE }),
      Message.countDocuments(),
      Message.countDocuments({ createdAt: { $gte: today } }),
      Chat.aggregate([
        { $group: { _id: null, avg: { $avg: '$messageCount' } } }
      ]),
      Chat.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      totalChats,
      activeChats,
      totalMessages,
      messagesToday,
      avgMessagesPerChat: avgMessagesPerChat[0]?.avg || 0,
      chatsByDay
    };
  }

  /**
   * Get recent chats (Admin)
   */
  async getRecentChats(limit = 5) {
    const chats = await Chat.find()
      .populate('userId', 'firstName lastName email')
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .lean();

    return chats.map(chat => ({
      _id: chat._id,
      title: chat.title,
      createdAt: chat.createdAt,
      user: chat.userId ? {
        firstName: chat.userId.firstName,
        lastName: chat.userId.lastName,
        email: chat.userId.email
      } : null
    }));
  }
}

module.exports = new ChatService();
