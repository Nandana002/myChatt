# Lumix Chat - Production-Ready Real-Time Chat Application

A full-stack, feature-rich chat application with MongoDB persistence, JWT authentication, message status tracking, reactions, stories, polls, and more.

## 🚀 Features

### Core Features
- ✅ **Real-time messaging** with Socket.IO
- ✅ **MongoDB persistence** - messages never lost
- ✅ **JWT Authentication** - secure user sessions
- ✅ **Message Status System** - Sent/Delivered/Read (WhatsApp-style ticks)
- ✅ **Private & Group Chat** - 1-to-1 and Global rooms
- ✅ **Message Reactions** - React with emojis
- ✅ **Typing Indicators** - See when others are typing
- ✅ **Online/Offline Status** - Real-time presence
- ✅ **Avatar Support** - Profile pictures
- ✅ **User Themes** - Light/Dark/Blue/Purple/Custom
- ✅ **Message Search** - Find messages quickly
- ✅ **Pagination** - Load chat history efficiently

### Advanced Features
- ✅ **Stories/Status** - 24-hour auto-delete stories
- ✅ **Polls** - Create and vote on polls in chat
- ✅ **GIF Support** - Send GIFs and stickers
- ✅ **File Upload** - Share images and files
- ✅ **Rate Limiting** - API protection
- ✅ **Security** - Helmet, input validation, bcrypt

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher) - Running locally or MongoDB Atlas
- **npm** or **yarn**

## 🛠️ Installation & Setup

### 1. Install MongoDB (if not already installed)

**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb

# Start MongoDB service:
net start MongoDB
```

**Alternative: Use MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string

### 2. Backend Setup

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create `.env` file in `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lumixchat
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/lumixchat
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### 4. Frontend Setup

```bash
cd ../client
npm install
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend Client

Open a **new terminal**:

```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

## 📱 Usage

### First Time Setup

1. **Register a new account**:
   - Open http://localhost:5173
   - Click "Register" (you'll need to add this to Login page or use API directly)
   - Or use the API:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

2. **Login**:
   - Enter your email and password
   - You'll receive a JWT token

3. **Start Chatting**:
   - Send messages in Global Chat
   - Click on users to start private chats
   - React to messages with emojis
   - Create polls and stories

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Messages
- `GET /api/messages/:chatId?page=1&limit=50` - Get chat history
- `POST /api/messages` - Send message
- `PATCH /api/messages/:id/status` - Update message status
- `POST /api/messages/:id/react` - Add/remove reaction
- `GET /api/messages/search/query?q=text&chatId=Global` - Search messages

### Users
- `GET /api/users/online` - Get online users
- `PATCH /api/users/theme` - Update theme
- `PATCH /api/users/avatar` - Update avatar
- `GET /api/users/:id` - Get user profile

### Stories
- `POST /api/stories` - Create story
- `GET /api/stories` - Get all active stories
- `POST /api/stories/:id/view` - Mark story as viewed
- `DELETE /api/stories/:id` - Delete story

### Polls
- `POST /api/polls` - Create poll
- `POST /api/polls/:id/vote` - Vote on poll
- `GET /api/polls/room/:room` - Get polls for room

## 🔌 Socket.IO Events

### Client → Server
- `joinRoom` - Join chat room
- `chatMessage` - Send message to room
- `privateMessage` - Send private message
- `markAsRead` - Mark message as read
- `addReaction` - Add reaction to message
- `typing` - User is typing
- `stopTyping` - User stopped typing

### Server → Client
- `message` - New message received
- `privateMessage` - New private message
- `messageStatusUpdate` - Message status changed
- `reactionUpdate` - Reaction added/removed
- `roomUsers` - Updated user list
- `typing` - Someone is typing
- `stopTyping` - Someone stopped typing

## 📁 Project Structure

```
mychatt/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Message.js            # Message schema
│   │   ├── Story.js              # Story schema
│   │   └── Poll.js               # Poll schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── messages.js           # Message routes
│   │   ├── users.js              # User routes
│   │   ├── stories.js            # Story routes
│   │   └── polls.js              # Poll routes
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── .env                      # Environment variables
│   ├── index.js                  # Main server file
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx         # Login/Register page
    │   │   ├── Chat.jsx          # Main chat interface
    │   │   ├── Sidebar.jsx       # User list sidebar
    │   │   ├── ChatWindow.jsx    # Message display
    │   │   ├── MessageBubble.jsx # Individual message
    │   │   └── MessageInput.jsx  # Message input bar
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt
- **Rate Limiting** - Prevent API abuse
- **Helmet** - Security headers
- **Input Validation** - express-validator
- **CORS** - Controlled cross-origin requests

## 🎨 Theming

Users can choose from 5 themes:
- **Dark** (default) - Premium dark green
- **Light** - Clean white interface
- **Blue** - Ocean blue theme
- **Purple** - Royal purple theme
- **Custom** - User-defined colors

## 📊 Database Schema

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  avatar: String (URL),
  theme: String (enum),
  status: String (online/offline/away),
  lastSeen: Date,
  socketId: String
}
```

### Message
```javascript
{
  sender: ObjectId (User),
  receiver: ObjectId (User) | null,
  room: String,
  text: String,
  messageType: String (text/image/gif/etc),
  mediaUrl: String,
  status: String (sent/delivered/read),
  readAt: Date,
  reactions: [{ user, emoji, createdAt }],
  replyTo: ObjectId (Message)
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running:
mongosh

# If not, start it:
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux
```

### Port Already in Use
```bash
# Change PORT in server/.env
PORT=5001
```

### CORS Errors
- Ensure both frontend and backend are running
- Check CORS configuration in server/index.js

## 📝 Next Steps / Future Enhancements

- [ ] Voice/Video calls
- [ ] End-to-end encryption
- [ ] Message forwarding
- [ ] Group admin controls
- [ ] Push notifications
- [ ] Desktop app (Electron)
- [ ] Mobile app (React Native)

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 👨‍💻 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using Node.js, Express, Socket.IO, React, MongoDB, and Tailwind CSS**
