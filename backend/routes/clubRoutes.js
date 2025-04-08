const express = require('express');
const clubController = require('../controllers/clubController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const multer = require("multer");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes
router.get('/clubs', clubController.fetchAllClubs);
router.get('/clubs/board/:board_id', clubController.fetchClubsByBoardId);
router.get('/clubs/:club_id', clubController.fetchClubById);
router.get('/users/:user_id/clubs', clubController.fetchClubsByUserId);
router.get('/users/:user_id/follows/club/:club_id', clubController.checkClubFollow);
router.get('/users/:user_id/follows/board/:board_id', clubController.checkBoardFollow);

// Protected routes
router.post('/clubs', upload.single('image'), clubController.createClub);
router.put('/clubs/:club_id', upload.single('image'), clubController.editClub);
router.delete('/clubs/:club_id', clubController.deleteClub);
router.post('/users/:user_id/follow/club/:club_id', clubController.followClub);
router.delete('/users/:user_id/unfollow/club/:club_id', clubController.unfollowClub);
router.post('/users/:user_id/follow/board/:board_id', clubController.followBoard);
router.delete('/users/:user_id/unfollow/board/:board_id', clubController.unfollowBoard);

module.exports = router;