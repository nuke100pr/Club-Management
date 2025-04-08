const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type : {type: String, required: true},
  link_id: { type: String, required: true, ref: 'NotificationLink' },
});

module.exports = mongoose.model('Notification', notificationSchema);
