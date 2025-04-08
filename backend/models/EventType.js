const mongoose = require('mongoose');

const eventTypeSchema = new mongoose.Schema({
  content: { type: String, required: true }
});

module.exports = mongoose.model('EventType', eventTypeSchema);
