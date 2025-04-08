const mongoose = require('mongoose');

const projectMembersSchema = new mongoose.Schema({
  project_id: { type: String, required: true, ref: 'Project' },
  user_id: { type: String, required: true, ref: 'User' },
  added_on: { type: String, required: true }
});

module.exports = mongoose.model('ProjectMembers', projectMembersSchema);
