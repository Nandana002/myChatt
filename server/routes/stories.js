const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Story = require('../models/Story');

// @route   POST /api/stories
// @desc    Create a new story
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { type, content, backgroundColor } = req.body;

        const story = await Story.create({
            user: req.user._id,
            type,
            content,
            backgroundColor: backgroundColor || '#000000'
        });

        const populated = await Story.findById(story._id).populate('user', 'username avatar');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/stories
// @desc    Get all active stories
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const stories = await Story.find({
            expiresAt: { $gt: new Date() }
        })
            .populate('user', 'username avatar')
            .populate('views.user', 'username avatar')
            .sort({ createdAt: -1 });

        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/stories/:id/view
// @desc    Mark story as viewed
// @access  Private
router.post('/:id/view', protect, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Check if already viewed
        const alreadyViewed = story.views.some(
            v => v.user.toString() === req.user._id.toString()
        );

        if (!alreadyViewed) {
            story.views.push({ user: req.user._id });
            await story.save();
        }

        const populated = await Story.findById(story._id)
            .populate('user', 'username avatar')
            .populate('views.user', 'username avatar');

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/stories/:id
// @desc    Delete a story
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        if (story.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await story.deleteOne();
        res.json({ message: 'Story deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
