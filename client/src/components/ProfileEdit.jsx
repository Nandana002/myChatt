import React, { useState, useRef } from 'react';
import { X, Camera, Save, Loader, CheckCircle2 } from 'lucide-react';
import { usersAPI } from '../services/api';

const ProfileEdit = ({ currentUser, onClose, onUpdate }) => {
    const [username, setUsername] = useState(currentUser.username || '');
    const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                setError('Image must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setSelectedAvatar(reader.result);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!username.trim()) {
            setError('Username cannot be empty');
            return;
        }

        if (username.length < 2 || username.length > 30) {
            setError('Username must be between 2 and 30 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = {};
            if (username !== currentUser.username) {
                data.username = username;
            }
            if (selectedAvatar) {
                data.avatar = selectedAvatar;
            }

            // Only update if changes were made
            if (Object.keys(data).length > 0) {
                const response = await usersAPI.updateProfile(data);

                // Show success immediately
                setSuccess(true);

                // Inform parent component to update socket/local state
                if (onUpdate) {
                    onUpdate({
                        ...currentUser,
                        username: response.username,
                        avatar: response.avatar
                    });
                }

                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                onClose(); // No changes
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-dark-800 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden glass-panel relative flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
                    <h2 className="text-xl font-bold text-white tracking-tight">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center flex-1 relative z-10">
                    {/* Avatar Upload */}
                    <div className="relative mb-8 group">
                        <div className="w-32 h-32 rounded-full border-4 border-dark-900 shadow-xl overflow-hidden bg-dark-700 relative">
                            <img
                                src={avatarPreview}
                                alt="Profile Avatar"
                                className="w-full h-full object-cover transition duration-300 group-hover:scale-110 group-hover:opacity-70"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40 cursor-pointer pointer-events-none">
                                <Camera size={32} className="text-white drop-shadow-lg" />
                            </div>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full text-dark-900 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-dark-900 hover:scale-110 transition active:scale-95 z-20"
                        >
                            <Camera size={18} fill="currentColor" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Inputs */}
                    <div className="w-full space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Display Name</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                                placeholder="Enter your username"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center animate-slide-up">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm text-center flex items-center justify-center gap-2 animate-slide-up">
                                <CheckCircle2 size={18} />
                                Profile updated successfully!
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-white/5 bg-dark-900/50 flex justify-end gap-3 z-10">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || success}
                        className="px-6 py-2.5 bg-primary text-dark-900 font-bold rounded-xl hover:bg-primary-glow transition shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                        {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEdit;
