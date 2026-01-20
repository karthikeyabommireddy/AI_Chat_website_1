/**
 * Application Constants
 * Centralized configuration values
 */

module.exports = {
  // User Roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },

  // Chat Status
  CHAT_STATUS: {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    DELETED: 'deleted'
  },

  // Message Types
  MESSAGE_TYPES: {
    USER: 'user',
    AI: 'ai',
    SYSTEM: 'system'
  },

  // Document Types
  DOCUMENT_TYPES: {
    PDF: 'pdf',
    DOCX: 'docx',
    TXT: 'txt',
    MD: 'md'
  },

  // Document Status
  DOCUMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PROCESSED: 'processed',
    FAILED: 'failed'
  },

  // AI Providers
  AI_PROVIDERS: {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    GOOGLE: 'google',
    DEEPSEEK: 'deepseek'
  },

  // Pagination Defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ],
    ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.txt', '.md']
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_ERROR: 500
  },

  // Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists',
    INVALID_TOKEN: 'Invalid or expired token',
    SERVER_ERROR: 'Internal server error'
  }
};
