const express = require('express');
const router = express.Router();
const BaatController = require('../controllers/baatController');

// Create a new user notification


router.post('/', BaatController.createUserNotification);

// Get all user notifications
router.get('/', BaatController.getAllUserNotifications);

// Get a specific user notification by ID
router.get('/:id', BaatController.getUserNotificationById);

// Update a user notification by ID
router.put('/:id', BaatController.updateUserNotification);

// Delete a user notification by ID
router.delete('/:id', BaatController.deleteUserNotification);

// Get all notifications for a specific user
router.get('/user/:userId', BaatController.getNotificationsByUserId);

// Update notification status
router.patch('/:id/status', BaatController.updateNotificationStatus);

module.exports = router;