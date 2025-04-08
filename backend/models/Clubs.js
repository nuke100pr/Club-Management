const mongoose = require('mongoose');

const clubsSchema = new mongoose.Schema({
  board_id: { type: String, required: true, ref: 'Boards' },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, ref: 'File' },
  created_at: { type: Date, required: false, default: Date.now },
  created_by: { type: String, required: false, ref: 'User' },
  social_media: {
    instagram: { type: String, required: false },
    twitter: { type: String, required: false },
    whatsapp: { type: String, required: false },
    facebook: { type: String, required: false },
    linkedin: { type: String, required: false },
    youtube: { type: String, required: false }
  }
});

module.exports = mongoose.model('Clubs', clubsSchema);
