const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  files: [{ type: String, ref: 'File' }],
  created_at: { type: Date, default: Date.now },
  created_by: { type: String, ref: 'User' },
  club_id: { type: String, ref: 'Clubs' },
  board_id: { type: String, ref: 'Boards' },

  reactions: [
    {
      user_id: { type: String, ref: 'User' },
      emoji: { type: String, enum: ['👍', '❤️', '😂', '🔥', '😢', '👏'] } 
    }
  ],

  votes: [
    {
      user_id: { type: String, ref: 'User' },
      vote: { type: Number, enum: [1, -1] } 
    }
  ]
});

module.exports = mongoose.model('Posts', postsSchema);

