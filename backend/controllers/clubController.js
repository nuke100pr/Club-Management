const clubService = require('../services/clubService');

// Fetch all clubs with follow status for current user
exports.fetchAllClubs = async (req, res) => {
  try {
    const { user_id } = req.query; // Get user_id from query params
    const clubs = await clubService.fetchAllClubs(user_id);
    res.status(200).json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch clubs by board ID with follow status
exports.fetchClubsByBoardId = async (req, res) => {
  try {
    const { board_id } = req.params;
    const { user_id } = req.query;
    const clubs = await clubService.fetchClubsByBoardId(board_id, user_id);
    res.status(200).json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch club by club ID with follow status
exports.fetchClubById = async (req, res) => {
  try {
    const { club_id } = req.params;
    const { user_id } = req.query;
    const club = await clubService.fetchClubById(club_id, user_id);
    res.status(200).json(club);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete club and all related data
exports.deleteClub = async (req, res) => {
  try {
    const { club_id } = req.params;
    await clubService.deleteClub(club_id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit club details by club ID
exports.editClub = async (req, res) => {
  try {
    const { club_id } = req.params;
    const updateData = req.body;
    const imageFile = req.file;
    
    const updatedClub = await clubService.editClubById(club_id, updateData, imageFile);
    
    res.status(200).json({
      success: true,
      message: 'Club updated successfully',
      data: updatedClub
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new club
exports.createClub = async (req, res) => {
  try {
    const clubData = req.body;
    const imageFile = req.file;

    const newClub = await clubService.createClub(clubData, imageFile);
    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      data: newClub
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Fetch all clubs followed by a user
exports.fetchClubsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const clubs = await clubService.fetchClubsByUserId(user_id);
    res.status(200).json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check if user follows a club
exports.checkClubFollow = async (req, res) => {
  try {
    const { user_id, club_id } = req.params;
    const isFollowing = await clubService.checkClubFollow(user_id, club_id);
    res.status(200).json({ isFollowing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check if user follows a board
exports.checkBoardFollow = async (req, res) => {
  try {
    const { user_id, board_id } = req.params;
    const isFollowing = await clubService.checkBoardFollow(user_id, board_id);
    res.status(200).json({ isFollowing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unfollow a club by user_id and club_id
exports.unfollowClub = async (req, res) => {
  try {
    const { user_id, club_id } = req.params;
    await clubService.unfollowClub(user_id, club_id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Follow a club by user_id and club_id
exports.followClub = async (req, res) => {
  try {
    const { user_id, club_id } = req.params;
    const follow = await clubService.followClub(user_id, club_id);
    res.status(201).json(follow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Follow a board by user_id and board_id
exports.followBoard = async (req, res) => {
  try {
    const { user_id, board_id } = req.params;
    const follow = await clubService.followBoard(user_id, board_id);
    res.status(201).json(follow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unfollow a board by user_id and board_id
exports.unfollowBoard = async (req, res) => {
  try {
    const { user_id, board_id } = req.params;
    await clubService.unfollowBoard(user_id, board_id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};