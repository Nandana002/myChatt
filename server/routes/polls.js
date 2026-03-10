const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Poll = require('../models/Poll');


router.post('/', protect, async (req, res) => {
    try {
        const { room, question, options, expiresAt, allowMultipleVotes } = req.body;

        if (!options || options.length < 2) {
            return res.status(400).json({ message: 'Poll must have at least 2 options' });
        }

        const formattedOptions = options.map(opt => ({
            text: opt,
            votes: []
        }));

        const poll = await Poll.create({
            creator: req.user._id,
            room: room || 'Global',
            question,
            options: formattedOptions,
            expiresAt: expiresAt || null,
            allowMultipleVotes: allowMultipleVotes || false
        });

        const populated = await Poll.findById(poll._id).populate('creator', 'username avatar');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/polls/:id/vote
// @desc    Vote on a poll
// @access  Private
router.post('/:id/vote', protect, async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        if (poll.expiresAt && new Date() > poll.expiresAt) {
            return res.status(400).json({ message: 'Poll has expired' });
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ message: 'Invalid option' });
        }

        // Check if user already voted
        const hasVoted = poll.options.some(opt =>
            opt.votes.some(v => v.user.toString() === req.user._id.toString())
        );

        if (hasVoted && !poll.allowMultipleVotes) {
            // Remove previous vote
            poll.options.forEach(opt => {
                opt.votes = opt.votes.filter(v => v.user.toString() !== req.user._id.toString());
            });
        }

        // Add new vote
        poll.options[optionIndex].votes.push({ user: req.user._id });
        await poll.save();

        const populated = await Poll.findById(poll._id)
            .populate('creator', 'username avatar')
            .populate('options.votes.user', 'username avatar');

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/polls/:room
// @desc    Get polls for a room
// @access  Private
router.get('/room/:room', protect, async (req, res) => {
    try {
        const polls = await Poll.find({ room: req.params.room })
            .populate('creator', 'username avatar')
            .populate('options.votes.user', 'username avatar')
            .sort({ createdAt: -1 });

        res.json(polls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
