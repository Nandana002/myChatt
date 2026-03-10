const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: String,
        default: 'Global'
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: [{
        text: {
            type: String,
            required: true
        },
        votes: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            votedAt: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    expiresAt: {
        type: Date,
        default: null
    },
    allowMultipleVotes: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Poll', pollSchema);
