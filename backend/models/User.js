const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email_id: { type: String, required: true, unique: true },
  password: { type: String, required: false, default: "password" },
  registered_at: { type: String, required: false },
  department: { type: String, required: false },  
  status: { type: String, required: true, enum: ["active", "banned"], default: "active" },
  userRole: { 
    type: String, 
    required: true, 
    enum: ["member", "super_admin", "board_admin", "club_admin"], 
    default: "member" 
  },
  club_id: { type: String, required: false },
  board_id: { type: String, required: false },
});

module.exports = mongoose.model('User', userSchema);

