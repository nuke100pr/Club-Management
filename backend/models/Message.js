
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema for poll options
const PollOptionSchema = new Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }
});

// Sub-schema for polls
const PollSchema = new Schema({
  question: { type: String, required: true },
  options: [PollOptionSchema],
  type: { type: String, enum: ['single', 'multi'], default: 'single' },
  totalVotes: { type: Number, default: 0 },
  userVotes: [{ type: Schema.Types.Mixed }]
});

// Main message schema
const MessageSchema = new Schema({
  forum_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Forum', 
    required: true,
    index: true 
  },
  user_id: { 
    type: Schema.Types.ObjectId, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['message', 'poll'], 
    default: 'message' 
  },
  text: { 
    type: String 
  },
  file: {
    originalName: String,
    filename: String,
    mimetype: String,
    path: String,
    size: Number
  },
  audio: {
    originalName: String,
    filename: String,
    mimetype: String,
    path: String,
    size: Number
  },
  poll: PollSchema,
  parent_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Message', 
    default: null 
  },
  replies: [{
    type: Object,
    ref: 'Message'
  }],
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Create indexes
MessageSchema.index({ forum_id: 1, created_at: -1 });
MessageSchema.index({ parent_id: 1 });

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;