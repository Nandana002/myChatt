import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import ProfileEdit from './ProfileEdit';
import { Menu, MoreVertical, LogOut, Palette, Image as ImageIcon } from 'lucide-react';
import { messagesAPI } from '../services/api';

const ENDPOINT = 'http://localhost:5000'; // Dev URL

const Chat = ({ user, onLogout }) => {
    const [socket, setSocket] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [messages, setMessages] = useState({});
    const [currentUser, setCurrentUser] = useState({ username: user.username, id: '', avatar: user.avatar });
    const [typingUsers, setTypingUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [wallpaper, setWallpaper] = useState(localStorage.getItem('chatWallpaper') || null);
    const [soundsEnabled, setSoundsEnabled] = useState(localStorage.getItem('chatSounds') === 'true');

    const notifySound = new Audio('https://raw.githubusercontent.com/Nandana002/myChatt/main/client/public/notify.mp3'); // Fallback to a common public link if possible or standard ping

    const playNotifySound = () => {
        if (soundsEnabled) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'); // Short ping
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    };

    const wallpapers = [
        { name: 'Dark Mesh', value: "linear-gradient(rgba(10, 10, 10, 0.95), rgba(10, 10, 10, 0.95)), url('https://www.transparenttextures.com/patterns/dark-matter.png')" },
        { name: 'Midnight Blue', value: 'linear-gradient(to bottom, #0f172a, #020617)' },
        { name: 'Forest Glow', value: 'linear-gradient(to bottom, #064e3b, #022c22)' },
        { name: 'Purple Haze', value: 'linear-gradient(to bottom, #4c1d95, #1e1b4b)' },
        { name: 'Crimson Night', value: 'linear-gradient(to bottom, #7f1d1d, #450a0a)' },
        { name: 'Deep Space', value: 'linear-gradient(to bottom, #171717, #000000)' },
    ];

    const changeWallpaper = (val) => {
        setWallpaper(val);
        localStorage.setItem('chatWallpaper', val);
        setIsMenuOpen(false);
    };

    const toggleSounds = () => {
        const newVal = !soundsEnabled;
        setSoundsEnabled(newVal);
        localStorage.setItem('chatSounds', newVal);
    };

    // Initialize Socket
    useEffect(() => {
        const newSocket = io(ENDPOINT);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            // Join with initial user data
            newSocket.emit('joinRoom', { username: user.username, room: 'Global', avatar: user.avatar });
        });

        // Listen for persistent user info from server
        newSocket.on('user_info', (userInfo) => {
            setCurrentUser(userInfo);
        });

        return () => newSocket.close();
    }, [user]);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('roomUsers', ({ users }) => {
            setActiveUsers(users);
        });

        socket.on('message', (message) => {
            console.log('📩 Global message ignored on client:', message);
        });

        socket.on('privateMessage', ({ from, fromId, avatar, text, image, time }) => {
            const message = { username: from, text, image, time, avatar };

            setMessages((prev) => {
                const newMessages = { ...prev };
                const chatId = fromId; // Now consistently the database userId
                if (!newMessages[chatId]) newMessages[chatId] = [];
                newMessages[chatId] = [...newMessages[chatId], message];
                return newMessages;
            });

            if (activeChat !== fromId) {
                setUnreadCounts(prev => ({ ...prev, [fromId]: (prev[fromId] || 0) + 1 }));
            }

            playNotifySound();
        });

        socket.on('typing', (username) => {
            setTypingUsers(prev => !prev.includes(username) ? [...prev, username] : prev);
        });

        socket.on('stopTyping', (username) => {
            setTypingUsers(prev => prev.filter(u => u !== username));
        });

        return () => {
            socket.off('roomUsers');
            socket.off('message');
            socket.off('privateMessage');
            socket.off('typing');
            socket.off('stopTyping');
            socket.off('user_info');
        };
    }, [socket, activeChat]);

    // Fetch Chat History
    useEffect(() => {
        const fetchHistory = async () => {
            if (!activeChat) return;

            setLoadingHistory(true);
            try {
                const data = await messagesAPI.getHistory(activeChat);

                // Map database messages to UI format
                const formattedMessages = data.messages.map(m => ({
                    _id: m._id,
                    username: m.sender.username,
                    text: m.text,
                    image: m.mediaUrl, // Map DB mediaUrl to image
                    avatar: m.sender.avatar,
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isHistory: true
                }));

                setMessages(prev => ({
                    ...prev,
                    [activeChat]: formattedMessages
                }));
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [activeChat]);

    // Handle Sending Message
    const sendMessage = (messageData) => {
        if (!socket || !activeChat) return;

        const { text, image } = messageData;

        const recipient = activeUsers.find(u => u.id === activeChat);
        if (recipient) {
            socket.emit('privateMessage', { to: activeChat, msg: text, image });

            const myMsg = {
                username: user.username,
                text: text,
                image: image,
                avatar: user.avatar,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => {
                const newMessages = { ...prev };
                if (!newMessages[activeChat]) newMessages[activeChat] = [];
                newMessages[activeChat] = [...newMessages[activeChat], myMsg];
                return newMessages;
            });
        }
    };

    const handleTyping = () => {
        // Typing events placeholder
    };

    const handleStopTyping = () => {
        // Typing events placeholder
    };

    const handleChatSelect = (chatId) => {
        setActiveChat(chatId);
        setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const getActiveChatName = () => {
        const u = activeUsers.find(u => u.id === activeChat);
        return u ? u.username : 'Unknown User';
    };

    const getActiveChatAvatar = () => {
        const u = activeUsers.find(u => u.id === activeChat);
        return u ? u.avatar : null;
    };

    return (
        <div className="flex h-screen w-screen bg-black overflow-hidden relative font-sans text-gray-200">
            {showProfileEdit && (
                <ProfileEdit
                    currentUser={currentUser}
                    onClose={() => setShowProfileEdit(false)}
                    onUpdate={(updated) => setCurrentUser(updated)}
                />
            )}

            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 bg-dark-900">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 lg:w-80 w-72 h-full z-40 transform transition-transform duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex
      `}>
                <Sidebar
                    users={activeUsers}
                    activeChat={activeChat}
                    onSelectChat={handleChatSelect}
                    currentUser={currentUser}
                    unreadCounts={unreadCounts}
                    onProfileClick={() => setShowProfileEdit(true)}
                    soundsEnabled={soundsEnabled}
                    onToggleSounds={toggleSounds}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full w-full relative z-10 bg-dark-900/40 backdrop-blur-sm">
                {!activeChat ? (
                    <div className="flex flex-col items-center justify-center flex-1 h-full select-none text-center">
                        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-primary/20 to-green-600/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <span className="text-primary font-bold text-4xl">L</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Welcome to Lumix Chat</h2>
                        <p className="text-gray-500 font-light max-w-sm">Select a user from the sidebar to start messaging.</p>

                        <div className="mt-8">
                            <button onClick={onLogout} className="md:hidden flex items-center gap-2 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition border border-red-500/20">
                                <LogOut size={16} /> EXIT APP
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <header className="h-20 px-6 border-b border-white/5 flex items-center justify-between glass-panel z-20 sticky top-0">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="md:hidden p-2 hover:bg-white/10 rounded-full transition text-white"
                                >
                                    <Menu size={20} />
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={getActiveChatAvatar() || `https://ui-avatars.com/api/?name=${getActiveChatName()}&background=random`}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full border border-gray-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                        />
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-dark-900 rounded-full animate-pulse"></span>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-white text-lg tracking-tight">{getActiveChatName()}</h2>
                                        <span className="text-xs text-primary font-medium flex items-center gap-1.5 opacity-80">
                                            Active now
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={onLogout} className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition border border-red-500/20 hover:border-red-500/50">
                                    <LogOut size={14} /> EXIT
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className={`p-2 transition rounded-full ${isMenuOpen ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl z-50 glass-panel overflow-hidden animate-slide-up">
                                            <div className="p-4 border-b border-white/5 bg-white/5">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Palette size={12} /> Chat Themes
                                                </p>
                                            </div>
                                            <div className="p-3 grid grid-cols-2 gap-2">
                                                {wallpapers.map((wp) => (
                                                    <button
                                                        key={wp.name}
                                                        onClick={() => changeWallpaper(wp.value)}
                                                        className={`h-16 rounded-xl border-2 transition-all overflow-hidden relative group ${wallpaper === wp.value ? 'border-primary' : 'border-transparent hover:border-white/20'}`}
                                                        style={{ background: wp.value, backgroundSize: 'cover' }}
                                                    >
                                                        <div className="absolute inset-x-0 bottom-0 py-1 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
                                                            <span className="text-[8px] font-bold text-white uppercase">{wp.name}</span>
                                                        </div>
                                                        {wallpaper === wp.value && (
                                                            <div className="absolute top-1 right-1 bg-primary text-dark-900 rounded-full p-0.5">
                                                                <Palette size={8} fill="currentColor" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="p-2 bg-dark-900/50 border-t border-white/5">
                                                <button
                                                    onClick={() => changeWallpaper(null)}
                                                    className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-white transition uppercase tracking-widest"
                                                >
                                                    Reset to Default
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>

                        {/* Messages */}
                        <ChatWindow
                            messages={messages[activeChat] || []}
                            currentUser={currentUser}
                            typingUsers={[]}
                            isLoading={loadingHistory}
                            wallpaper={wallpaper}
                        />

                        {/* Input */}
                        <MessageInput
                            onSend={sendMessage}
                            onTyping={handleTyping}
                            onStopTyping={handleStopTyping}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;
