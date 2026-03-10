const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

router.post('/register', [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, avatar } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }


        const user = await User.create({
            username,
            email,
            password,
            avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random&size=128`
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                theme: user.theme,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            user.status = 'online';
            user.lastSeen = new Date();
            await user.save();

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                theme: user.theme,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/guest-join
// @desc    Join as a guest with just username/avatar (creates/updates user and returns token)
// @access  Public
router.post('/guest-join', [
    body('username').trim().isLength({ min: 2, max: 30 }).withMessage('Username must be 2-30 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, avatar } = req.body;

    try {
        // Find existing user by name
        let user = await User.findOne({ username });

        if (!user) {
            // Create user for guest
            user = await User.create({
                username,
                email: `${username}_guest_${Date.now()}@temp.local`,
                password: 'guest_password_12345',
                avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random&size=128`
            });
        } else {
            // Update avatar if provided
            if (avatar) {
                user.avatar = avatar;
                await user.save();
            }
        }

        res.json({
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            theme: user.theme,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
