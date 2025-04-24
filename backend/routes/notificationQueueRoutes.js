const express = require('express');
const notificationQueueController = require('../controllers/notificationQueueController');
const router = express.Router();

router.post('/', notificationQueueController.createNotification);
router.get('/', notificationQueueController.getAllNotifications);
router.get('/user/:userId', notificationQueueController.getNotificationsByUserId);
router.delete('/:id', notificationQueueController.deleteNotification);

module.exports = router;