const UserNotification = require("../models/UserNotification");
const NotificationQueue = require("../models/NotificationQueue");

class UserNotificationService {
  // Get user notifications
  async getUserNotifications(userId) {
    try {
      return await UserNotification.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching user notifications: ${error.message}`);
    }
  }

  // Delete user notification
  async deleteNotification(notificationId) {
    try {
      return await UserNotification.findByIdAndDelete(notificationId);
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      return await UserNotification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  // Transfer notifications from queue to user notifications
  async transferNotifications(userId) {
    try {
      // Find all notifications for this user in the queue
      const queuedNotifications = await NotificationQueue.find({ userId });

      if (queuedNotifications.length === 0) {
        return { transferred: 0 };
      }

      // Create user notifications from queued notifications
      const userNotificationsToCreate = queuedNotifications.map(
        (notification) => ({
          title: notification.title,
          message: notification.message,
          userId: notification.userId,
          createdAt: notification.createdAt,
        })
      );

      // Insert user notifications
      const insertedNotifications = await UserNotification.insertMany(
        userNotificationsToCreate
      );

      // Delete notifications from queue
      const notificationIds = queuedNotifications.map(
        (notification) => notification._id
      );
      await NotificationQueue.deleteMany({ _id: { $in: notificationIds } });

      return {
        transferred: insertedNotifications.length,
        notifications: insertedNotifications,
      };
    } catch (error) {
      throw new Error(`Error transferring notifications: ${error.message}`);
    }
  }
}

module.exports = new UserNotificationService();
