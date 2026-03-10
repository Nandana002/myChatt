require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const User = require('./models/User');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"]
    },
    maxHttpBufferSize: 1e7 // 10MB limit for images/files over socket
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/polls', require('./routes/polls'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log(`✅ New connection: ${socket.id}`);

    // User joins with authentication
    socket.on('joinRoom', async ({ userId, username, room, avatar }) => {
        try {
            let userDbId = userId;

            // If no userId provided (non-authenticated), create/find temporary user
            if (!userId) {
                // Check if user exists by username
                let tempUser = await User.findOne({ username });

                if (!tempUser) {
                    // Create temporary user (for backward compatibility)
                    tempUser = await User.create({
                        username,
                        email: `${username}@temp.local`,
                        password: 'temp123456', // Will be hashed automatically
                        avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random`,
                        status: 'online',
                        socketId: socket.id
                    });
                } else {
                    // Update existing temp user
                    tempUser.status = 'online';
                    tempUser.socketId = socket.id;
                    tempUser.lastSeen = new Date();
                    if (avatar) tempUser.avatar = avatar;
                    await tempUser.save();
                }

                userDbId = tempUser._id;
            } else {
                // Authenticated user - update status
                await User.findByIdAndUpdate(userId, {
                    status: 'online',
                    socketId: socket.id,
                    lastSeen: new Date()
                });
            }

            socket.userId = userDbId;
            socket.username = username;
            socket.room = room || 'Global';
            socket.avatar = avatar;

            socket.join(socket.room);
            // Join a personal room based on userId for reliable delivery
            socket.join(userDbId.toString());

            // Provide user info back to the client
            socket.emit('user_info', {
                id: userDbId.toString(),
                username: socket.username,
                avatar: socket.avatar
            });

            // Send welcome message (no database save for system messages)
            socket.emit('message', {
                username: 'System',
                text: 'Welcome to Lumix Chat!',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                avatar: null
            });

            // Broadcast join notification
            socket.broadcast.to(socket.room).emit('message', {
                username: 'System',
                text: `${username} has joined the chat`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                avatar: null
            });

            // Send updated user list
            const onlineUsers = await User.find({ status: 'online' }).select('-password -email');

            // Map users to include 'id' field for frontend compatibility
            const mappedUsers = onlineUsers.map(u => ({
                id: u._id.toString(), // Use database ID consistently
                _id: u._id.toString(),
                username: u.username,
                avatar: u.avatar,
                status: u.status,
                lastSeen: u.lastSeen
            }));

            io.to(socket.room).emit('roomUsers', {
                room: socket.room,
                users: mappedUsers
            });

        } catch (error) {
            console.error('Join room error:', error);
        }
    });

    // Handle chat messages
    socket.on('chatMessage', async (msgData) => {
        try {
            // Support both old (string) and new (object) formats
            const text = typeof msgData === 'string' ? msgData : msgData.text;
            const image = typeof msgData === 'string' ? null : msgData.image;

            console.log(`📨 Message from ${socket.username}: "${text || '[Image]'}"`);

            // Save message to database
            const message = await Message.create({
                sender: socket.userId,
                room: socket.room,
                text: text || '',
                messageType: image ? 'image' : 'text',
                mediaUrl: image || null,
                status: 'sent'
            });

            const messageData = {
                _id: message._id.toString(),
                username: socket.username,
                text: text,
                image: image,
                avatar: socket.avatar,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'sent',
                reactions: []
            };

            console.log(`✅ Emitting message to room ${socket.room}:`, messageData);

            // Emit to room
            io.to(socket.room).emit('message', messageData);

            // Update status to delivered for online users
            setTimeout(async () => {
                message.status = 'delivered';
                await message.save();
                io.to(socket.room).emit('messageStatusUpdate', {
                    messageId: message._id,
                    status: 'delivered'
                });
            }, 100);

        } catch (error) {
            console.error('Chat message error:', error);
        }
    });

    // Handle private messages
    socket.on('privateMessage', async ({ to, msg, image }) => {
        try {
            console.log(`💬 Private message from ${socket.username} to ${to}`);
            if (image) console.log(`📸 Photo detected in private message (${Math.round(image.length / 1024)} KB)`);

            // Find receiver by database id
            const receiver = await User.findById(to);
            if (!receiver) {
                console.log(`❌ Receiver not found for id: ${to}`);
                return;
            }

            // Save to database
            const message = await Message.create({
                sender: socket.userId,
                receiver: receiver._id,
                text: msg || '',
                messageType: image ? 'image' : 'text',
                mediaUrl: image || null,
                status: 'sent'
            });

            const messageData = {
                _id: message._id.toString(),
                from: socket.username,
                fromId: socket.userId.toString(),
                avatar: socket.avatar,
                text: msg,
                image: image,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'sent'
            };

            console.log(`✅ Sending private message to ${receiver.username} (${image ? 'WITH photo' : 'text only'})`);

            // Send to recipient's personal room
            io.to(to).emit('privateMessage', messageData);

            // Also update status to delivered since we sent it
            message.status = 'delivered';
            await message.save();

        } catch (error) {
            console.error('Private message error:', error);
        }
    });

    // Mark message as read
    socket.on('markAsRead', async ({ messageId }) => {
        try {
            const message = await Message.findByIdAndUpdate(
                messageId,
                { status: 'read', readAt: new Date() },
                { new: true }
            );

            if (message) {
                // Notify sender
                const sender = await User.findById(message.sender);
                if (sender && sender.socketId) {
                    io.to(sender.socketId).emit('messageStatusUpdate', {
                        messageId: message._id,
                        status: 'read',
                        readAt: message.readAt
                    });
                }
            }
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    });

    // Handle reactions
    socket.on('addReaction', async ({ messageId, emoji }) => {
        try {
            const message = await Message.findById(messageId);
            if (!message) return;

            // Toggle reaction
            const existingIndex = message.reactions.findIndex(
                r => r.user.toString() === socket.userId && r.emoji === emoji
            );

            if (existingIndex > -1) {
                message.reactions.splice(existingIndex, 1);
            } else {
                message.reactions.push({ user: socket.userId, emoji });
            }

            await message.save();

            // Broadcast reaction update
            const targetRoom = message.room || 'private';
            if (targetRoom !== 'private') {
                io.to(targetRoom).emit('reactionUpdate', {
                    messageId: message._id,
                    reactions: message.reactions
                });
            } else {
                // For private messages, send to both users
                const receiver = await User.findById(message.receiver);
                if (receiver && receiver.socketId) {
                    io.to(receiver.socketId).emit('reactionUpdate', {
                        messageId: message._id,
                        reactions: message.reactions
                    });
                }
                socket.emit('reactionUpdate', {
                    messageId: message._id,
                    reactions: message.reactions
                });
            }
        } catch (error) {
            console.error('Reaction error:', error);
        }
    });

    // Typing indicators
    socket.on('typing', () => {
        socket.broadcast.to(socket.room).emit('typing', socket.username);
    });

    socket.on('stopTyping', () => {
        socket.broadcast.to(socket.room).emit('stopTyping', socket.username);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
        try {
            console.log(`❌ User disconnected: ${socket.id}`);

            if (socket.userId) {
                // Update user status
                await User.findByIdAndUpdate(socket.userId, {
                    status: 'offline',
                    lastSeen: new Date(),
                    socketId: null
                });

                // Broadcast leave message
                if (socket.room) {
                    socket.broadcast.to(socket.room).emit('message', {
                        username: 'System',
                        text: `${socket.username} has left the chat`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        avatar: null
                    });

                    // Update user list
                    const onlineUsers = await User.find({ status: 'online' }).select('-password -email');
                    const mappedUsers = onlineUsers.map(u => ({
                        id: u._id.toString(),
                        _id: u._id.toString(),
                        username: u.username,
                        avatar: u.avatar,
                        status: u.status,
                        lastSeen: u.lastSeen
                    }));

                    io.to(socket.room).emit('roomUsers', {
                        room: socket.room,
                        users: mappedUsers
                    });
                }
            }
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
