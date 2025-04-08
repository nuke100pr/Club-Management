const Notification = require('../models/Notification');
const UsertoNotification = require('../models/UsertoNotification');
const mongoose = require('mongoose');

const notificationService = {
  // 1. Create and send notification to multiple users
  async sendNotification(userIds, title, description, type, link_id) {
    try {
      // Validate input parameters
      if (!userIds || !Array.isArray(userIds)) {
        throw new Error('userIds must be an array');
      }
      if (!title || !description || !type) {
        throw new Error('title, description, and type are required');
      }

      // Create the notification
      const newNotification = new Notification({
        title,
        description,
        type,
        link_id,
        created_at: new Date()
      });

      await newNotification.save();

      // Create mappings for all users
      const userNotificationMappings = userIds.map(user_id => ({
        user_id,
        notification_id: newNotification._id,
        status: 'not_read'
      }));

      await UsertoNotification.insertMany(userNotificationMappings);

      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // 2. Get notifications for a specific user with pagination
  async getUserNotifications(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      // Get user notification mappings first
      const userNotifications = await UsertoNotification.find({ user_id: userId })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Get the actual notification details
      const notificationIds = userNotifications.map(un => un.notification_id);
      const notifications = await Notification.find({ _id: { $in: notificationIds } })
        .sort({ created_at: -1 });

      // Combine with read status
      const enrichedNotifications = notifications.map(notification => {
        const userNotification = userNotifications.find(
          un => un.notification_id.toString() === notification._id.toString()
        );
        return {
          ...notification.toObject(),
          status: userNotification.status
        };
      });

      const total = await UsertoNotification.countDocuments({ user_id: userId });

      return {
        notifications: enrichedNotifications,
        totalNotifications: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  },

  // 3. Get a single notification by ID with user status
  async getNotificationById(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      const userNotification = await UsertoNotification.findOne({
        notification_id: notificationId,
        user_id: userId
      });

      return {
        ...notification.toObject(),
        status: userNotification ? userNotification.status : null
      };
    } catch (error) {
      console.error('Error getting notification by ID:', error);
      throw error;
    }
  },

  // 4. Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const updated = await UsertoNotification.findOneAndUpdate(
        { notification_id: notificationId, user_id: userId },
        { status: 'read' },
        { new: true }
      );

      if (!updated) {
        throw new Error('Notification mapping not found');
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // 5. Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      await UsertoNotification.updateMany(
        { user_id: userId, status: 'not_read' },
        { $set: { status: 'read' } }
      );

      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // 6. Update notification details
  async updateNotification(notificationId, updateData) {
    try {
      // Only allow updating certain fields
      const { title, description, type, link_id } = updateData;
      const updateFields = {};
      
      if (title) updateFields.title = title;
      if (description) updateFields.description = description;
      if (type) updateFields.type = type;
      if (link_id) updateFields.link_id = link_id;

      updateFields.updated_at = new Date();

      const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        updateFields,
        { new: true }
      );

      if (!updatedNotification) {
        throw new Error('Notification not found');
      }

      return updatedNotification;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  },

  // 7. Delete notification and all its mappings
  async deleteNotification(notificationId) {
    try {
      // Delete the notification
      const deletedNotification = await Notification.findByIdAndDelete(notificationId);
      
      if (!deletedNotification) {
        throw new Error('Notification not found');
      }

      // Delete all user mappings for this notification
      await UsertoNotification.deleteMany({ notification_id: notificationId });

      return { success: true, deletedNotification };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // 8. Get unread notification count for a user
  async getUnreadCount(userId) {
    try {
      const count = await UsertoNotification.countDocuments({
        user_id: userId,
        status: 'not_read'
      });

      return { count };
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  },

  // 9. Get notification recipients
  async getNotificationRecipients(notificationId) {
    try {
      const recipients = await UsertoNotification.find({ notification_id: notificationId })
        .populate('user_id', 'username email profile_pic')
        .lean();

      return recipients;
    } catch (error) {
      console.error('Error getting notification recipients:', error);
      throw error;
    }
  }
};

module.exports = notificationService;