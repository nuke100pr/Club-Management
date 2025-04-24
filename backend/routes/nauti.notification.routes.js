const express = require("express");
const router = express.Router();
const nautiNotificationController = require("../controllers/nauti.notification.controller");

// Create notification
router.post("/", nautiNotificationController.nautiCreate);

// Get notifications by user ID
router.get("/user/:userId", nautiNotificationController.nautiGetByUser);

// Mark as read
router.patch("/:id/read", nautiNotificationController.nautiMarkAsRead);

// Update notification
router.put("/:id", nautiNotificationController.nautiUpdate);

// Delete notification
router.delete("/:id", nautiNotificationController.nautiDelete);

module.exports = router;
