const Forums = require("../models/Forums");
const ForumMember = require("../models/ForumMember");
const File = require('../models/File'); 

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const saveFile = async (file) => {
  if (!file || !file.buffer) {
    console.error("Error: No file buffer provided");
    return null;
  }
  const { originalname, mimetype, buffer, size } = file; // Ensure file.buffer is available
  const filename = `${Date.now()}-${originalname.replace(/\s+/g, "_")}`; // Replace spaces to avoid issues
  const filePath = path.join(uploadDir, filename);

  console.log("Filename:", filename);
  console.log("Saving file to:", filePath);

  try {
    fs.writeFileSync(filePath, buffer);
    console.log("File saved successfully:", filePath);
  } catch (error) {
    console.error("Error writing file:", error);
    return null;
  }

  try {


    const newFile = new File({
      filename,
      originalName: originalname,
      path: filePath,
      fileType: mimetype.startsWith("image") ? "image" : "video",
      mimeType: mimetype,
      size, // Corrected: Use size directly
    });


    await newFile.save();
    return newFile._id;
  } catch (error) {
    console.error("Error saving file to database:", error);
    return null;
  }
};


const createForum = async (forumData, imageFile) => {
  try {
    // If there's an image file, save it and get the file ID
    if (imageFile) {
      const fileId = await saveFile(imageFile);
      forumData.image = fileId;
    }
    
    const newForum = new Forums(forumData);
    await newForum.save();
    
    
    return newForum;
  } catch (error) {
    // Clean up the uploaded file if event creation fails
    if (imageFile && forumData.image) {
      try {
        const filePath = path.join(uploadDir, imageFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    throw new Error(`Error creating event: ${error.message}`);
  }
};

const getAllForums = async (filters = {}) => {
  try {
    return await Forums.find(filters).populate("image");
  } catch (error) {
    throw new Error(`Error fetching forums: ${error.message}`);
  }
};

const getForumById = async (id) => {
  try {
    const forum = await Forums.findById(id);
    if (!forum) {
      throw new Error("Forum not found");
    }
    return forum;
  } catch (error) {
    throw new Error(`Error fetching forum: ${error.message}`);
  }
};

const updateForum = async (id, updateData) => {
  try {
    const forum = await Forums.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!forum) {
      throw new Error("Forum not found");
    }
    return forum;
  } catch (error) {
    throw new Error(`Error updating forum: ${error.message}`);
  }
};

const deleteForum = async (id) => {
  try {
    const forum = await Forums.findByIdAndDelete(id);
    if (!forum) {
      throw new Error("Forum not found");
    }
    // Clean up related members and bans
    await ForumMember.deleteMany({ forum_id: id });
    await ForumMemberBan.deleteMany({ forum_id: id });
    return forum;
  } catch (error) {
    throw new Error(`Error deleting forum: ${error.message}`);
  }
};

// Forum Member Operations
const addForumMember = async (memberData) => {
  try {
    const member = new ForumMember(memberData);
    return await member.save();
  } catch (error) {
    throw new Error(`Error adding forum member: ${error.message}`);
  }
};

const getForumMembers = async (forumId) => {
  try {
    return await ForumMember.find({ forum_id: forumId });
  } catch (error) {
    throw new Error(`Error fetching forum members: ${error.message}`);
  }
};

const removeForumMember = async (forumId, userId) => {
  try {
    const result = await ForumMember.findOneAndDelete({
      forum_id: forumId,
      user_id: userId,
    });
    if (!result) {
      throw new Error("Forum member not found");
    }
    return result;
  } catch (error) {
    throw new Error(`Error removing forum member: ${error.message}`);
  }
};




// Utility Functions
const checkForumMembership = async (forumId, userId) => {
  try {
    const member = await ForumMember.findOne({
      forum_id: forumId,
      user_id: userId,
    });
    return !!member;
  } catch (error) {
    throw new Error(`Error checking forum membership: ${error.message}`);
  }
};


module.exports = {
  // Forum CRUD
  createForum,
  getAllForums,
  getForumById,
  updateForum,
  deleteForum,

  // Member management
  addForumMember,
  getForumMembers,
  removeForumMember,



  checkForumMembership,
};
