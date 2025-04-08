const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Edit notification by ID
router.put('/:id', notificationController.editNotification);

// Delete notification by ID
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;