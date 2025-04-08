const boardService = require('../services/boardService');

class BoardController {
  // Fetch all boards
  async fetchAllBoards(req, res) {
    try {
      const userId = req.query.user_id || null;
      const boards = await boardService.fetchAllBoards(userId);
      res.status(200).json(boards);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Fetch board by board ID
  async fetchBoardById(req, res) {
    try {
      const { board_id } = req.params;
      const userId = req.query.user_id || null;
      const board = await boardService.fetchBoardById(board_id, userId);
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }
      res.status(200).json(board);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Fetch all clubs under a board
  async fetchClubsByBoardId(req, res) {
    try {
      const { board_id } = req.params;
      const clubs = await boardService.fetchClubsByBoardId(board_id);
      res.status(200).json(clubs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete board and all clubs under it
  async deleteBoard(req, res) {
    try {
      const { board_id } = req.params;
      await boardService.deleteBoard(board_id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Edit board details by board ID
  async editBoard(req, res) {
    try {
      const { board_id } = req.params;
      const updateData = req.body;
      const imageFile = req.file;
      
      const updatedBoard = await boardService.editBoardById(
        board_id, 
        updateData, 
        imageFile
      );
      
      if (!updatedBoard) {
        return res.status(404).json({ error: 'Board not found' });
      }
      
      res.status(200).json(updatedBoard);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create a new board
  async createBoard(req, res) {
    try {
      const boardData = req.body;
      const imageFile = req.file;
      
      const newBoard = await boardService.createBoard(boardData, imageFile);
      res.status(201).json(newBoard);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Fetch all boards followed by a user
  async fetchBoardsByUserId(req, res) {
    try {
      const { user_id } = req.params;
      const boards = await boardService.fetchBoardsByUserId(user_id);
      res.status(200).json(boards);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Unfollow a board by user_id and board_id
  async unfollowBoard(req, res) {
    try {
      const { user_id, board_id } = req.params;
      await boardService.unfollowBoard(user_id, board_id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Follow a board by user_id and board_id
  async followBoard(req, res) {
    try {
      const { user_id, board_id } = req.params;
      const follow = await boardService.followBoard(user_id, board_id);
      res.status(201).json(follow);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new BoardController();