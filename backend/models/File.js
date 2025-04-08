const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  fileType: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true }
});

module.exports = mongoose.model('File', fileSchema);
