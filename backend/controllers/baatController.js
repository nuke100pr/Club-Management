const BaatService = require("../services/baatService");


class BaatController {
  static async createUserNotification(req, res) {
    try {
      const userNotification = await BaatService.createUserNotification(
        req.body
      );
      res.status(201).json(userNotification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserNotificationById(req, res) {
    try {
      const { id } = req.params;
      const userNotification = await BaatService.getUserNotificationById(id);
      if (!userNotification) {
        return res.status(404).json({ message: "User notification not found" });
      }
      res.json(userNotification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllUserNotifications(req, res) {
    try {
      const userNotifications = await BaatService.getAllUserNotifications();
      res.json(userNotifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateUserNotification(req, res) {
    try {
      const { id } = req.params;
      const updatedNotification = await BaatService.updateUserNotification(
        id,
        req.body
      );
      if (!updatedNotification) {
        return res.status(404).json({ message: "User notification not found" });
      }
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteUserNotification(req, res) {
    try {
      const { id } = req.params;
      const deletedNotification = await BaatService.deleteUserNotification(id);
      if (!deletedNotification) {
        return res.status(404).json({ message: "User notification not found" });
      }
      res.json({ message: "User notification deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


  static async updateNotificationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["read", "not_read"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const updatedNotification = await BaatService.updateNotificationStatus(
        id,
        status
      );
      if (!updatedNotification) {
        return res.status(404).json({ message: "User notification not found" });
      }
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getNotificationsByUserId(req, res) {
    try {
      const { userId } = req.params;


      const notifications = await BaatService.getNotificationsByUserId(userId);

      res.json({
        success: true,
        count: notifications.length,
        data: notifications,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = BaatController;
