const express = require('express');
const postController = require('../controllers/postController');
const multer = require('multer');


const router = express.Router();

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Create post
router.post('/posts', upload.array('files', 10), postController.createPost);

// Update post
router.put('/posts/:id', upload.array('files', 10), postController.updatePost);

// Get all posts (with filtering options)
router.get('/posts', postController.getPosts);

// Get single post by ID
router.get('/posts/:id', postController.getPostById);



// Delete a post
router.delete('/posts/:id',  postController.deletePost);

router.post('/api/posts/:id/reactions', postController.addReaction);
router.delete('/api/posts/:id/reactions', postController.removeReaction);
router.get('/api/posts/:id/reactions', postController.getReactions);

// Vote routes
router.post('/api/posts/:id/votes', postController.addVote);
router.delete('/api/posts/:id/votes', postController.removeVote);
router.get('/api/posts/:id/votes', postController.getVotes);

module.exports = router;