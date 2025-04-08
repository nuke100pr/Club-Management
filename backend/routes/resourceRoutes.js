const express = require('express');
const router = express.Router();
const ResourceController = require('../controllers/resourceController');

// Basic CRUD Routes
router.post('/api/resource', ResourceController.createResource);          // Create resource
router.get('/api/resource', ResourceController.getAllResources);         // Get all resources
router.get('/bpi/:id', ResourceController.getResourceById);     // Get single resource
router.put('/bpi/:id', ResourceController.updateResource);      // Update resource
router.delete('/bpi/:id', ResourceController.deleteResource);    // Delete resource

// Additional Routes
router.get('/user/:userId', ResourceController.getResourcesByUserId);  // Get by user
router.get('/tags/list', ResourceController.getResourcesByTags);       // Get by tags
router.get('/search/query', ResourceController.searchResources);       // Search resources

module.exports = router;