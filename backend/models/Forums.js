const mongoose = require('mongoose');

const forumsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, ref: 'File' },
  description: { type: String, required: true },
  number_of_views: { type: String, required: true, default: "0" },
  number_of_replies: { type: String, required: true, default: "0" },  
  event_id: { type: String, ref: 'Event' },
  club_id: { type: String, ref: 'Clubs' },
  board_id: { type: String, ref: 'Boards' },
  user_id: { type: String, required: true, ref: 'User' },
  public_or_private: { type: String, required: true },
  tags: { type: [String], default: [] },
  members:{type : [String],default:[]},
  banned_members:{type:[String],default:[]}
});

module.exports = mongoose.model('Forums', forumsSchema);
