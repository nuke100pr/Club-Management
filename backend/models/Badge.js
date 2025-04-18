const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  user_id: { type: String, required: true, ref: 'User' },
  given_on: { type: Date, required: true },
  club_id: { type: String, ref: 'Clubs',required:false },
  board_id: { type: String, ref: 'Boards',required:false },
  badge_type_id: { type: String, required: true, ref: 'BadgeType' }
});

module.exports = mongoose.model('Badge', badgeSchema);
