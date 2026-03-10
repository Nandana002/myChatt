import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

const MessageBubble = ({ message, isMe, showAvatar }) => {
    return (
        <div className={classNames('flex items-end gap-2 mb-4 animate-slideIn', {
            'flex-row-reverse': isMe,
            'flex-row': !isMe
        })}>
            {/* Avatar */}
            {showAvatar && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-gray-700 bg-gray-800">
                    <img
                        src={message.avatar || `https://ui-avatars.com/api/?name=${message.username}&background=random&color=fff`}
                        alt="User"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className={classNames('max-w-[70%] rounded-2xl p-4 relative shadow-lg glass-panel transition-all transform hover:scale-[1.01]', {
                'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/20 rounded-br-none': isMe,
                'bg-dark-800/80 border-white/5 rounded-bl-none': !isMe
            })}>
                {!isMe && (
                    <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider flex items-center gap-1">
                        {message.username}
                        {message.username === 'ChatSystem' && <span className="bg-primary/20 p-0.5 rounded text-[8px]">BOT</span>}
                    </p>
                )}
                {(message.image || message.mediaUrl) && (
                    <div className="mb-2 overflow-hidden rounded-lg border border-white/5 shadow-md bg-black/20 flex justify-center">
                        <img
                            src={message.image || message.mediaUrl}
                            alt="Shared"
                            className="max-w-full h-auto max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition"
                            onClick={() => window.open(message.image || message.mediaUrl, '_blank')}
                        />
                    </div>
                )}
                {message.text && (
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words font-light">
                        {message.text}
                    </p>
                )}
                <span className="text-[9px] text-gray-500 block text-right mt-2 opacity-70 font-mono">
                    {message.time || (message.createdAt && new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
