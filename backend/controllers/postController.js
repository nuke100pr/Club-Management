const postService = require('../services/postService');
const Posts = require('../models/Posts');

const createPost = async (req, res) => {

  try {
    const { title, content, club_id, board_id ,user_id} = req.body;

    const files = req.files || [];


    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const newPost = await postService.createPost(title, content, files, user_id, club_id, board_id);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, club_id, board_id } = req.query;
    
    // Build query based on provided filters
    const query = {};
    if (club_id) query.club_id = club_id;
    if (board_id) query.board_id = board_id;
    
    const result = await postService.getPosts(query, parseInt(page), parseInt(limit));
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    if (error.message === 'Post not found') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};


const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    
    const result = await postService.deletePost(id, user_id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

const addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji, user_id } = req.body;
    
    if (!emoji || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Emoji and user_id are required',
        required_fields: ['emoji', 'user_id']
      });
    }
    
    const result = await postService.addReaction(id, user_id, emoji);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (error.message === 'You have already reacted with this emoji') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message
    });
  }
};

const removeReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }
    
    const result = await postService.removeReaction(id, user_id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (error.message === 'No reaction found to remove') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: error.message
    });
  }
};

const addVote = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote, user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }
    
    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({
        success: false,
        message: 'Vote must be 1 (upvote) or -1 (downvote)'
      });
    }
    
    const result = await postService.addVote(id, user_id, vote);
    const value = await postService.getVotes(id);
    
    res.status(200).json({
      success: true,
      data: value
    });
  } catch (error) {
    console.error('Error adding vote:', error);
    
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add vote',
      error: error.message
    });
  }
};

const removeVote = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }
    
    const result = await postService.removeVote(id, user_id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error removing vote:', error);
    
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (error.message === 'No vote found to remove') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to remove vote',
      error: error.message
    });
  }
};

const getReactions = async (req, res) => {
  try {
    const { id } = req.params;
    const reactions = await postService.getReactions(id);
    
    res.status(200).json({
      success: true,
      data: reactions
    });
  } catch (error) {
    console.error('Error getting reactions:', error);
    
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get reactions',
      error: error.message
    });
  }
};

const getVotes = async (req, res) => {
  try {
    const { id } = req.params;
    const votes = await postService.getVotes(id);
    
    res.status(200).json({
      success: true,
      data: votes
    });
  } catch (error) {
    console.error('Error getting votes:', error);
    
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get votes',
      error: error.message
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, club_id, board_id, user_id } = req.body;
    const files = req.files || [];

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const updatedPost = await postService.updatePost(
      id,
      title,
      content,
      files,
      user_id,
      club_id,
      board_id
    );
    
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    
    if (error.message === 'Post not found') {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Failed to update post' });
  }
};

// Add this to the exports at the bottom
module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  addReaction,
  removeReaction,
  addVote,
  removeVote,
  getReactions,
  getVotes,
  updatePost // Add this line
};

