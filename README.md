# Lumix Chat - Premium Private Messaging Experience

A full-stack, feature-rich private chat application with MongoDB persistence, JWT authentication, real-time stories, profile customization, and a premium glassmorphic UI.

## 🚀 Features

### Core Messaging
- ✅ **Private Real-time Messaging** - Secure 1-to-1 chats using Socket.IO.
- ✅ **MongoDB Persistence** - Full message history is saved and never lost.
- ✅ **JWT Authentication** - Secure user sessions with token-based authorization.
- ✅ **Message Status System** - Real-time tracking of message delivery.
- ✅ **Typing Indicators** - See when your partner is typing in real-time.
- ✅ **Online Presence** - Live status tracking (Online/Offline) for all users.
- ✅ **Notifications** - Optional audio "ping" for incoming messages (toggleable).

### Premium UI & Customization
- ✅ **Glassmorphic Design** - Modern, frosted-glass interface with smooth animations.
- ✅ **Profile Editing** - Update your display name and upload a custom avatar anytime.
- ✅ **Wallpaper Gallery** - Change chat backgrounds with curated themes (Dark Mesh, Midnight, Forest, etc.).
- ✅ **Image Support** - Send images in chat with automatic scaling and box constraints.
- ✅ **Emoji Support** - Built-in emoji picker for expressive messaging.

### Social Features
- ✅ **Stories (Status)** - Upload text or image stories that appear in the sidebar (Instagram-style).
- ✅ **Story Viewer** - Full-screen story viewing with progress tracking and view counts.

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Socket.io-client, Axios.
- **Backend**: Node.js, Express, Socket.io, JWT (jsonwebtoken).
- **Database**: MongoDB (Mongoose ODM).
- **Styling**: Modern CSS with Glassmorphism and Tailwind utility classes.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (Running locally or MongoDB Atlas)
- **npm** or **yarn**

## 🔧 Installation & Setup

### 1. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lumixchat
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### 2. Frontend Setup
```bash
cd client
npm install
```

### 3. Running Locally
**Start Backend:**
```bash
cd server
npm run dev
```

**Start Frontend:**
```bash
cd client
npm run dev
```

## 📱 Usage

1. **Join Chat**: Enter your name and optionally upload an avatar on the login screen. This creates a secure "Guest" session with a valid JWT token.
2. **Start Conversation**: Select any online user from the sidebar to start a private chat.
3. **Customize**: 
   - Click your profile name at the bottom of the sidebar to **Edit Profile**.
   - Click the **Three Dots** in the chat header to change the **Wallpaper**.
   - Click the **Bell Icon** in the sidebar to enable/disable **Notification Sounds**.
4. **Share Stories**: Click the **(+) Add Story** circle at the top of the sidebar to share a status update.

## 📁 Project Structure

- `client/src/components/`:
  - `Chat.jsx`: Main application logic and socket management.
  - `Sidebar.jsx`: User list, search, and stories navigation.
  - `ChatWindow.jsx`: Message display with dynamic wallpaper support.
  - `Stories.jsx`: Full story creation and viewing logic.
  - `ProfileEdit.jsx`: Modal for updating user information.
  - `Login.jsx`: Secure entry point with guest authentication.
- `server/`:
  - `index.js`: Socket.io events and server initialization.
  - `routes/auth.js`: Handles secure guest join and token generation.
  - `routes/users.js`: Profile update and user management endpoints.
  - `routes/stories.js`: Story creation and retrieval logic.
  - `middleware/auth.js`: JWT protection for API endpoints.

## 📜 License
MIT License - Developed for private and community use.

---
**Built with ❤️ for a premium messaging experience.**
