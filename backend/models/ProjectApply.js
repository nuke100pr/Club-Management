const mongoose = require('mongoose');

const projectApplySchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  project_id: {
    type: String,
    required: true,
    ref: 'Project'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProjectApply', projectApplySchema);