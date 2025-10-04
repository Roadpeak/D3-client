// services/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://api.discoun3ree.com/api/v1';

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
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add API key
        const apiKey = process.env.REACT_APP_API_KEY || 'API_KEY_12345ABCDEF!@#67890-xyZQvTPOl';
        if (apiKey) {
            config.headers['x-api-key'] = apiKey;
        }

        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
    },
    (error) => {
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
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

    // Get single offer by ID
    getOfferById: async (id) => {
        if (!id) {
            throw new Error('Offer ID is required');
        }
        return handleApiCall(() => api.get(`/offers/${id}`));
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

// Health check endpoint
export const healthCheck = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        throw new Error('API is not available');
    }
};

export default api;