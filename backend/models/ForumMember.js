const mongoose = require("mongoose");

const forumMemberSchema = new mongoose.Schema({
  user_id: { type: String, required: true, ref: "User" },
  forum_id: { type: String, required: true, ref: "Forums" },
  joined_at: {
    type: String,
    required: false,
    default: () => new Date().toISOString(), // Automatically set to current ISO timestamp
  },
});
module.exports = mongoose.model("ForumMember", forumMemberSchema);
