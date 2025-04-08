const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  resource_link: { type: String, required: true },
  club_id: { type: String},
  event_id: { type: String },
  board_id: { type: String},
  user_id: { type: String, required: true, ref: 'User' },
  tags: { type: [String], default: [] },
  published_at: { type: Date, required: true },
});

module.exports = mongoose.model('Resource', resourceSchema);
