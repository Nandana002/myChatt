import React, { useState, useRef } from 'react';
import { MessageSquare, Camera, ArrowRight, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';

const Login = ({ onJoin }) => {
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2000000) { // 2MB limit
                setError('Image must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result); // Base64 string
                setPreview(reader.result);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await authAPI.guestJoin({ username, avatar });
            // Now provide the full user object including the _id from DB
            onJoin(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error joining the chat');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-dark-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-black p-4 text-gray-200">

            {/* Title */}
            <div className="flex flex-col items-center mb-8 animate-fade-in">
                <div className="bg-primary/20 p-4 rounded-2xl mb-4 backdrop-blur-md border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <MessageSquare size={48} className="text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Premium Chat</h1>
                <p className="text-green-400/80 text-sm mt-2 font-medium tracking-wide uppercase">Join the elite circle of conversation</p>
            </div>

            {/* Card */}
            <div className="bg-dark-800/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl w-full max-w-md relative overflow-hidden animate-slide-up">

                {/* Glow Effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[50px]"></div>

                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400 text-sm mb-8">Please enter your credentials to access your secure workspace.</p>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                    {/* Avatar Upload */}
                    <div className="flex justify-center mb-6">
                        <div
                            className="relative w-24 h-24 rounded-full bg-dark-700 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-primary transition group overflow-hidden"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {preview ? (
                                <img src={preview} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <Camera size={24} className="text-gray-500 group-hover:text-primary transition" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full">
                                <span className="text-xs text-white font-bold">Change</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-primary tracking-wider uppercase mb-2">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError('');
                                }}
                                className="w-full bg-dark-900/50 border border-white/10 text-white rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-600"
                                placeholder="e.g. CyberNinja_01"
                            />
                            <span className="absolute left-3 top-3.5 text-gray-500">
                                @
                            </span>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs mt-1 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-primary-glow text-dark-900 py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>Join Chat <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="mt-8 flex justify-between items-center text-[10px] text-gray-500 font-medium tracking-wider">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        1,204 ONLINE NOW
                    </div>
                    <span className="cursor-pointer hover:text-primary transition">FORGOT ACCESS?</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
