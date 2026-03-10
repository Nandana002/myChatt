import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Camera, Send, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { storiesAPI } from '../services/api';

const Stories = ({ currentUser }) => {
    const [stories, setStories] = useState([]);
    const [activeStoryIndex, setActiveStoryIndex] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState('text'); // 'text' or 'image'
    const [textContent, setTextContent] = useState('');
    const [bgColor, setBgColor] = useState('#10b981');
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#171717'];

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const data = await storiesAPI.getAll();
            setStories(data);
        } catch (error) {
            console.error('Error fetching stories:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setUploadType('image');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (uploadType === 'text' && !textContent.trim()) return;
        if (uploadType === 'image' && !imagePreview) return;

        setIsUploading(true);
        try {
            await storiesAPI.create({
                type: uploadType,
                content: uploadType === 'text' ? textContent : imagePreview,
                backgroundColor: uploadType === 'text' ? bgColor : '#000000'
            });
            setShowUploadModal(false);
            setTextContent('');
            setImagePreview(null);
            fetchStories();
        } catch (error) {
            console.error('Error uploading story:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const markAsViewed = async (storyId) => {
        try {
            await storiesAPI.markViewed(storyId);
            // Refresh to show updated view count if needed
        } catch (error) {
            console.error('Error marking viewed:', error);
        }
    };

    const openStory = (index) => {
        setActiveStoryIndex(index);
        markAsViewed(stories[index]._id);
    };

    // Group stories by user for the circle display
    const userStories = stories.reduce((acc, story) => {
        const userId = story.user._id;
        if (!acc[userId]) {
            acc[userId] = {
                user: story.user,
                stories: []
            };
        }
        acc[userId].stories.push(story);
        return acc;
    }, {});

    const groupedList = Object.values(userStories);

    return (
        <div className="flex items-center gap-4 px-2 py-4 overflow-x-auto no-scrollbar select-none">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-1 min-w-[70px]">
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="w-14 h-14 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition group"
                >
                    <Plus className="text-gray-500 group-hover:text-primary transition" />
                </button>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Add Story</span>
            </div>

            {/* Story List */}
            {groupedList.map((group, idx) => (
                <div key={group.user._id} className="flex flex-col items-center gap-1 min-w-[70px]">
                    <button
                        onClick={() => openStory(stories.findIndex(s => s.user._id === group.user._id))}
                        className="w-14 h-14 rounded-full p-[2px] border-2 border-primary shadow-lg shadow-primary/20"
                    >
                        <img
                            src={group.user.avatar || `https://ui-avatars.com/api/?name=${group.user.username}`}
                            alt={group.user.username}
                            className="w-full h-full rounded-full object-cover border border-dark-800"
                        />
                    </button>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter truncate w-14 text-center">
                        {group.user.username === currentUser.username ? 'You' : group.user.username}
                    </span>
                </div>
            ))}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-md bg-dark-800 rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white z-10 transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <h3 className="text-xl font-bold text-white mb-6">Create Story</h3>

                            {uploadType === 'text' ? (
                                <div
                                    className="aspect-[9/16] rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors duration-500"
                                    style={{ backgroundColor: bgColor }}
                                >
                                    <textarea
                                        value={textContent}
                                        onChange={(e) => setTextContent(e.target.value)}
                                        placeholder="Type your story..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-white font-bold text-2xl placeholder-white/40 resize-none text-center"
                                        rows={4}
                                    />

                                    <div className="flex gap-2 mt-8 flex-wrap justify-center">
                                        {colors.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setBgColor(c)}
                                                className={`w-6 h-6 rounded-full border-2 ${bgColor === c ? 'border-white' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white"
                                        >
                                            <Camera size={12} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-[9/16] rounded-2xl overflow-hidden relative bg-black">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                    <button
                                        onClick={() => { setUploadType('text'); setImagePreview(null); }}
                                        className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold"
                                    >
                                        Change to Text
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="w-full mt-6 bg-primary text-dark-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition disabled:opacity-50"
                            >
                                {isUploading ? 'Uploading...' : <><Send size={18} /> Share Story</>}
                            </button>

                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                    </div>
                </div>
            )}

            {/* Story Viewer */}
            {activeStoryIndex !== null && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 animate-fade-in">
                    <button
                        onClick={() => setActiveStoryIndex(null)}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-50 transition"
                    >
                        <X size={24} />
                    </button>

                    <div className="w-full max-w-lg aspect-[9/16] relative flex items-center justify-center">
                        {/* Navigation */}
                        {activeStoryIndex > 0 && (
                            <button
                                onClick={() => setActiveStoryIndex(activeStoryIndex - 1)}
                                className="absolute left-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-10 transition"
                            >
                                <ChevronLeft size={30} />
                            </button>
                        )}
                        {activeStoryIndex < stories.length - 1 && (
                            <button
                                onClick={() => {
                                    setActiveStoryIndex(activeStoryIndex + 1);
                                    markAsViewed(stories[activeStoryIndex + 1]._id);
                                }}
                                className="absolute right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-10 transition"
                            >
                                <ChevronRight size={30} />
                            </button>
                        )}

                        {/* Content */}
                        <div
                            className="w-full h-full flex flex-col items-center justify-center p-12 text-center"
                            style={{ backgroundColor: stories[activeStoryIndex].backgroundColor }}
                        >
                            {/* User Header */}
                            <div className="absolute top-8 left-8 flex items-center gap-3">
                                <img
                                    src={stories[activeStoryIndex].user.avatar}
                                    alt="User"
                                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                                />
                                <div className="text-left">
                                    <p className="text-white font-bold text-sm">{stories[activeStoryIndex].user.username}</p>
                                    <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">
                                        {new Date(stories[activeStoryIndex].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            {stories[activeStoryIndex].type === 'text' ? (
                                <h2 className="text-white font-bold text-3xl leading-tight">
                                    {stories[activeStoryIndex].content}
                                </h2>
                            ) : (
                                <img
                                    src={stories[activeStoryIndex].content}
                                    alt="Story"
                                    className="absolute inset-0 w-full h-full object-contain"
                                />
                            )}

                            {/* Views */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm text-white/70 text-xs font-bold">
                                <Eye size={14} /> {stories[activeStoryIndex].views?.length || 0} Views
                            </div>
                        </div>

                        {/* Progress Bar (Mock) */}
                        <div className="absolute top-4 left-4 right-4 flex gap-1 h-1">
                            {stories.map((_, i) => (
                                <div key={i} className={`flex-1 rounded-full ${i <= activeStoryIndex ? 'bg-white' : 'bg-white/30'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stories;
