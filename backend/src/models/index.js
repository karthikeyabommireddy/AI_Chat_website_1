/**
 * Model Index
 * Central export for all database models
 */

const User = require('./User.model');
const Chat = require('./Chat.model');
const Message = require('./Message.model');
const Document = require('./Document.model');
const FAQ = require('./FAQ.model');

module.exports = {
  User,
  Chat,
  Message,
  Document,
  FAQ
};
