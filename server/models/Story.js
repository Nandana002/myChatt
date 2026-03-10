const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    backgroundColor: {
        type: String,
        default: '#000000'
    },
    views: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) 
    }
}, {
    timestamps: true
});

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);
