const notificationQueueService = require("../services/notificationQueueService");

class NotificationQueueController {
  // Create a new notification
  async createNotification(req, res) {
    try {
      const notification = await notificationQueueService.createNotification(
        req.body
      );
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get all notifications
  async getAllNotifications(req, res) {
    try {
      const notifications =
        await notificationQueueService.getAllNotifications();
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get notifications by user ID
  async getNotificationsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const notifications =
        await notificationQueueService.getNotificationsByUserId(userId);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const notification = await notificationQueueService.deleteNotification(
        id
      );

      if (!notification) {
        return res
          .status(404)
          .json({ success: false, error: "Notification not found" });
      }

      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new NotificationQueueController();
