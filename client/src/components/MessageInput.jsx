import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Mic, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ onSend, onTyping, onStopTyping }) => {
    const [message, setMessage] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    const handleTyping = () => {
        onTyping();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            onStopTyping();
        }, 1000);
    };

    const handleChange = (e) => {
        setMessage(e.target.value);
        handleTyping();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 8000000) { // 8MB limit
                alert('Image must be less than 8MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = () => {
        if (message.trim() || selectedImage) {
            onSend({ text: message, image: selectedImage });
            setMessage('');
            setSelectedImage(null);
            setImagePreview(null);
            onStopTyping();
            setShowEmoji(false);
            inputRef.current?.focus();
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const onEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
        handleTyping();
    };

    return (
        <div className="p-6 bg-dark-900 border-t border-white/5 relative z-20 backdrop-blur-xl">
            {/* Emoji Picker Popover */}
            {showEmoji && (
                <div className="absolute bottom-24 left-6 z-50">
                    <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        theme="dark"
                        searchDisabled={true}
                        width={350}
                        height={450}
                        lazyLoadEmojis={true}
                    />
                </div>
            )}

            {/* Image Preview Area */}
            {imagePreview && (
                <div className="mb-4 relative inline-block animate-slide-up">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 rounded-xl border border-white/10 shadow-lg object-cover"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-lg"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="flex items-center gap-3 bg-dark-800/50 border border-white/10 rounded-2xl px-2 py-2 shadow-inner focus-within:ring-2 focus-within:ring-primary/50 transition-all">

                <button
                    className="p-3 text-gray-400 hover:text-primary transition hover:bg-white/5 rounded-xl"
                    onClick={() => setShowEmoji(!showEmoji)}
                >
                    <Smile size={20} />
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <button
                    onClick={() => fileInputRef.current.click()}
                    className="p-3 text-gray-400 hover:text-white transition hover:bg-white/5 rounded-xl hidden sm:block"
                >
                    <Paperclip size={20} />
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your message here..."
                    className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none px-2 font-light tracking-wide"
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                />

                {(message.trim() || selectedImage) ? (
                    <button
                        className="p-3 bg-primary text-dark-900 rounded-xl hover:bg-primary-glow transition shadow-[0_0_15px_rgba(16,185,129,0.4)] transform hover:scale-105 active:scale-95"
                        onClick={handleSend}
                    >
                        <Send size={20} fill="currentColor" />
                    </button>
                ) : (
                    <button className="p-3 text-gray-500 hover:text-white transition hover:bg-white/5 rounded-xl">
                        <Mic size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageInput;
