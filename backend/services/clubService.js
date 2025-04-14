const Club = require("../models/Clubs");
const Event = require("../models/Event");
const Post = require("../models/Posts");
const Resource = require("../models/Resource");
const Project = require("../models/Project");
const Opportunity = require("../models/Opportunities");
const Blog = require("../models/Blogs");
const Forum = require("../models/Forums");
const ClubFollow = require("../models/ClubFollow");
const BoardFollow = require("../models/BoardFollow");
const File = require("../models/File");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to save files
async function saveFile(file) {
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
}

// Fetch all clubs with follow status
exports.fetchAllClubs = async (userId) => {
  const clubs = await Club.find({}).populate("image");
  
  if (!userId) {
    return clubs.map(club => ({ ...club.toObject(), isFollowing: false, isBoardFollowing: false }));
  }

  const clubFollows = await ClubFollow.find({ user_id: userId });
  const boardFollows = await BoardFollow.find({ user_id: userId });

  return clubs.map(club => ({
    ...club.toObject(),
    isFollowing: clubFollows.some(follow => follow.club_id === club._id.toString()),
    isBoardFollowing: boardFollows.some(follow => follow.board_id === club.board_id)
  }));
};

// Fetch clubs by board ID with follow status
exports.fetchClubsByBoardId = async (boardId, userId) => {
  const clubs = await Club.find({ board_id: boardId }).populate("image");
  
  if (!userId) {
    return clubs.map(club => ({ ...club.toObject(), isFollowing: false, isBoardFollowing: false }));
  }

  const clubFollows = await ClubFollow.find({ user_id: userId, club_id: { $in: clubs.map(c => c._id) } });
  const boardFollow = await BoardFollow.findOne({ user_id: userId, board_id: boardId });

  return clubs.map(club => ({
    ...club.toObject(),
    isFollowing: clubFollows.some(follow => follow.club_id === club._id.toString()),
    isBoardFollowing: !!boardFollow
  }));
};

// Fetch club by club ID with follow status
exports.fetchClubById = async (clubId, userId) => {
  const club = await Club.findById(clubId).populate("image");
  console.log(club);
  if (!club) return null;

  let isFollowing = false;
  let isBoardFollowing = false;

  if (userId) {
    isFollowing = await ClubFollow.exists({ user_id: userId, club_id: clubId });
    isBoardFollowing = await BoardFollow.exists({ user_id: userId, board_id: club.board_id });
  }

  return {
    ...club.toObject(),
    isFollowing,
    isBoardFollowing
  };
};

// Delete club and all related data
exports.deleteClub = async (clubId) => {
  await Event.deleteMany({ club_id: clubId });
  await Post.deleteMany({ club_id: clubId });
  await Resource.deleteMany({ club_id: clubId });
  await Project.deleteMany({ club_id: clubId });
  await Opportunity.deleteMany({ club_id: clubId });
  await Blog.deleteMany({ club_id: clubId });
  await Forum.deleteMany({ club_id: clubId });
  await ClubFollow.deleteMany({ club_id: clubId });
  return await Club.findByIdAndDelete(clubId);
};

// Edit club details by club ID
exports.editClubById = async (clubId, updateData, imageFile) => {
  try {
    const club = await Club.findById(clubId);
    if (!club) {
      throw new Error('Club not found');
    }

    if (imageFile) {
      const newFileId = await saveFile(imageFile);
      
      if (club.image) {
        try {
          const oldFile = await File.findById(club.image);
          if (oldFile) {
            const oldFilePath = path.join(uploadDir, oldFile.filename);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
            await File.findByIdAndDelete(club.image);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up old file:', cleanupError);
        }
      }
      
      updateData.image = newFileId;
    }

    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      updateData,
      { new: true, runValidators: true }
    ).populate('image');

    return updatedClub;
  } catch (error) {
    if (imageFile && updateData.image) {
      try {
        const newFile = await File.findById(updateData.image);
        if (newFile) {
          const filePath = path.join(uploadDir, newFile.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          await File.findByIdAndDelete(updateData.image);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up new file:', cleanupError);
      }
    }
    throw new Error(`Error updating club: ${error.message}`);
  }
};

// Create a new club
exports.createClub = async (clubData, imageFile) => {
  try {
    if (imageFile) {
      const fileId = await saveFile(imageFile);
      clubData.image = fileId;
    }

    const newClub = new Club(clubData);
    await newClub.save();
    return newClub;
  } catch (error) {
    if (imageFile && clubData.image) {
      try {
        const file = await File.findById(clubData.image);
        if (file) {
          const filePath = path.join(uploadDir, file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          await File.findByIdAndDelete(clubData.image);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }
    throw new Error(`Error creating club: ${error.message}`);
  }
};

// Fetch all clubs followed by a user
exports.fetchClubsByUserId = async (userId) => {
  const follows = await ClubFollow.find({ user_id: userId }).populate("club_id");
  return follows.map((follow) => follow.club_id);
};

// Check if user follows a club
exports.checkClubFollow = async (userId, clubId) => {
  return await ClubFollow.exists({ user_id: userId, club_id: clubId });
};

// Check if user follows a board
exports.checkBoardFollow = async (userId, boardId) => {
  return await BoardFollow.exists({ user_id: userId, board_id: boardId });
};

// Unfollow a club by user_id and club_id
exports.unfollowClub = async (userId, clubId) => {
  return await ClubFollow.findOneAndDelete({
    user_id: userId,
    club_id: clubId,
  });
};

// Follow a club by user_id and club_id
// Follow a club by user_id and club_id
exports.followClub = async (userId, clubId) => {
  const existingFollow = await ClubFollow.findOne({ user_id: userId, club_id: clubId });
  if (existingFollow) {
    return existingFollow;
  }
  
  const follow = new ClubFollow({ 
    user_id: userId, 
    club_id: clubId
    // timestamp will be automatically added by the default value
  });
  return await follow.save();
};

// Follow a board by user_id and board_id
exports.followBoard = async (userId, boardId) => {
  const existingFollow = await BoardFollow.findOne({ user_id: userId, board_id: boardId });
  if (existingFollow) {
    return existingFollow;
  }
  
  const follow = new BoardFollow({ 
    user_id: userId, 
    board_id: boardId
    // timestamp will be automatically added by the default value
  });
  return await follow.save();
};

// Unfollow a board by user_id and board_id
exports.unfollowBoard = async (userId, boardId) => {
  return await BoardFollow.findOneAndDelete({
    user_id: userId,
    board_id: boardId,
  });
};