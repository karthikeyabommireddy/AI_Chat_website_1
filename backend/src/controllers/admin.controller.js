/**
 * Admin Controller
 * Handles admin dashboard and analytics
 */

const { chatService, documentService, faqService, userService } = require('../services');
const { asyncHandler } = require('../middleware');
const { HTTP_STATUS } = require('../config/constants');

/**
 * @desc    Get dashboard overview
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboard = asyncHandler(async (req, res) => {
  const [chatStats, userStats, docAnalytics, faqAnalytics, recentChats, topDocuments] = await Promise.all([
    chatService.getChatAnalytics(),
    userService.getUserStats(),
    documentService.getDocumentAnalytics(),
    faqService.getFAQAnalytics(),
    chatService.getRecentChats(5),
    documentService.getTopDocuments(5)
  ]);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      overview: {
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
        totalChats: chatStats.totalChats,
        totalMessages: chatStats.totalMessages,
        totalDocuments: docAnalytics.totalDocuments,
        totalFAQs: faqAnalytics.totalFAQs,
        activeUsersToday: userStats.activeUsersToday || 0,
        messagesToday: chatStats.messagesToday || 0,
        recentChats: recentChats || [],
        topDocuments: topDocuments || []
      },
      users: userStats,
      chats: chatStats,
      documents: docAnalytics,
      faqs: faqAnalytics
    }
  });
});

/**
 * @desc    Get all chats (Admin view)
 * @route   GET /api/admin/chats
 * @access  Private/Admin
 */
const getAllChats = asyncHandler(async (req, res) => {
  const { page, limit, userId, status, search } = req.query;
  
  const result = await chatService.getAllChats({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    userId,
    status,
    search
  });
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Get specific chat details (Admin view)
 * @route   GET /api/admin/chats/:chatId
 * @access  Private/Admin
 */
const getChatDetails = asyncHandler(async (req, res) => {
  // Admin can view any chat
  const chat = await chatService.getChatById(req.params.chatId, null);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: chat
  });
});

/**
 * @desc    Delete chat (Admin)
 * @route   DELETE /api/admin/chats/:chatId
 * @access  Private/Admin
 */
const deleteChat = asyncHandler(async (req, res) => {
  // Admin can delete any chat
  await chatService.deleteChat(req.params.chatId, req.user._id, true);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Chat deleted successfully'
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search, isActive } = req.query;
  
  const result = await userService.getUsers({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    role,
    search,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
  });
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Update user (Admin)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user._id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

/**
 * @desc    Update user role (Admin)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await userService.updateUser(req.params.id, { role }, req.user._id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User role updated successfully',
    data: user
  });
});

/**
 * @desc    Update user status (Admin)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await userService.updateUser(req.params.id, { isActive }, req.user._id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

/**
 * @desc    Delete/Deactivate user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user._id);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User deactivated successfully'
  });
});

/**
 * @desc    Get system health and metrics
 * @route   GET /api/admin/system/health
 * @access  Private/Admin
 */
const getSystemHealth = asyncHandler(async (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      status: 'healthy',
      uptime: Math.floor(uptime),
      uptimeFormatted: formatUptime(uptime),
      memory: {
        heapUsed: formatBytes(memoryUsage.heapUsed),
        heapTotal: formatBytes(memoryUsage.heapTotal),
        external: formatBytes(memoryUsage.external),
        rss: formatBytes(memoryUsage.rss)
      },
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    }
  });
});

// Helper functions
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

module.exports = {
  getDashboard,
  getAllChats,
  getChatDetails,
  deleteChat,
  getAllUsers,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getSystemHealth
};
