const mongoose = require('mongoose');

const refereeInviteSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
    },

    refereeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Referee',
        required: true,
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },

    inveitedAt: {
        type: Date,
    },

    responsedAt: {
        type: Date,
    }
});

const RefereeInviteSchema = mongoose.model('RefereeInviteSchema', refereeInviteSchema);

module.exports = RefereeInviteSchema;