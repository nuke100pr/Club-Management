const User = require('../models/User');
const ClubFollow = require('../models/ClubFollow');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class UserService {
  // Create a new user
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }
  async googleAuthCallback(user) {
    // Generate JWT token for the authenticated Google user
    const token = jwt.sign(
      { id: user._id, email: user.email_id },
      config.jwtSecret,
      { expiresIn: '30d' }
    );
  
    return { user, token };
  }
  // Delete user by ID
  async deleteUserById(userId) {
    return await User.findByIdAndDelete(userId);
  }

  // Fetch user details by user ID
  async fetchUserDetailsById(userId) {
    return await User.findOne({ _id: userId });
  }

  // Edit user details by user ID
  async editUserDetailsById(userId, updateData) {
    return await User.findOneAndUpdate({ _id: userId }, updateData, { new: true });
  }

  // List all users
  async listAllUsers() {
    return await User.find({});
  }
  // Fetch user by email
async fetchUserByEmail(email) {
  return await User.findOne({ email_id: email });
}

  // Fetch all users
  async fetchAllUsers() {
    return await User.find({});
  }

  // Fetch users by club_id
  async fetchUsersByClubId(clubId) {
    const followers = await ClubFollow.find({ club_id: clubId }).populate('user_id');
    return followers.map(follower => follower.user_id);
  }

  // Edit user by ID
  async editUserById(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

  // Unfollow a club
  async unfollowClub(userId, clubId) {
    return await ClubFollow.findOneAndDelete({ user_id: userId, club_id: clubId });
  }

  // Follow a club
  async followClub(userId, clubId) {
    const follow = new ClubFollow({ user_id: userId, club_id: clubId });
    return await follow.save();
  }

  // Like a post
  async likePost(userId, postId) {
    const like = new PostLikes({ user_id: userId, post_id: postId });
    return await like.save();
  }

  // Fetch like
  async fetchLike(userId, postId) {
    return await PostLikes.findOne({ user_id: userId, post_id: postId });
  }

  // Unlike a post
  async unlikePost(userId, postId) {
    return await PostLikes.findOneAndDelete({ user_id: userId, post_id: postId });
  }

  // Register new user
  async registerUser(userData) {
    const existingUser = await User.findOne({ email_id: userData.email_address });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const user = new User({
      name: userData.name || 'New User',
      email_id: userData.email_address,
      password: userData.password,
      department: userData.department || ''
    });

    await user.save();
    
    const token = jwt.sign(
      { id: user._id, email: user.email_id },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    return { user, token };
  }

  // Login user
  async loginUser(email, password) {
    const user = await User.findOne({ email_id: email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.password !== password) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    const token = jwt.sign(
      { id: user._id, email: user.email_id },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    return { user, token };
  }

  async updateUserRole(userId, newRole, entityId) {
    const updateData = { userRole: newRole };
    
    if (newRole === 'club_admin') {
      updateData.club_id = entityId;
      updateData.board_id = null;
    } else if (newRole === 'board_admin') {
      updateData.board_id = entityId;
      updateData.club_id = null;
    } else if (newRole === 'member') {
      updateData.club_id = null;
      updateData.board_id = null;
    }

    return await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
  }
}

module.exports = new UserService();