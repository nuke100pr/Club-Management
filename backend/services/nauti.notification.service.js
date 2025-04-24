const NautiUserNotification = require("../models/UserNotification");

class NautiNotificationService {
  async nautiCreate(notificationData) {
    const notification = new NautiUserNotification(notificationData);
    return await notification.save();
  }

  async nautiGetByUserId(userId) {
    return await NautiUserNotification.find({ userId }).sort({ createdAt: -1 });
  }

  async nautiGetById(notificationId) {
    return await NautiUserNotification.findById(notificationId);
  }

  async nautiMarkAsRead(notificationId) {
    return await NautiUserNotification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  async nautiDelete(notificationId) {
    return await NautiUserNotification.findByIdAndDelete(notificationId);
  }

  async nautiUpdate(notificationId, updateData) {
    return await NautiUserNotification.findByIdAndUpdate(
      notificationId,
      updateData,
      { new: true }
    );
  }
}

module.exports = new NautiNotificationService();
