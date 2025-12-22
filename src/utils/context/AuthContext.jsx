import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../services/authService';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log('🔍 AuthContext: Fetching user profile...');
                // Use authService which properly handles HttpOnly cookies
                const result = await authService.getCurrentUser();

                if (result.success && result.data) {
                    console.log('✅ AuthContext: User authenticated', result.data);
                    setUser(result.data);
                } else {
                    console.log('⚠️ AuthContext: No authenticated user');
                    setUser(null);
                }
            } catch (error) {
                console.error('❌ AuthContext: Error fetching user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('🔐 AuthContext: Logging in...');
            const result = await authService.loginUser(email, password);

            if (result.success && result.data) {
                console.log('✅ AuthContext: Login successful');
                // Fetch user profile after successful login
                const profileResult = await authService.getCurrentUser();
                if (profileResult.success && profileResult.data) {
                    setUser(profileResult.data);
                    return { success: true };
                }
            }

            throw new Error(result.message || 'Login failed');
        } catch (error) {
            console.error('❌ AuthContext: Login error:', error);
            setUser(null);
            throw error;
        }
    };

    const logout = () => {
        console.log('👋 AuthContext: Logging out...');
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
