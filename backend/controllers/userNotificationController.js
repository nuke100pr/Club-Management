const userNotificationService = require("../services/userNotificationService");

class UserNotificationController {
  // Get user notifications
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const notifications = await userNotificationService.getUserNotifications(
        userId
      );
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Delete user notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const notification = await userNotificationService.deleteNotification(id);

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

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await userNotificationService.markAsRead(id);

      if (!notification) {
        return res
          .status(404)
          .json({ success: false, error: "Notification not found" });
      }

      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Transfer notifications
  async transferNotifications(req, res) {
    try {
      const { userId } = req.params;
      const result = await userNotificationService.transferNotifications(
        userId
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new UserNotificationController();
