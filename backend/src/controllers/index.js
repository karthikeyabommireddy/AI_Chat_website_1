/**
 * Controllers Index
 * Central export for all controllers
 */

const authController = require('./auth.controller');
const chatController = require('./chat.controller');
const documentController = require('./document.controller');
const faqController = require('./faq.controller');
const adminController = require('./admin.controller');
const userController = require('./user.controller');

module.exports = {
  authController,
  chatController,
  documentController,
  faqController,
  adminController,
  userController
};
