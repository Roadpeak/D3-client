import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../services/authService';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await authService.getCurrentUser();

                if (result.success && result.data) {
                    setUser(result.data);
                    // Sync localStorage flag for existing sessions
                    localStorage.setItem('isLoggedIn', 'true');
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
                    setUser(profileResult.data);
                    return { success: true };
                }
            }

            throw new Error(result.message || 'Login failed');
        } catch (error) {
            setUser(null);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    // Provide a method to refresh user data
    const refreshUser = async () => {
        const result = await authService.getCurrentUser();
        if (result.success && result.data) {
            setUser(result.data);
        } else {
            setUser(null);
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
