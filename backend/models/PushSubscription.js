// models/PushSubscription.js
const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  subscription: {
    endpoint: {
      type: String,
      required: true
    },
    expirationTime: {
      type: Number,
      default: null
    },
    keys: {
      p256dh: {
        type: String,
        required: true
      },
      auth: {
        type: String,
        required: true
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique combinations
pushSubscriptionSchema.index({ userId: 1, 'subscription.endpoint': 1 }, { unique: true });

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);
module.exports = PushSubscription;