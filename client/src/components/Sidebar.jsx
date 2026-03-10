import React, { useState } from 'react';
import { Users, Hash, Circle, Search, Bell, BellOff } from 'lucide-react';
import classNames from 'classnames';

const Sidebar = ({ users, activeChat, onSelectChat, currentUser, unreadCounts, onProfileClick, soundsEnabled, onToggleSounds }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter users based on search query
    const filteredUsers = users
        .filter(u => u.id !== currentUser.id)
        .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="w-80 h-full bg-dark-800 border-r border-white/5 flex flex-col z-20 shadow-2xl overflow-hidden backdrop-blur-3xl glass-panel">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-dark-900 font-bold text-lg">L</span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Lumix Chat</h2>
                    </div>
                    <button
                        onClick={onToggleSounds}
                        className={classNames(
                            "p-2 rounded-full transition relative group",
                            soundsEnabled ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-white/5 hover:text-white"
                        )}
                        title={soundsEnabled ? "Mute Notifications" : "Unmute Notifications"}
                    >
                        {soundsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                        {!soundsEnabled && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-dark-800"></span>}
                    </button>
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search size={16} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-primary transition" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-dark-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition placeholder-gray-600"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">


                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 py-2 mt-4 flex justify-between items-center">
                    <span>Online Users</span>
                    <span className="bg-dark-700 px-1.5 py-0.5 rounded text-gray-400">{filteredUsers.length}</span>
                </p>

                {/* User List */}
                {filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => onSelectChat(user.id)}
                        className={classNames('cursor-pointer p-3 rounded-xl transition-all flex items-center gap-3 group border border-transparent hover:border-white/5 relative', {
                            'bg-white/5': activeChat === user.id
                        })}
                    >
                        <div className="relative">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                alt={user.username}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-dark-800"
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-dark-800 rounded-full box-content shadow-[0_0_8px_#10b981]"></span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-300 group-hover:text-white truncate transition">{user.username}</h3>
                            <p className="text-[10px] text-primary truncate">Active now</p>
                        </div>

                        {unreadCounts?.[user.id] > 0 && (
                            <span className="bg-primary text-dark-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                                {unreadCounts[user.id]}
                            </span>
                        )}
                    </div>
                ))}

                {filteredUsers.length === 0 && (
                    <div className="text-gray-500 text-xs text-center py-4 italic">
                        {searchQuery ? 'No users found matching your search.' : 'No other users online.'}
                    </div>
                )}
            </div>

            {/* Footer / Current User */}
            <div className="p-4 bg-dark-900/50 border-t border-white/5 backdrop-blur-md">
                <div onClick={onProfileClick} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer group">
                    <img
                        src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`}
                        alt="Me"
                        className="w-10 h-10 rounded-full border border-gray-600 group-hover:border-primary transition"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-primary transition">You</p>
                        <p className="text-[10px] text-green-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
