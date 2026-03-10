const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   GET /api/messages/:chatId
// @desc    Get chat history (paginated)
// @access  Private
router.get('/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        let query;
        if (chatId === 'Global') {
            // Global room messages
            query = { room: 'Global' };
        } else {
            // Private messages between two users
            query = {
                $or: [
                    { sender: req.user._id, receiver: chatId },
                    { sender: chatId, receiver: req.user._id }
                ]
            };
        }

        const messages = await Message.find(query)
            .populate('sender', 'username avatar')
            .populate('receiver', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Message.countDocuments(query);

        res.json({
            messages: messages.reverse(), // Reverse to show oldest first
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalMessages: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { receiver, room, text, messageType, mediaUrl, replyTo } = req.body;

        const message = await Message.create({
            sender: req.user._id,
            receiver: receiver || null,
            room: room || 'Global',
            text,
            messageType: messageType || 'text',
            mediaUrl: mediaUrl || null,
            replyTo: replyTo || null,
            status: 'sent'
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username avatar')
            .populate('receiver', 'username avatar');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PATCH /api/messages/:id/status
// @desc    Update message status (delivered/read)
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.status = status;
        if (status === 'read') {
            message.readAt = new Date();
        }

        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/messages/:id/react
// @desc    Add/remove reaction to message
// @access  Private
router.post('/:id/react', protect, async (req, res) => {
    try {
        const { emoji } = req.body;
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
            r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
        );

        if (existingReaction) {
            // Remove reaction
            message.reactions = message.reactions.filter(
                r => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
            );
        } else {
            // Add reaction
            message.reactions.push({
                user: req.user._id,
                emoji
            });
        }

        await message.save();
        const populated = await Message.findById(message._id).populate('reactions.user', 'username avatar');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/messages/search
// @desc    Search messages
// @access  Private
router.get('/search/query', protect, async (req, res) => {
    try {
        const { q, chatId } = req.query;

        let query = {
            text: { $regex: q, $options: 'i' },
            deleted: false
        };

        if (chatId && chatId !== 'Global') {
            query.$or = [
                { sender: req.user._id, receiver: chatId },
                { sender: chatId, receiver: req.user._id }
            ];
        } else if (chatId === 'Global') {
            query.room = 'Global';
        }

        const messages = await Message.find(query)
            .populate('sender', 'username avatar')
            .populate('receiver', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
