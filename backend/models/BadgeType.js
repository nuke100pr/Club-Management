const mongoose = require('mongoose');

const badgeTypeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  emoji: { type: String, required: true }
});

module.exports = mongoose.model('BadgeType', badgeTypeSchema);
