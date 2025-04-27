const Resource = require("../models/Resource");

class ResourceService {
  // Create a new resource
  static async createResource(resourceData) {
    try {
      const resource = new Resource(resourceData);
      await resource.save();
      return resource;
    } catch (error) {
      throw new Error(`Error creating resource: ${error.message}`);
    }
  }

  static async getAllResources(filter = {}) {
    try {
      const resources = await Resource.find(filter);

      const populatedResources = await Promise.all(
        resources.map(async (resource) => {
          let populatedResource = resource;

          // Populate club_id if it exists
          if (resource.club_id && resource.club_id !== "null") {
            populatedResource = await resource.populate("club_id");
          }

          // Populate board_id if it exists
          if (resource.board_id && resource.board_id !== "null") {
            populatedResource = await resource.populate("board_id");
          }

          return populatedResource;
        })
      );

      return populatedResources;
    } catch (error) {
      throw new Error(`Error fetching resources: ${error.message}`);
    }
  }

  // Get a single resource by ID
  static async getResourceById(resourceId) {
    try {
      const resource = await Resource.findById(resourceId);

      if (!resource) {
        throw new Error("Resource not found");
      }
      return resource;
    } catch (error) {
      throw new Error(`Error fetching resource: ${error.message}`);
    }
  }

  // Update a resource
  static async updateResource(resourceId, updateData) {
    try {
      const resource = await Resource.findByIdAndUpdate(
        resourceId,
        updateData,
        { new: true, runValidators: true }
      )
        .populate("club_id", "name")
        .populate("event_id", "title")
        .populate("board_id", "name")
        .populate("user_id", "username email");

      if (!resource) {
        throw new Error("Resource not found");
      }
      return resource;
    } catch (error) {
      throw new Error(`Error updating resource: ${error.message}`);
    }
  }

  // Delete a resource
  static async deleteResource(resourceId) {
    try {
      const resource = await Resource.findByIdAndDelete(resourceId);
      if (!resource) {
        throw new Error("Resource not found");
      }
      return { message: "Resource deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting resource: ${error.message}`);
    }
  }

  // Get resources by user ID
  static async getResourcesByUserId(userId) {
    try {
      const resources = await Resource.find({ user_id: userId })
        .populate("club_id", "name")
        .populate("event_id", "title")
        .populate("board_id", "name");
      return resources;
    } catch (error) {
      throw new Error(`Error fetching user resources: ${error.message}`);
    }
  }

  // Get resources by tags
  static async getResourcesByTags(tags) {
    try {
      const resources = await Resource.find({ tags: { $in: tags } })
        .populate("club_id", "name")
        .populate("event_id", "title")
        .populate("board_id", "name")
        .populate("user_id", "username email");
      return resources;
    } catch (error) {
      throw new Error(`Error fetching resources by tags: ${error.message}`);
    }
  }

  // Search resources by title or description
  static async searchResources(query) {
    try {
      const resources = await Resource.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      })
        .populate("club_id", "name")
        .populate("event_id", "title")
        .populate("board_id", "name")
        .populate("user_id", "username email");
      return resources;
    } catch (error) {
      throw new Error(`Error searching resources: ${error.message}`);
    }
  }
}

module.exports = ResourceService;
