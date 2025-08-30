// services/api.js - USER API
import axios from 'axios';

// FIXED: Correct case-sensitive URL
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
    (config) => {
        // Try multiple token sources
        const token = localStorage.getItem('token') ||
            localStorage.getItem('authToken') ||
            localStorage.getItem('access_token') ||
            getTokenFromCookie();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add API key if available
        const apiKey = process.env.REACT_APP_API_KEY || 'API_KEY_12345ABCDEF!@#67890-xyZQvTPOl';
        if (apiKey) {
            config.headers['api-key'] = apiKey;
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Helper to get token from cookie
function getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie =>
        cookie.trim().startsWith('access_token=')
    );
    return tokenCookie ? tokenCookie.split('=')[1] : null;
}

// Helper to set token to cookie
function setTokenToCookie(token) {
    const isProduction = window.location.hostname !== 'localhost';
    const cookieString = isProduction
        ? `access_token=${token}; path=/; domain=.discoun3ree.com; secure; SameSite=None; max-age=${30 * 24 * 60 * 60}`
        : `access_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}`;

    document.cookie = cookieString;
}

// Helper to remove token from cookie
function removeTokenFromCookie() {
    const isProduction = window.location.hostname !== 'localhost';
    const cookieString = isProduction
        ? `access_token=; path=/; domain=.discoun3ree.com; secure; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        : `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    document.cookie = cookieString;
}

// API endpoints configuration
export const API_ENDPOINTS = {
    // User endpoints
    user: {
        register: '/users/register',
        login: '/users/login',
        profile: '/users/profile',
        verifyOtp: '/users/verify-otp',
        resendOtp: '/users/resend-otp',
        requestPasswordReset: '/users/request-password-reset',
        resetPassword: '/users/reset-password',
        favorites: '/users/favorites',
        favoritesCount: '/users/favorites/count',
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
        // NEW: Favorites endpoints
        addToFavorites: (id) => `/offers/${id}/favorite`,
        removeFromFavorites: (id) => `/offers/${id}/favorite`,
        favoriteStatus: (id) => `/offers/${id}/favorite/status`,
        toggleFavorite: (id) => `/offers/${id}/favorite/toggle`,
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific error cases
        if (error.response?.status === 401) {
            // Clear all possible token storage locations
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('access_token');

            // Remove cookie
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/sign-in')) {
                window.location.href = '/accounts/sign-in';
            }
        }

        return Promise.reject(error);
    }
);

// Helper function to handle API calls with consistent error handling
const handleApiCall = async (apiCall) => {
    try {
        const response = await apiCall();
        return response.data;
    } catch (error) {
        // Re-throw with more context
        const enhancedError = new Error(error.response?.data?.message || error.message || 'API call failed');
        enhancedError.response = error.response;
        enhancedError.request = error.request;
        enhancedError.status = error.response?.status;
        throw enhancedError;
    }
};

// Offer API endpoints
export const offerAPI = {
    // Get all offers with pagination and filters
    getOffers: async (params = {}) => {
        return handleApiCall(() => api.get('/offers', { params }));
    },

    // Get random offers
    getRandomOffers: async (limit = 12) => {
        return handleApiCall(() => api.get('/offers/random', { params: { limit } }));
    },

    // Get offers by store
    getOffersByStore: async (storeId, params = {}) => {
        if (!storeId) {
            throw new Error('Store ID is required');
        }
        return handleApiCall(() => api.get(`/offers/store/${storeId}`, { params }));
    },

    // Get single offer by ID with better error handling
    getOfferById: async (id) => {
        if (!id || id.trim() === '') {
            throw new Error('Offer ID is required');
        }

        try {
            const response = await api.get(`/offers/${id}`);
            return response.data;
        } catch (error) {
            // Create a more informative error
            if (error.response?.status === 404) {
                throw new Error('Offer not found. It may have been removed or expired.');
            } else if (error.response?.status === 401) {
                throw new Error('Authentication required to view this offer.');
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error(error.response?.data?.message || error.message || 'Failed to fetch offer');
            }
        }
    },

    // Create new offer
    createOffer: async (offerData) => {
        if (!offerData) {
            throw new Error('Offer data is required');
        }
        return handleApiCall(() => api.post('/offers', offerData));
    },

    // Update offer
    updateOffer: async (id, offerData) => {
        if (!id) {
            throw new Error('Offer ID is required');
        }
        if (!offerData) {
            throw new Error('Offer data is required');
        }
        return handleApiCall(() => api.put(`/offers/${id}`, offerData));
    },

    // Delete offer
    deleteOffer: async (id) => {
        if (!id) {
            throw new Error('Offer ID is required');
        }
        return handleApiCall(() => api.delete(`/offers/${id}`));
    },

    // Get categories with counts
    getCategories: async () => {
        return handleApiCall(() => api.get('/offers/categories'));
    },

    // Get top deals
    getTopDeals: async (limit = 3) => {
        return handleApiCall(() => api.get('/offers/top-deals', { params: { limit } }));
    },

    // Get featured offers
    getFeaturedOffers: async (limit = 6) => {
        return handleApiCall(() => api.get('/offers/featured', { params: { limit } }));
    },
};

// FIXED: Favorites API endpoints - with better response handling
export const favoritesAPI = {
    // Get user's favorite offers - FIXED RESPONSE HANDLING
    getFavorites: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.category) queryParams.append('category', params.category);

            const url = API_ENDPOINTS.user.favorites + (queryParams.toString() ? `?${queryParams.toString()}` : '');

            const response = await api.get(url);
            console.log('🔍 Raw favorites API response:', response.data);

            // Handle the actual API response structure
            const apiData = response.data;
            const favorites = apiData.favorites || apiData.data || [];

            console.log('📋 Processed favorites:', favorites);
            console.log('📊 Sample favorite structure:', favorites[0]);

            return {
                success: true,
                favorites: favorites,
                pagination: apiData.pagination || {}
            };
        } catch (error) {
            console.error('❌ Error fetching favorites:', error);

            // If it's a 401 error, don't treat it as a failure
            if (error.response?.status === 401) {
                return {
                    success: false,
                    message: 'Authentication required',
                    favorites: [],
                    pagination: {}
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to fetch favorites',
                favorites: [],
                pagination: {}
            };
        }
    },

    // Add offer to favorites - FIXED ERROR HANDLING
    addToFavorites: async (offerId) => {
        if (!offerId) {
            return {
                success: false,
                message: 'Offer ID is required'
            };
        }

        try {
            const response = await api.post(API_ENDPOINTS.offers.addToFavorites(offerId));

            return {
                success: true,
                message: response.data.message || 'Added to favorites',
                data: response.data
            };
        } catch (error) {
            console.error('❌ Error adding to favorites:', error);

            // Check if it's already in favorites
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already')) {
                return {
                    success: false,
                    message: 'Already in favorites',
                    alreadyExists: true
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to add to favorites'
            };
        }
    },

    // Remove offer from favorites - FIXED ERROR HANDLING
    removeFromFavorites: async (offerId) => {
        if (!offerId) {
            return {
                success: false,
                message: 'Offer ID is required'
            };
        }

        try {
            const response = await api.delete(API_ENDPOINTS.offers.removeFromFavorites(offerId));

            return {
                success: true,
                message: response.data.message || 'Removed from favorites',
                data: response.data
            };
        } catch (error) {
            console.error('❌ Error removing from favorites:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to remove from favorites'
            };
        }
    },

    // Toggle favorite status - FIXED TOGGLE LOGIC
    toggleFavorite: async (offerId) => {
        if (!offerId) {
            return {
                success: false,
                message: 'Offer ID is required'
            };
        }

        try {
            const response = await api.post(API_ENDPOINTS.offers.toggleFavorite(offerId));

            return {
                success: true,
                action: response.data.action, // 'added' or 'removed'
                message: response.data.message || 'Favorite status updated',
                data: response.data
            };
        } catch (error) {
            console.error('❌ Error toggling favorite:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to update favorite'
            };
        }
    },

    // Check if offer is in favorites
    isFavorite: async (offerId) => {
        if (!offerId) {
            return { success: false, isFavorite: false };
        }

        try {
            const response = await api.get(API_ENDPOINTS.offers.favoriteStatus(offerId));
            return {
                success: true,
                isFavorite: response.data.isFavorite || false
            };
        } catch (error) {
            console.error('❌ Error checking favorite status:', error);
            return {
                success: false,
                isFavorite: false
            };
        }
    },

    // Get favorites count
    getFavoritesCount: async () => {
        try {
            const response = await api.get(API_ENDPOINTS.user.favoritesCount);
            return {
                success: true,
                count: response.data.count || 0
            };
        } catch (error) {
            console.error('❌ Error fetching favorites count:', error);
            return {
                success: false,
                count: 0
            };
        }
    }
};

// Store API endpoints
export const storeAPI = {
    getStores: async (params = {}) => {
        return handleApiCall(() => api.get('/stores', { params }));
    },

    getStoreById: async (id) => {
        if (!id) {
            throw new Error('Store ID is required');
        }
        return handleApiCall(() => api.get(`/stores/${id}`));
    },
};

// Service API endpoints
export const serviceAPI = {
    getServices: async (params = {}) => {
        return handleApiCall(() => api.get('/services', { params }));
    },

    getServiceById: async (id) => {
        if (!id) {
            throw new Error('Service ID is required');
        }
        return handleApiCall(() => api.get(`/services/${id}`));
    },
};

// User API endpoints
export const userAPI = {
    getProfile: async () => {
        return handleApiCall(() => api.get('/users/profile'));
    },

    updateProfile: async (profileData) => {
        return handleApiCall(() => api.put('/users/profile', profileData));
    },

    login: async (credentials) => {
        return handleApiCall(() => api.post('/users/login', credentials));
    },

    register: async (userData) => {
        return handleApiCall(() => api.post('/users/register', userData));
    },
};

// Health check endpoint
export const healthCheck = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        throw new Error('API is not available');
    }
};

// Export cookie management functions
export { getTokenFromCookie, setTokenToCookie, removeTokenFromCookie };

export default api;