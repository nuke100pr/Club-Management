const UsertoNotification = require('../models/UsertoNotification');
const mongoose = require("mongoose");

class BaatService {
  static async createUserNotification(data) {
    try {
      const newUserNotification = new UsertoNotification(data);
      return await newUserNotification.save();
    } catch (error) {
      throw error;
    }
  }

  static async getUserNotificationById(id) {
    try {
      return await UsertoNotification.findById({id})
        .populate('user_id')
        .populate('notification_id');
    } catch (error) {
      throw error;
    }
  }

  static async getAllUserNotifications() {
    try {
      return await UsertoNotification.find()
        .populate('user_id')
        .populate('notification_id');
    } catch (error) {
      throw error;
    }
  }

  static async updateUserNotification(id, updateData) {
    try {
      return await UsertoNotification.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw error;
    }
  }

  static async deleteUserNotification(id) {
    try {
      return await UsertoNotification.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }


  static async updateNotificationStatus(id, status) {
    try {
      return await UsertoNotification.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  static async getNotificationsByUserId(userId) {
    try {
      return await UsertoNotification.find({ user_id: userId })
        .populate('user_id')  // Populate user details if needed
        .populate('notification_id'); // Populate full notification details
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BaatService;