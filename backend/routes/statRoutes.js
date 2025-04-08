const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statController');

// Get all statistics
router.get('/', statsController.getStats);

module.exports = router;