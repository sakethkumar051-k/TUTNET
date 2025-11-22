import axios from 'axios';

// Ensure baseURL always ends with /api
const getBaseURL = () => {
    const envURL = import.meta.env.VITE_API_URL;
    let baseURL;
    
    if (envURL) {
        // If VITE_API_URL is provided, ensure it ends with /api
        baseURL = envURL.endsWith('/api') ? envURL : `${envURL.replace(/\/$/, '')}/api`;
    } else {
        // Default to localhost with /api for development
        baseURL = 'http://localhost:5001/api';
    }
    
    // Log in development to help debug
    if (import.meta.env.DEV) {
        console.log('API Base URL:', baseURL);
        console.log('VITE_API_URL env var:', envURL);
    }
    
    return baseURL;
};

const baseURL = getBaseURL();

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Log the actual request URL in development
if (import.meta.env.DEV) {
    api.interceptors.request.use(
        (config) => {
            console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
}

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
