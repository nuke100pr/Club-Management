const path = require('path');
const fs = require('fs');
const multer = require('multer');
const File = require('../models/File');
const User = require('../models/User');

// Set up upload directory
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer with memory storage
const storage = multer.memoryStorage();

// Set up multer upload with memory storage
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Save file to disk and database from memory buffer
const saveFile = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided");
  }

  const { originalname, mimetype, buffer, size } = file;
  const filename = `${Date.now()}-${originalname.replace(/\s+/g, '_')}`;
  const filePath = path.join(uploadDir, filename);

  try {
    // Write buffer to disk
    fs.writeFileSync(filePath, buffer);
    
    // Save file metadata to database
    const newFile = new File({
      filename,
      originalName: originalname,
      path: filePath,
      fileType: mimetype.startsWith("image") ? "image" : "other",
      mimeType: mimetype,
      size
    });

    await newFile.save();
    return newFile._id;
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
};

// Add profile image
const addProfileImage = async (userId, fileId) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile_image: fileId },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    console.error("Error updating user profile image:", error);
    throw error;
  }
};

// Remove profile image
const removeProfileImage = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.profile_image) {
      // Get file details
      const file = await File.findById(user.profile_image);
      
      if (file) {
        // Delete the physical file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        // Remove file from database
        await File.findByIdAndDelete(user.profile_image);
      }
      
      // Update user to remove profile_image reference
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $unset: { profile_image: "" } },
        { new: true }
      );
      
      return updatedUser;
    } else {
      throw new Error('User has no profile image');
    }
  } catch (error) {
    console.error("Error removing profile image:", error);
    throw error;
  }
};

// Update profile image
const updateProfileImage = async (userId, fileId) => {
  try {
    // First remove old profile image if exists
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.profile_image) {
      // Get file details
      const file = await File.findById(user.profile_image);
      
      if (file) {
        // Delete the physical file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        // Remove file from database
        await File.findByIdAndDelete(user.profile_image);
      }
    }
    
    // Now update with new file
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile_image: fileId },
      { new: true }
    );
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating profile image:", error);
    throw error;
  }
};

// Update user status
const updateUserStatus = async (userId, status) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

module.exports = {
  upload,
  saveFile,
  addProfileImage,
  removeProfileImage,
  updateProfileImage,
  updateUserStatus
};