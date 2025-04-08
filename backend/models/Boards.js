const mongoose = require('mongoose');

const boardsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, ref: 'File' },
  created_at: { type: Date, required: false, default: Date.now },
  created_by: { type: String, required: false, ref: 'User' },
  established_year: { type: String, required: false },
  social_media: {
    facebook: { type: String, required: false },
    instagram: { type: String, required: false },
    twitter: { type: String, required: false },
    linkedin: { type: String, required: false },
    youtube: { type: String, required: false },
    website: { type: String, required: false }
  }
});

module.exports = mongoose.model('Boards', boardsSchema);
