const mongoose = require('mongoose');

const porSchema = new mongoose.Schema({
  privilegeTypeId : { type: String, ref: 'PrivilegeType',required:true }, 
  club_id: { type: String, ref: 'Clubs',required:false },
  board_id: { type: String, ref: 'Boards',required:false },
  user_id: { type: String, required: true, ref: 'User' },
  start_date: { type: Date, required: false },
  end_date:{ type: Date, required: false },
});

module.exports = mongoose.model('Por', porSchema);
