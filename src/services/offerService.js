// services/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token if available
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Offer API endpoints
export const offerAPI = {
    // Get all offers with pagination and filters
    getOffers: async (params = {}) => {
        const response = await api.get('/offers', { params });
        return response.data;
    },

    // Get random offers
    getRandomOffers: async (limit = 12) => {
        const response = await api.get('/offers/random', { params: { limit } });
        return response.data;
    },

    // Get offers by store
    getOffersByStore: async (storeId, params = {}) => {
        const response = await api.get(`/offers/store/${storeId}`, { params });
        return response.data;
    },

    // Get single offer by ID
    getOfferById: async (id) => {
        const response = await api.get(`/offers/${id}`);
        return response.data;
    },

    // Create new offer
    createOffer: async (offerData) => {
        const response = await api.post('/offers', offerData);
        return response.data;
    },

    // Update offer
    updateOffer: async (id, offerData) => {
        const response = await api.put(`/offers/${id}`, offerData);
        return response.data;
    },

    // Delete offer
    deleteOffer: async (id) => {
        const response = await api.delete(`/offers/${id}`);
        return response.data;
    },

    // Get categories with counts
    getCategories: async () => {
        const response = await api.get('/offers/categories');
        return response.data;
    },

    // Get top deals
    getTopDeals: async (limit = 3) => {
        const response = await api.get('/offers/top-deals', { params: { limit } });
        return response.data;
    },

    // Get featured offers
    getFeaturedOffers: async (limit = 6) => {
        const response = await api.get('/offers/featured', { params: { limit } });
        return response.data;
    },
};

// Store API endpoints
export const storeAPI = {
    getStores: async (params = {}) => {
        const response = await api.get('/stores', { params });
        return response.data;
    },

    getStoreById: async (id) => {
        const response = await api.get(`/stores/${id}`);
        return response.data;
    },
};

// Service API endpoints
export const serviceAPI = {
    getServices: async (params = {}) => {
        const response = await api.get('/services', { params });
        return response.data;
    },

    getServiceById: async (id) => {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },
};

export default api;