/**
 * Document Service
 * Handles document upload, processing, and management
 */

const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { Document } = require('../models');
const { ApiError } = require('../middleware');
const { HTTP_STATUS, DOCUMENT_STATUS, DOCUMENT_TYPES } = require('../config/constants');
const logger = require('../config/logger');

class DocumentService {
  /**
   * Upload and process a document
   */
  async uploadDocument(fileData, metadata, userId) {
    const { filename, originalname, path: filePath, mimetype, size } = fileData;
    const { title, description, category, tags } = metadata;

    // Determine file type
    const extension = path.extname(originalname).toLowerCase().substring(1);
    const fileType = DOCUMENT_TYPES[extension.toUpperCase()] || extension;

    // Create document record
    const document = await Document.create({
      title: title || originalname,
      description,
      fileName: filename,
      originalName: originalname,
      filePath: filePath,
      fileType,
      mimeType: mimetype,
      fileSize: size,
      category: category || 'General',
      tags: tags || [],
      uploadedBy: userId,
      status: DOCUMENT_STATUS.PROCESSING,
      processing: { startedAt: new Date() }
    });

    logger.info(`Document uploaded: ${document._id} by user: ${userId}`);

    // Process document asynchronously
    this.processDocument(document._id).catch(err => {
      logger.error(`Document processing failed for ${document._id}:`, err);
    });

    return document;
  }

  /**
   * Process document and extract text content
   */
  async processDocument(documentId) {
    const document = await Document.findById(documentId);

    if (!document) {
      throw new Error('Document not found');
    }

    try {
      let content = '';
      let metadata = {};

      const filePath = document.filePath;

      switch (document.fileType) {
        case DOCUMENT_TYPES.PDF:
          const pdfResult = await this.parsePDF(filePath);
          content = pdfResult.text;
          metadata = {
            pageCount: pdfResult.numPages,
            wordCount: content.split(/\s+/).length
          };
          break;

        case DOCUMENT_TYPES.DOCX:
          const docxResult = await this.parseDocx(filePath);
          content = docxResult.text;
          metadata = {
            wordCount: content.split(/\s+/).length
          };
          break;

        case DOCUMENT_TYPES.TXT:
        case DOCUMENT_TYPES.MD:
          content = await fs.readFile(filePath, 'utf-8');
          metadata = {
            wordCount: content.split(/\s+/).length
          };
          break;

        default:
          throw new Error(`Unsupported file type: ${document.fileType}`);
      }

      // Update document with processed content
      await document.markAsProcessed(content, metadata);

      logger.info(`Document processed successfully: ${documentId}`);

      return document;
    } catch (error) {
      await document.markAsFailed(error.message);
      logger.error(`Document processing failed: ${documentId}`, error);
      throw error;
    }
  }

  /**
   * Parse PDF file
   */
  async parsePDF(filePath) {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info
    };
  }

  /**
   * Parse DOCX file
   */
  async parseDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    
    return {
      text: result.value,
      messages: result.messages
    };
  }

  /**
   * Get all documents with pagination
   */
  async getDocuments(options = {}) {
    const { page = 1, limit = 20, category, status, search } = options;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [documents, total] = await Promise.all([
      Document.find(query)
        .select('-content.chunks -content.raw')
        .populate('uploadedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments(query)
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId) {
    const document = await Document.findById(documentId)
      .populate('uploadedBy', 'firstName lastName email')
      .lean();

    if (!document) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
    }

    return document;
  }

  /**
   * Update document metadata
   */
  async updateDocument(documentId, updates, userId) {
    const allowedUpdates = ['title', 'description', 'category', 'tags', 'isActive'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const document = await Document.findByIdAndUpdate(
      documentId,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    if (!document) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
    }

    logger.info(`Document updated: ${documentId} by user: ${userId}`);

    return document;
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId, userId) {
    const document = await Document.findById(documentId);

    if (!document) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
    }

    // Delete file from storage
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      logger.warn(`Failed to delete file: ${document.filePath}`, error);
    }

    // Soft delete
    document.isActive = false;
    await document.save();

    logger.info(`Document deleted: ${documentId} by user: ${userId}`);

    return { message: 'Document deleted successfully' };
  }

  /**
   * Get document categories
   */
  async getCategories() {
    return Document.distinct('category', { isActive: true });
  }

  /**
   * Reprocess a failed document
   */
  async reprocessDocument(documentId) {
    const document = await Document.findById(documentId);

    if (!document) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
    }

    if (document.status !== DOCUMENT_STATUS.FAILED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Document is not in failed state');
    }

    document.status = DOCUMENT_STATUS.PROCESSING;
    document.processing.startedAt = new Date();
    await document.save();

    // Process asynchronously
    this.processDocument(documentId).catch(err => {
      logger.error(`Document reprocessing failed for ${documentId}:`, err);
    });

    return { message: 'Document reprocessing started' };
  }

  /**
   * Get document analytics
   */
  async getDocumentAnalytics() {
    const [
      totalDocuments,
      processedDocuments,
      failedDocuments,
      documentsByCategory,
      topUsedDocuments
    ] = await Promise.all([
      Document.countDocuments({ isActive: true }),
      Document.countDocuments({ isActive: true, status: DOCUMENT_STATUS.PROCESSED }),
      Document.countDocuments({ isActive: true, status: DOCUMENT_STATUS.FAILED }),
      Document.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Document.find({ isActive: true, status: DOCUMENT_STATUS.PROCESSED })
        .select('title usageCount lastUsedAt')
        .sort({ usageCount: -1 })
        .limit(10)
        .lean()
    ]);

    return {
      totalDocuments,
      processedDocuments,
      failedDocuments,
      documentsByCategory,
      topUsedDocuments
    };
  }

  /**
   * Get top referenced documents
   */
  async getTopDocuments(limit = 5) {
    const documents = await Document.find({ isActive: true, status: DOCUMENT_STATUS.PROCESSED })
      .select('title fileType usageCount lastUsedAt')
      .sort({ usageCount: -1 })
      .limit(limit)
      .lean();

    return documents.map(doc => ({
      _id: doc._id,
      title: doc.title,
      fileType: doc.fileType,
      referenceCount: doc.usageCount || 0,
      lastUsed: doc.lastUsedAt
    }));
  }
}

module.exports = new DocumentService();
