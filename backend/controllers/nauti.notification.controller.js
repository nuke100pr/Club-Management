const nautiNotificationService = require("../services/nauti.notification.service");

class NautiNotificationController {
  async nautiCreate(req, res) {
    const notification = await nautiNotificationService.nautiCreate(req.body);
    res.status(201).json(notification);
  }

  async nautiGetByUser(req, res) {
    const { userId } = req.params;
    const notifications = await nautiNotificationService.nautiGetByUserId(
      userId
    );
    res.json(notifications);
  }

  async nautiMarkAsRead(req, res) {
    const { id } = req.params;
    const notification = await nautiNotificationService.nautiMarkAsRead(id);
    res.json(notification);
  }

  async nautiUpdate(req, res) {
    const { id } = req.params;
    const updatedNotification = await nautiNotificationService.nautiUpdate(
      id,
      req.body
    );
    res.json(updatedNotification);
  }

  async nautiDelete(req, res) {
    const { id } = req.params;
    await nautiNotificationService.nautiDelete(id);
    res.json({ message: "Notification deleted" });
  }
}

module.exports = new NautiNotificationController();
