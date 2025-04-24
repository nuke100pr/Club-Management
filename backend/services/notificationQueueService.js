const NotificationQueue = require('../models/NotificationQueue');

class NotificationQueueService {
  // Create notification in queue
  async createNotification(notificationData) {
    try {
      const notification = new NotificationQueue(notificationData);
      return await notification.save();
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Get all notifications in queue
  async getAllNotifications() {
    try {
      return await NotificationQueue.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  // Get notifications for a specific user
  async getNotificationsByUserId(userId) {
    try {
      return await NotificationQueue.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching user notifications: ${error.message}`);
    }
  }

  // Delete notification from queue
  async deleteNotification(notificationId) {
    try {
      return await NotificationQueue.findByIdAndDelete(notificationId);
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }
}

module.exports = new NotificationQueueService();