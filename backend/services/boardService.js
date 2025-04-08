const Board = require("../models/Boards");
const Club = require("../models/Clubs");
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

class BoardService {
  // Fetch all boards with follow status for a user
  async fetchAllBoards(userId = null) {
    const boards = await Board.find({}).populate('image');
    
    if (!userId) {
      return boards.map(board => ({
        ...board.toObject(),
        isFollowing: false
      }));
    }

    const userFollows = await BoardFollow.find({ user_id: userId });
    const followedBoardIds = userFollows.map(follow => follow.board_id.toString());

    return boards.map(board => ({
      ...board.toObject(),
      isFollowing: followedBoardIds.includes(board._id.toString())
    }));
  }

  // Fetch board by ID with follow status
  async fetchBoardById(boardId, userId = null) {
    const board = await Board.findById(boardId);
    if (!board) return null;

    if (!userId) {
      return {
        ...board.toObject(),
        isFollowing: false
      };
    }

    const follow = await BoardFollow.findOne({
      board_id: boardId,
      user_id: userId
    });

    return {
      ...board.toObject(),
      isFollowing: !!follow
    };
  }

  // Fetch all clubs under a board
  async fetchClubsByBoardId(boardId) {
    return await Club.find({ board_id: boardId });
  }

  // Delete board and all clubs under it
  async deleteBoard(boardId) {
    const board = await Board.findById(boardId);
    if (!board) {
      throw new Error("Board not found");
    }
    
    if (board.image) {
      const file = await File.findById(board.image);
      if (file) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        await File.findByIdAndDelete(board.image);
      }
    }
    
    await Club.deleteMany({ board_id: boardId });
    await BoardFollow.deleteMany({ board_id: boardId });
    return await Board.findByIdAndDelete(boardId);
  }

  // Edit board details by board ID
  async editBoardById(boardId, updateData, imageFile) {
    const board = await Board.findById(boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    if (imageFile) {
      if (board.image) {
        const oldFile = await File.findById(board.image);
        if (oldFile) {
          if (fs.existsSync(oldFile.path)) {
            fs.unlinkSync(oldFile.path);
          }
          await File.findByIdAndDelete(board.image);
        }
      }
      
      const newImageId = await saveFile(imageFile);
      if (newImageId) {
        updateData.image = newImageId;
      }
    }

    return await Board.findByIdAndUpdate(
      boardId, 
      updateData, 
      { new: true }
    ).populate('image');
  }

  // Create a new board with optional image
  async createBoard(boardData, imageFile) {
    if (imageFile) {
      const imageId = await saveFile(imageFile);
      if (imageId) {
        boardData.image = imageId;
      }
    }

    const board = new Board(boardData);
    await board.save();
    return await Board.findById(board._id).populate('image');
  }

  // Fetch all boards followed by a user
  async fetchBoardsByUserId(userId) {
    const follows = await BoardFollow.find({ user_id: userId })
      .populate({
        path: "board_id",
        populate: {
          path: "image"
        }
      });
      
    return follows.map((follow) => ({
      ...follow.board_id.toObject(),
      isFollowing: true
    }));
  }

  // Unfollow a board by user_id and board_id
  async unfollowBoard(userId, boardId) {
    return await BoardFollow.findOneAndDelete({
      user_id: userId,
      board_id: boardId,
    });
  }

  // Follow a board by user_id and board_id
  async followBoard(userId, boardId) {
    const existingFollow = await BoardFollow.findOne({
      user_id: userId,
      board_id: boardId,
    });
    
    if (existingFollow) {
      return existingFollow;
    }
    
    const follow = new BoardFollow({ user_id: userId, board_id: boardId });
    return await follow.save();
  }
}

module.exports = new BoardService();