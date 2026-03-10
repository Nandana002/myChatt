const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    room: {
        type: String,
        default: 'Global'
    },
    text: {
        type: String,
        trim: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'file', 'gif', 'sticker', 'poll'],
        default: 'text'
    },
    mediaUrl: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    readAt: {
        type: Date,
        default: null
    },
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});


messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
