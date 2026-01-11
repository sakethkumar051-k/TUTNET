import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    setUser(data);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (credentialsOrToken) => {
        // If argument is a string, it's a token (from OAuth or Onboarding)
        if (typeof credentialsOrToken === 'string') {
            const token = credentialsOrToken;
            localStorage.setItem('token', token);
            // Immediately fetch user data with this new token
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
                return data;
            } catch (error) {
                console.error('Login with token failed:', error);
                throw error;
            }
        } else {
            // Standard credentials login
            const { data } = await api.post('/auth/login', credentialsOrToken);
            localStorage.setItem('token', data.token);
            setUser(data);
            return data;
        }
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
