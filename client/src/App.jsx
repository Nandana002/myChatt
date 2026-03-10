import React, { useState } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';
import { authAPI } from './services/api';

function App() {
    const [user, setUser] = useState(null);

    const handleJoin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        authAPI.logout();
        setUser(null);
    };

    return (
        <div className="h-screen w-screen bg-chat-bg flex items-center justify-center">
            {!user ? (
                <Login onJoin={handleJoin} />
            ) : (
                <Chat user={user} onLogout={handleLogout} />
            )}
        </div>
    );
}

export default App;
