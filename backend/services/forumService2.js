const Forums = require("../models/Forums");
const ForumMember = require("../models/ForumMember");
const File = require('../models/File'); 

const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const saveFile = async (file) => {
  if (!file || !file.buffer) {
    console.error("Error: No file buffer provided");
    return null;
  }
  
  const { originalname, mimetype, buffer, size } = file;
  const filename = `${Date.now()}-${originalname.replace(/\s+/g, "_")}`;
  const filePath = path.join(uploadDir, filename);

  try {
    fs.writeFileSync(filePath, buffer);
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
      size,
    });

    await newFile.save();
    return newFile._id;
  } catch (error) {
    console.error("Error saving file to database:", error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return null;
  }
};

const deleteFile = async (fileId) => {
  try {
    if (!fileId) return;

    const file = await File.findById(fileId);
    if (!file) return;

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await File.findByIdAndDelete(fileId);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

const createForum = async (forumData, imageFile) => {
  let fileId = null;
  
  try {
    if (imageFile) {
      fileId = await saveFile(imageFile);
      if (fileId) {
        forumData.image = fileId;
      }
    }
    
    const newForum = new Forums(forumData);
    await newForum.save();
    return newForum;
  } catch (error) {
    if (fileId) {
      await deleteFile(fileId);
    }
    throw new Error(`Error creating forum: ${error.message}`);
  }
};

const getAllForums = async (filters = {}) => {
  try {
    return await Forums.find(filters)
      .populate("image")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching forums: ${error.message}`);
  }
};

const getForumById = async (id) => {
  try {
    const forum = await Forums.findById(id).populate("image");
    if (!forum) {
      throw new Error("Forum not found");
    }
    return forum;
  } catch (error) {
    throw new Error(`Error fetching forum: ${error.message}`);
  }
};

const updateForum = async (id, updateData, imageFile) => {
  try {
    const forum = await Forums.findById(id);
    if (!forum) {
      throw new Error("Forum not found");
    }

    let fileId = null;
    
    if (imageFile) {
      fileId = await saveFile(imageFile);
      if (fileId) {
        updateData.image = fileId;
      }
      
      if (forum.image) {
        await deleteFile(forum.image);
      }
    }

    const updatedForum = await Forums.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate("image");

    return updatedForum;
  } catch (error) {
    throw new Error(`Error updating forum: ${error.message}`);
  }
};

const deleteForum = async (id) => {
  try {
    const forum = await Forums.findById(id);
    if (!forum) {
      throw new Error("Forum not found");
    }

    if (forum.image) {
      await deleteFile(forum.image);
    }

    await Forums.findByIdAndDelete(id);
    await ForumMember.deleteMany({ forum_id: id });
    await ForumMemberBan.deleteMany({ forum_id: id });

    return forum;
  } catch (error) {
    throw new Error(`Error deleting forum: ${error.message}`);
  }
};

const addForumMember = async (memberData) => {
  try {
    const existingMember = await ForumMember.findOne({
      forum_id: memberData.forum_id,
      user_id: memberData.user_id
    });

    if (existingMember) {
      throw new Error("User is already a member of this forum");
    }

    const member = new ForumMember(memberData);
    return await member.save();
  } catch (error) {
    throw new Error(`Error adding forum member: ${error.message}`);
  }
};

const getForumMembers = async (forumId) => {
  try {
    return await ForumMember.find({ forum_id: forumId })
      .populate("user_id")
      .sort({ joinedAt: -1 });
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