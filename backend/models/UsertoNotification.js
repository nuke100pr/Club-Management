const mongoose = require('mongoose');

const UsertoNotificationSchema = new mongoose.Schema({
  user_id: { type: String, required: true, ref: 'User' },
  notification_id: { type: String, required: true, ref: 'Notification' },
  status: { type: String, enum: ['read', 'not_read'], required: true }
});

module.exports = mongoose.model('UsertoNotification',UsertoNotificationSchema );