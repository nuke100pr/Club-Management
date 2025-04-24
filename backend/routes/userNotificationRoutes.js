const express = require('express');
const userNotificationController = require('../controllers/userNotificationController');
const router = express.Router();

router.get('/user/:userId', userNotificationController.getUserNotifications);
router.delete('/:id', userNotificationController.deleteNotification);
router.patch('/:id/read', userNotificationController.markAsRead);
router.post('/transfer/:userId', userNotificationController.transferNotifications);

module.exports = router;