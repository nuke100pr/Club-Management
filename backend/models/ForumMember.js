const mongoose = require('mongoose');

const forumMemberSchema = new mongoose.Schema({
  user_id: { type: String, required: true, ref: 'User' },
  forum_id: { type: String, required: true, ref: 'Forums' },
  joined_at: { type: String, required: true }
});

module.exports = mongoose.model('ForumMember', forumMemberSchema);
