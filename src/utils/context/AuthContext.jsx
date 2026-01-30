import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../services/authService';

const AuthContext = createContext(undefined);

// Helper to extract user from various response formats
const extractUser = (data) => {
    if (!data) return null;
    // Handle different response structures: { user: {...} }, { data: {...} }, or direct user object
    return data.user || data.data || (data.id ? data : null);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await authService.getCurrentUser();

                if (result.success && result.data) {
                    const userData = extractUser(result.data);
                    if (userData) {
                        setUser(userData);
                        // Sync localStorage flag for existing sessions
                        localStorage.setItem('isLoggedIn', 'true');
                    } else {
                        setUser(null);
                        localStorage.removeItem('isLoggedIn');
                    }
                } else {
                    setUser(null);
                    localStorage.removeItem('isLoggedIn');
                }
            } catch (error) {
                setUser(null);
                localStorage.removeItem('isLoggedIn');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const result = await authService.loginUser(email, password);

            if (result.success && result.data) {
                // Fetch user profile after successful login
                const profileResult = await authService.getCurrentUser();

                if (profileResult.success && profileResult.data) {
                    const userData = extractUser(profileResult.data);
                    if (userData) {
                        setUser(userData);
                        // Ensure localStorage flag is set
                        localStorage.setItem('isLoggedIn', 'true');
                        return { success: true };
                    }
                }

                // If profile fetch succeeded but no user data, still consider login successful
                // as the cookie is set and user can retry
                throw new Error('Could not retrieve user profile');
            }

            throw new Error(result.message || 'Login failed');
        } catch (error) {
            setUser(null);
            localStorage.removeItem('isLoggedIn');
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    // Provide a method to refresh user data
    const refreshUser = async () => {
        try {
            const result = await authService.getCurrentUser();
            if (result.success && result.data) {
                const userData = extractUser(result.data);
                if (userData) {
                    setUser(userData);
                    localStorage.setItem('isLoggedIn', 'true');
                    return;
                }
            }
            setUser(null);
            localStorage.removeItem('isLoggedIn');
        } catch (error) {
            setUser(null);
            localStorage.removeItem('isLoggedIn');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
