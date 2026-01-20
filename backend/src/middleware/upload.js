/**
 * File Upload Middleware
 * Handles document uploads using Multer
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('./errorHandler');
const { HTTP_STATUS, UPLOAD } = require('../config/constants');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueId}${extension}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid file type. Allowed types: PDF, DOCX, TXT, MD`
    ), false);
    return;
  }

  // Check extension
  const extension = path.extname(file.originalname).toLowerCase();
  if (!UPLOAD.ALLOWED_EXTENSIONS.includes(extension)) {
    cb(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid file extension. Allowed: ${UPLOAD.ALLOWED_EXTENSIONS.join(', ')}`
    ), false);
    return;
  }

  cb(null, true);
};

// Multer instance for document uploads
const documentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
    files: 5 // Max 5 files at once
  }
});

// Avatar upload configuration
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const filename = `${req.user._id}${extension}`;
    cb(null, filename);
  }
});

const avatarFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Invalid image type. Allowed: JPEG, PNG, GIF, WEBP'
    ), false);
    return;
  }

  cb(null, true);
};

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = {
  documentUpload,
  avatarUpload
};
