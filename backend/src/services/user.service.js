/**
 * User Service
 * Handles user management operations
 */

const { User } = require('../models');
const { ApiError } = require('../middleware');
const { HTTP_STATUS, ROLES } = require('../config/constants');
const logger = require('../config/logger');

class UserService {
  /**
   * Get all users with pagination
   */
  async getUsers(options = {}) {
    const { page = 1, limit = 20, role, search, isActive } = options;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId)
      .select('-password -refreshToken')
      .lean();

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    return user;
  }

  /**
   * Update user (Admin)
   */
  async updateUser(userId, updates, adminId) {
    const allowedUpdates = ['firstName', 'lastName', 'role', 'isActive', 'isVerified'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    logger.info(`User ${userId} updated by admin ${adminId}`);

    return user;
  }

  /**
   * Delete user (Soft delete)
   */
  async deleteUser(userId, adminId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Prevent deleting super admin
    if (user.role === ROLES.SUPER_ADMIN) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Cannot delete super admin');
    }

    user.isActive = false;
    await user.save();

    logger.info(`User ${userId} deactivated by admin ${adminId}`);

    return { message: 'User deactivated successfully' };
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalUsers,
      activeUsers,
      activeUsersToday,
      usersByRole,
      newUsersThisMonth,
      usersByDay
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true, lastLoginAt: { $gte: today } }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) }
      }),
      User.aggregate([
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
      totalUsers,
      activeUsers,
      activeUsersToday,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      newUsersThisMonth,
      usersByDay
    };
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm, limit = 10) {
    return User.find({
      $or: [
        { email: { $regex: searchTerm, $options: 'i' } },
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } }
      ],
      isActive: true
    })
      .select('firstName lastName email role')
      .limit(limit)
      .lean();
  }
}

module.exports = new UserService();
