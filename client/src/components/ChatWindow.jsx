import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages, currentUser, typingUsers, isLoading, wallpaper }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);

    const formatTypingText = () => {
        if (!typingUsers || typingUsers.length === 0) return null;
        if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
        return `${typingUsers.join(', ')} are typing...`;
    };

    const typingText = formatTypingText();

    // Default wallpaper if none provided (nice dark mesh)
    const defaultWallpaper = "linear-gradient(rgba(10, 10, 10, 0.95), rgba(10, 10, 10, 0.95)), url('https://www.transparenttextures.com/patterns/dark-matter.png')";

    // Determine the background style
    const bgStyle = wallpaper ? {
        background: wallpaper.includes('url') ? `linear-gradient(rgba(10, 10, 10, 0.7), rgba(10, 10, 10, 0.7)), ${wallpaper}` : wallpaper,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    } : {
        background: defaultWallpaper
    };

    console.log('ChatWindow rendering with messages:', messages);

    return (
        <div
            className="flex-1 overflow-y-auto w-full p-6 relative custom-scrollbar flex flex-col gap-2 transition-all duration-500"
            style={bgStyle}
        >
            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent z-0"></div>

            {isLoading && (
                <div className="flex flex-col gap-4 animate-pulse z-10">
                    <div className="flex justify-start w-full">
                        <div className="w-1/2 h-16 bg-white/5 rounded-2xl p-4"></div>
                    </div>
                    <div className="flex justify-end w-full">
                        <div className="w-1/3 h-12 bg-primary/5 rounded-2xl p-4"></div>
                    </div>
                    <div className="flex justify-start w-full">
                        <div className="w-2/3 h-20 bg-white/5 rounded-2xl p-4"></div>
                    </div>
                </div>
            )}

            {!isLoading && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full opacity-50 z-10 animate-fadeIn">
                    <div className="bg-primary/5 p-8 rounded-full mb-4">
                        <span className="text-4xl">👋</span>
                    </div>
                    <p className="text-primary font-bold text-xl mb-2">Start a Conversation</p>
                    <p className="text-gray-500 text-sm">Your secure channel is ready.</p>
                </div>
            )}

            {messages.map((msg, index) => {
                const isMe = msg.username === currentUser.username;
                // Logic to group messages if same user sends consecutively? For now simple.
                return (
                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full z-10`}>
                        <MessageBubble
                            message={msg}
                            isMe={isMe}
                            showAvatar={true} // Always show avatar for now
                        />
                    </div>
                );
            })}

            {typingText && (
                <div className="flex items-center gap-2 ml-4 mb-2 animate-pulse z-10">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300"></div>
                    <span className="text-xs text-primary/70 italic font-medium">{typingText}</span>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatWindow;
