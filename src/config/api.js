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
        
        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔄 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
    (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.error(`❌ ${error.response?.status || 'NETWORK'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
        }
        
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

// FIXED: Offer API endpoints with correct error handling
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

    // FIXED: Get single offer by ID with better error handling
    getOfferById: async (id) => {
        if (!id || id.trim() === '') {
            throw new Error('Offer ID is required');
        }
        
        console.log('🔍 Fetching offer by ID:', id);
        
        try {
            const response = await api.get(`/offers/${id}`);
            console.log('✅ Offer API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Offer API error:', error);
            
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

// NEW: Favorites API endpoints - integrated with your existing patterns
export const favoritesAPI = {
    // Get user's favorite offers
    getFavorites: async (params = {}) => {
        console.log('🔍 Fetching user favorites with params:', params);
        
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.category) queryParams.append('category', params.category);
            
            const url = API_ENDPOINTS.user.favorites + (queryParams.toString() ? `?${queryParams.toString()}` : '');
            console.log('📡 Request URL:', url);
            
            const response = await api.get(url);
            console.log('✅ Favorites response:', response.data);
            
            return {
                success: true,
                favorites: response.data.favorites || response.data.data || [],
                pagination: response.data.pagination || {}
            };
        } catch (error) {
            console.error('❌ Error fetching favorites:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to fetch favorites',
                favorites: [],
                pagination: {}
            };
        }
    },

    // Add offer to favorites
    addToFavorites: async (offerId) => {
        if (!offerId) {
            throw new Error('Offer ID is required');
        }
        
        console.log('💖 Adding offer to favorites:', offerId);
        
        try {
            const response = await api.post(API_ENDPOINTS.offers.addToFavorites(offerId));
            console.log('✅ Added to favorites:', response.data);
            
            return {
                success: true,
                message: response.data.message || 'Added to favorites',
                data: response.data
            };
        } catch (error) {
            console.error('❌ Error adding to favorites:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to add to favorites'
            };
        }
    },

    // Remove offer from favorites
    removeFromFavorites: async (offerId) => {
        if (!offerId) {
            throw new Error('Offer ID is required');
        }
        
        console.log('💔 Removing offer from favorites:', offerId);
        
        try {
            const response = await api.delete(API_ENDPOINTS.offers.removeFromFavorites(offerId));
            console.log('✅ Removed from favorites:', response.data);
            
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

    // Toggle favorite status (recommended for UI interactions)
    toggleFavorite: async (offerId) => {
        if (!offerId) {
            throw new Error('Offer ID is required');
        }
        
        console.log('🔄 Toggling favorite status for offer:', offerId);
        
        try {
            const response = await api.post(API_ENDPOINTS.offers.toggleFavorite(offerId));
            console.log('✅ Toggled favorite:', response.data);
            
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
    },

    // Batch check favorites (for lists of offers)
    checkMultipleFavorites: async (offerIds) => {
        if (!Array.isArray(offerIds) || offerIds.length === 0) {
            return { success: true, favorites: {} };
        }
        
        try {
            // Check each offer individually (can be optimized with a batch endpoint later)
            const results = {};
            
            for (const offerId of offerIds) {
                const result = await this.isFavorite(offerId);
                results[offerId] = result.isFavorite;
                
                // Small delay to prevent overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            return {
                success: true,
                favorites: results
            };
        } catch (error) {
            console.error('❌ Error batch checking favorites:', error);
            return {
                success: false,
                favorites: {}
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

// NEW: User API endpoints
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

// Test endpoint to verify API connection
export const testConnection = async () => {
    try {
        console.log('🧪 Testing API connection to:', BASE_URL);
        const response = await api.get('/cors-test');
        console.log('✅ API connection test successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ API connection test failed:', error);
        throw new Error(`Cannot connect to API at ${BASE_URL}`);
    }
};

// NEW: API test function specifically for favorites
export const testFavoritesAPI = async () => {
    console.log('🧪 Testing Favorites API endpoints...');
    
    const tests = [
        {
            name: 'Get Favorites',
            test: () => favoritesAPI.getFavorites()
        },
        {
            name: 'Get Favorites Count',
            test: () => favoritesAPI.getFavoritesCount()
        }
    ];
    
    const results = {};
    
    for (const test of tests) {
        try {
            console.log(`🔄 Testing: ${test.name}`);
            const result = await test.test();
            results[test.name] = {
                success: result.success !== false,
                data: result
            };
            console.log(`✅ ${test.name}: ${result.success !== false ? 'PASSED' : 'FAILED'}`);
        } catch (error) {
            results[test.name] = {
                success: false,
                error: error.message
            };
            console.log(`❌ ${test.name}: FAILED - ${error.message}`);
        }
    }
    
    return results;
};

// Export cookie management functions
export { getTokenFromCookie, setTokenToCookie, removeTokenFromCookie };

export default api;