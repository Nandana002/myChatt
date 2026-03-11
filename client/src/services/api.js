import axios from 'axios';

const API_URL = import.meta.env.PROD 
    ? '/api' 
    : 'http://localhost:5000/api';

// Set auth token for all requests
const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

// Initialize token from localStorage
const token = localStorage.getItem('token');
if (token) {
    setAuthToken(token);
}

// Add request interceptor to always attach token if it exists in localStorage
axios.interceptors.request.use(
    (config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: async (userData) => {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        if (response.data.token) {
            setAuthToken(response.data.token);
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        if (response.data.token) {
            setAuthToken(response.data.token);
        }
        return response.data;
    },

    logout: () => {
        setAuthToken(null);
        localStorage.removeItem('user');
    },

    guestJoin: async (data) => {
        const response = await axios.post(`${API_URL}/auth/guest-join`, data);
        if (response.data.token) {
            setAuthToken(response.data.token);
        }
        return response.data;
    }
};

// Messages API
export const messagesAPI = {
    getHistory: async (chatId, page = 1, limit = 50) => {
        const response = await axios.get(`${API_URL}/messages/${chatId}?page=${page}&limit=${limit}`);
        return response.data;
    },

    send: async (messageData) => {
        const response = await axios.post(`${API_URL}/messages`, messageData);
        return response.data;
    },

    updateStatus: async (messageId, status) => {
        const response = await axios.patch(`${API_URL}/messages/${messageId}/status`, { status });
        return response.data;
    },

    addReaction: async (messageId, emoji) => {
        const response = await axios.post(`${API_URL}/messages/${messageId}/react`, { emoji });
        return response.data;
    },

    search: async (query, chatId) => {
        const response = await axios.get(`${API_URL}/messages/search/query?q=${query}&chatId=${chatId}`);
        return response.data;
    }
};

// Users API
export const usersAPI = {
    getOnline: async () => {
        const response = await axios.get(`${API_URL}/users/online`);
        return response.data;
    },

    updateTheme: async (theme) => {
        const response = await axios.patch(`${API_URL}/users/theme`, { theme });
        return response.data;
    },

    updateAvatar: async (avatar) => {
        const response = await axios.patch(`${API_URL}/users/avatar`, { avatar });
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await axios.patch(`${API_URL}/users/profile`, data);
        return response.data;
    },

    getProfile: async (userId) => {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        return response.data;
    }
};

// Stories API
export const storiesAPI = {
    create: async (storyData) => {
        const response = await axios.post(`${API_URL}/stories`, storyData);
        return response.data;
    },

    getAll: async () => {
        const response = await axios.get(`${API_URL}/stories`);
        return response.data;
    },

    markViewed: async (storyId) => {
        const response = await axios.post(`${API_URL}/stories/${storyId}/view`);
        return response.data;
    },

    delete: async (storyId) => {
        const response = await axios.delete(`${API_URL}/stories/${storyId}`);
        return response.data;
    }
};

// Polls API
export const pollsAPI = {
    create: async (pollData) => {
        const response = await axios.post(`${API_URL}/polls`, pollData);
        return response.data;
    },

    vote: async (pollId, optionIndex) => {
        const response = await axios.post(`${API_URL}/polls/${pollId}/vote`, { optionIndex });
        return response.data;
    },

    getByRoom: async (room) => {
        const response = await axios.get(`${API_URL}/polls/room/${room}`);
        return response.data;
    }
};

export { setAuthToken };
export default axios;
