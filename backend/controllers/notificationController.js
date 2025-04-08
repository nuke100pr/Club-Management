const notificationService = require("../services/notificationService");
const Notification = require("../models/Notification");

const notificationController = {
  /**
   * Edit notification by ID
   */
  editNotification: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Basic input validation
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid notification ID",
        });
      }

      // Check if updateData has at least one valid field
      const validFields = ["title", "description", "type", "link_id"];
      const hasValidUpdate = Object.keys(updateData).some((key) =>
        validFields.includes(key)
      );

      if (!hasValidUpdate) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update",
        });
      }

      // Edit the notification
      const result = await notificationService.editnotification(id, updateData);

      return res.status(200).json({
        success: true,
        message: "Notification updated successfully",
        notification: result.notification,
      });
    } catch (error) {
      console.error("Error in editNotification:", error.message);
      if (error.message === "Notification not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to update notification",
        error: error.message,
      });
    }
  },

  /**
   * Delete notification by ID
   */
  deleteNotification: async (req, res) => {
    try {
      const { id } = req.params;

      // Basic input validation
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid notification ID",
        });
      }

      // Delete the notification
      const result = await notificationService.deletenotification(id);

      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
        notification: result.deletedNotification,
      });
    } catch (error) {
      console.error("Error in deleteNotification:", error.message);
      if (error.message === "Notification not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: error.message,
      });
    }
  },

  /**
   * Get notification by ID (optional)
   */
  getNotification: async (req, res) => {
    try {
      const { id } = req.params;

      // Basic input validation
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid notification ID",
        });
      }

      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      console.error("Error in getNotification:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to get notification",
        error: error.message,
      });
    }
  },
};

module.exports = notificationController;
