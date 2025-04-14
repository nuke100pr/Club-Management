const forumService = require("../services/forumService2");

const createForum = async (req, res) => {
  try {
    const forumData = req.body;
    const imageFile = req.file;

    const newForum = await forumService.createForum(forumData, imageFile);
    res.status(201).json({
      success: true,
      message: "Forum created successfully",
      data: newForum,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllForums = async (req, res) => {
  try {
    const forums = await forumService.getAllForums(req.query);
    res.json({
      success: true,
      data: forums
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

const getForumById = async (req, res) => {
  try {
    const forum = await forumService.getForumById(req.params.id);
    res.json({
      success: true,
      data: forum
    });
  } catch (error) {
    res.status(404).json({ 
      success: false,
      error: error.message 
    });
  }
};

const updateForum = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const imageFile = req.file;

    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    const updatedForum = await forumService.updateForum(id, updateData, imageFile);
    res.json({
      success: true,
      message: "Forum updated successfully",
      data: updatedForum,
    });
  } catch (error) {
    console.error("Error updating forum:", error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

const deleteForum = async (req, res) => {
  try {
    await forumService.deleteForum(req.params.id);
    res.json({ 
      success: true,
      message: "Forum deleted successfully" 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Forum Member Controllers
const addForumMember = async (req, res) => {
  try {
    const member = await forumService.addForumMember({
      ...req.body,
      forum_id: req.params.forumId,
    });
    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

const getForumMembers = async (req, res) => {
  try {
    const members = await forumService.getForumMembers(req.params.forumId);
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

const removeForumMember = async (req, res) => {
  try {
    await forumService.removeForumMember(req.params.forumId, req.params.userId);
    res.json({ 
      success: true,
      message: "Member removed successfully" 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Utility Controllers
const checkForumMembership = async (req, res) => {
  try {
    const isMember = await forumService.checkForumMembership(
      req.params.forumId,
      req.params.userId
    );
    res.json({ 
      success: true,
      data: { isMember } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = {
  createForum,
  getAllForums,
  getForumById,
  updateForum,
  deleteForum,
  addForumMember,
  getForumMembers,
  removeForumMember,
  checkForumMembership,
};