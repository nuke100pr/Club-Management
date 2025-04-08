const mongoose = require('mongoose');

const eventCoordinatorsSchema = new mongoose.Schema({
  event_id: { type: String, required: true, ref: 'Event' },
  user_id: { type: String, required: true, ref: 'User' }
});

module.exports = mongoose.model('EventCoordinators', eventCoordinatorsSchema);
