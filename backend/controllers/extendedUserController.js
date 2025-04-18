const userFileService = require('../services/extendedUserService');
const User = require('../models/User');

// Controller to add profile photo
const addProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const userId = req.params.userId;
    
    // Save the file to the database
    const fileId = await userFileService.saveFile(req.file);
    
    // Update user with profile image
    const updatedUser = await userFileService.addProfileImage(userId, fileId);
    
    res.status(200).json({
      success: true,
      message: 'Profile photo added successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email_id: updatedUser.email_id,
        profile_image: updatedUser.profile_image
      }
    });
  } catch (error) {
    console.error('Error adding profile photo:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to add profile photo' });
  }
};

// Controller to update profile photo
const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const userId = req.params.userId;
    
    // Save the file to the database
    const fileId = await userFileService.saveFile(req.file);
    
    // Update user with new profile image
    const updatedUser = await userFileService.updateProfileImage(userId, fileId);
    
    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email_id: updatedUser.email_id,
        profile_image: updatedUser.profile_image
      }
    });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update profile photo' });
  }
};

// Controller to remove profile photo
const removeProfilePhoto = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Remove profile image
    const updatedUser = await userFileService.removeProfileImage(userId);
    
    res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email_id: updatedUser.email_id
      }
    });
  } catch (error) {
    console.error('Error removing profile photo:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to remove profile photo' });
  }
};

// Controller to update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    // Update user status
    const updatedUser = await userFileService.updateUserStatus(userId, status);
    
    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email_id: updatedUser.email_id,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update user status' });
  }
};

module.exports = {
  addProfilePhoto,
  updateProfilePhoto,
  removeProfilePhoto,
  updateUserStatus
};