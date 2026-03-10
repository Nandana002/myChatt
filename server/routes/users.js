const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/online
// @desc    Get all online users
// @access  Private
router.get('/online', protect, async (req, res) => {
    try {
        const users = await User.find({ status: 'online' })
            .select('-password -email')
            .sort({ lastSeen: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PATCH /api/users/theme
// @desc    Update user theme
// @access  Private
router.patch('/theme', protect, async (req, res) => {
    try {
        const { theme } = req.body;

        if (!['light', 'dark', 'blue', 'purple', 'custom'].includes(theme)) {
            return res.status(400).json({ message: 'Invalid theme' });
        }

        req.user.theme = theme;
        await req.user.save();

        res.json({ theme: req.user.theme });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PATCH /api/users/avatar
// @desc    Update user avatar
// @access  Private
router.patch('/avatar', protect, async (req, res) => {
    try {
        const { avatar } = req.body;
        req.user.avatar = avatar;
        await req.user.save();

        res.json({ avatar: req.user.avatar });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PATCH /api/users/profile
// @desc    Update user profile (username, avatar)
// @access  Private
router.patch('/profile', protect, async (req, res) => {
    try {
        const { username, avatar } = req.body;

        if (username) {
            // Check if username is already taken by someone else
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
            req.user.username = username;
        }

        if (avatar !== undefined) {
            req.user.avatar = avatar;
        }

        await req.user.save();

        res.json({
            id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
