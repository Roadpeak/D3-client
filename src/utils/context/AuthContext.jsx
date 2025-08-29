import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCookie } from '../cookieUtils';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = getCookie('access_token');
                if (token) {
                    const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/api/v1/profile', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        const mappedUser = {
                            id: userData.id,
                            email: userData.email,
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            phone: userData.phone,
                            user_type: userData.user_type,
                            active: Boolean(userData.active),
                            first_discount: userData.first_discount,
                            active_status: userData.active_status,
                            dark_mode: Boolean(userData.dark_mode)
                        };
                        setUser(mappedUser);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/api/v1/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            if (response.ok) {
                const userData = await response.json();
                const mappedUser = {
                    id: userData.id,
                    email: userData.email,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    phone: userData.phone,
                    user_type: userData.user_type,
                    active: Boolean(userData.active),
                    first_discount: userData.first_discount,
                    active_status: userData.active_status,
                    dark_mode: Boolean(userData.dark_mode)
                };
                setUser(mappedUser);
                localStorage.setItem('access_token', userData.token);
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setUser(null);
            throw new Error('Login failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
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
