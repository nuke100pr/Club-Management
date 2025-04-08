const ResourceService = require('../services/resourceService');

class ResourceController {
  // Create a new resource
  static async createResource(req, res) {
    try {
      const resource = await ResourceService.createResource(req.body);
      res.status(201).json({
        success: true,
        message: 'Resource created successfully',
        data: resource
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all resources
  static async getAllResources(req, res) {
    try {
      const filter = {};
      
      // Apply filters from query params if they exist
      if (req.query.club_id) filter.club_id = req.query.club_id;
      if (req.query.event_id) filter.event_id = req.query.event_id;
      if (req.query.board_id) filter.board_id = req.query.board_id;
      if (req.query.user_id) filter.user_id = req.query.user_id;
      if (req.query.tag) filter.tags = req.query.tag;

      const resources = await ResourceService.getAllResources(filter);
      res.status(200).json({
        success: true,
        data: resources
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get a single resource by ID
  static async getResourceById(req, res) {
    try {
      const resource = await ResourceService.getResourceById(req.params.id);
      res.status(200).json({
        success: true,
        data: resource
      });
    } catch (error) {
      if (error.message === 'Resource not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    }
  }

  // Update a resource
  static async updateResource(req, res) {
    try {
      const resource = await ResourceService.updateResource(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Resource updated successfully',
        data: resource
      });
    } catch (error) {
      if (error.message === 'Resource not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }
  }

  // Delete a resource
  static async deleteResource(req, res) {
    try {
      await ResourceService.deleteResource(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Resource not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    }
  }

  // Get resources by user ID
  static async getResourcesByUserId(req, res) {
    try {
      const resources = await ResourceService.getResourcesByUserId(req.params.userId);
      res.status(200).json({
        success: true,
        data: resources
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get resources by tags
  static async getResourcesByTags(req, res) {
    try {
      const tags = req.query.tags ? req.query.tags.split(',') : [];
      const resources = await ResourceService.getResourcesByTags(tags);
      res.status(200).json({
        success: true,
        data: resources
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Search resources
  static async searchResources(req, res) {
    try {
      const resources = await ResourceService.searchResources(req.query.q);
      res.status(200).json({
        success: true,
        data: resources
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ResourceController;