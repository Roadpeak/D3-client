// src/config/api.js
import axios from 'axios';

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1',
  timeout: 10000,
};

// Create axios instance
const api = axios.create(API_CONFIG);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeTokenFromCookie();
      window.location.href = '/accounts/sign-in';
    }
    return Promise.reject(error);
  }
);

// Cookie management functions
export const getTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('access_token=')
  );
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

export const setTokenToCookie = (token) => {
  const isProduction = window.location.hostname !== 'localhost';
  const cookieString = isProduction
    ? `access_token=${token}; path=/; domain=.discoun3ree.com; secure; SameSite=None; max-age=${30 * 24 * 60 * 60}` // 30 days
    : `access_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30 days
  
  document.cookie = cookieString;
};

export const removeTokenFromCookie = () => {
  const isProduction = window.location.hostname !== 'localhost';
  const cookieString = isProduction
    ? `access_token=; path=/; domain=.discoun3ree.com; secure; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    : `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  
  document.cookie = cookieString;
};

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  user: {
    register: '/users/register',
    login: '/users/login',
    profile: '/users/profile',
    verifyOtp: '/users/verify-otp',
    resendOtp: '/users/resend-otp',
  },
  // Merchant endpoints
  merchant: {
    register: '/merchants/register',
    login: '/merchants/login',
    profile: (id) => `/merchants/${id}/profile`,
    requestPasswordReset: '/merchants/request-password-reset',
    resetPassword: '/merchants/reset-password',
  },
  // Store endpoints
  stores: {
    list: '/stores',
    create: '/stores',
    get: (id) => `/stores/${id}`,
    update: (id) => `/stores/${id}`,
    delete: (id) => `/stores/${id}`,
  },
  // Service endpoints
  services: {
    list: '/services',
    create: '/services',
    get: (id) => `/services/${id}`,
    update: (id) => `/services/${id}`,
    delete: (id) => `/services/${id}`,
  },
  // Offer endpoints
  offers: {
    list: '/offers',
    create: '/offers',
    get: (id) => `/offers/${id}`,
    update: (id) => `/offers/${id}`,
    delete: (id) => `/offers/${id}`,
  },
  // Booking endpoints
  bookings: {
    list: '/bookings',
    create: '/bookings',
    get: (id) => `/bookings/${id}`,
    userBookings: '/bookings/user',
    merchantBookings: '/bookings/merchant',
  },
  // Chat endpoints
  chats: {
    list: '/chats',
    get: (id) => `/chats/${id}`,
    messages: (id) => `/chats/${id}/messages`,
    sendMessage: (id) => `/chats/${id}/messages`,
  }
};

export default api;