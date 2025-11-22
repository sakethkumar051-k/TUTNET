import axios from 'axios';

// Ensure baseURL always ends with /api
const getBaseURL = () => {
    const envURL = import.meta.env.VITE_API_URL;
    if (envURL) {
        // If VITE_API_URL is provided, ensure it ends with /api
        return envURL.endsWith('/api') ? envURL : `${envURL.replace(/\/$/, '')}/api`;
    }
    // Default to localhost with /api
    return 'http://localhost:5001/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
