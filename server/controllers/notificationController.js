const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Get notifications for a user with filtering and pagination
 */
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      type,
      isRead,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter conditions
    const where = {
      userId,
      ...(type && { type }),
      ...(isRead !== undefined && { isRead: isRead === 'true' }),
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ]
      })
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build sort order
    const sort = {};
    if (sortBy === 'priority') {
      // For priority sorting, we need to map string values to numbers
      // Since MongoDB doesn't have enum ordering, we'll handle this in application logic
      sort.createdAt = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Get notifications with pagination
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(where)
        .sort(sort)
        .skip(skip)
        .limit(take),
      Notification.countDocuments(where),
      Notification.countDocuments({ userId, isRead: false })
    ]);

    const totalPages = Math.ceil(total / take);

    res.json({
      notifications,
      total,
      page: parseInt(page),
      totalPages,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Create a new notification
 */
const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, priority = 'NORMAL', metadata } = req.body;

    // Validate required fields
    if (!userId || !title || !message || !type) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, title, message, type' 
      });
    }

    // Validate enum values
    const validTypes = ['ORDER_UPDATE', 'PAYMENT_STATUS', 'PROMOTION', 'SYSTEM_ALERT'];
    const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid notification priority' });
    }

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      priority,
      metadata
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

/**
 * Update notification (mark as read/unread)
 */
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    if (typeof isRead !== 'boolean') {
      return res.status(400).json({ error: 'isRead must be a boolean value' });
    }

    const notification = await Notification.findByIdAndUpdate(id, { isRead }, { new: true });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Notification not found' });
    }
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

/**
 * Bulk mark notifications as read
 */
const bulkMarkAsRead = async (req, res) => {
  try {
    const { notificationIds, userId } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ error: 'notificationIds must be a non-empty array' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const updateResult = await Notification.updateMany(
      { _id: { $in: notificationIds }, userId },
      { isRead: true }
    );

    res.json({ 
      message: `${updateResult.modifiedCount} notifications marked as read`,
      updatedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

/**
 * Delete single notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Ensure user can only delete their own notifications
    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await Notification.findByIdAndDelete(id);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

/**
 * Bulk delete notifications
 */
const bulkDeleteNotifications = async (req, res) => {
  try {
    const { notificationIds, userId } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ error: 'notificationIds must be a non-empty array' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const deleteResult = await Notification.deleteMany({
      _id: { $in: notificationIds },
      userId
    });

    res.json({ 
      message: `${deleteResult.deletedCount} notifications deleted`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting notifications:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await Notification.countDocuments({
      userId, isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

module.exports = {
  getUserNotifications,
  createNotification,
  updateNotification,
  bulkMarkAsRead,
  deleteNotification,
  bulkDeleteNotifications,
  getUnreadCount
};