const mongoose = require('mongoose');

const opportunitiesSchema = new mongoose.Schema({
    title: { type: String, required: false },
    description: { type: String, required: false },
    creator_id: { type: String, required: false, ref: 'User' },
    expiry_date: { type: Date, required: false },
    status: { type: String, enum: ['active', 'inactive'], required: false },
    external_link: { type: String, required: false },
    start_date: { type: String, required: false },
    end_date: { type: String, required: false },
    board_id: { type: String, ref: 'Boards', required: false },
    club_id: { type: String, ref: 'Clubs', required: false },
    event_id: { type: String, ref: 'Event', required: false },
    tags: { type: [String], default: [], required: false },
    created_at: { type: Date, required: false },
    updated_at: { type: Date, required: false },
    image: { type: String, ref: 'File', required: false }
});

module.exports = mongoose.model('Opportunities', opportunitiesSchema);
