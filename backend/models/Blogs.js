const mongoose = require('mongoose');

const blogsSchema = new mongoose.Schema({
  title: { type: String, required: false },
  introduction: { type: String, required: false },
  main_content: { type: String, required: false },
  conclusion: { type: String, required: false },
  author_info: { type: String, required: false },
  published_at: { type: Date, required: false },
  published_by: { type: String, required: false, ref: 'User' },
  tags: { type: [String], default: [] },
  image: { type: String, ref: 'File', required: false },
  number_of_views: { type: String, required: false, default: "0" },
  club_id: { type: String, required: false, ref: 'Clubs' },
  board_id: { type: String, required: false, ref: 'Boards' },
});

module.exports = mongoose.model('Blogs', blogsSchema);
