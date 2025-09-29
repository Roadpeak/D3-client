// services/api.js - COMPLETE UPDATED VERSION WITH LOCATION SUPPORT AND ENHANCED NOTIFICATIONS
import axios from 'axios';

// FIXED: Correct case-sensitive URL
const BASE_URL = process.env.REACT_APP_API_URL || '${process.env.REACT_APP_API_BASE_URL}';

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
        notificationSettings: '/users/notification-settings',
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
        locations: '/stores/locations',
        categories: '/stores/categories',
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
        random: '/offers/random',
        topDeals: '/offers/top-deals',
        featured: '/offers/featured',
        categories: '/offers/categories',
        // Favorites endpoints
        addToFavorites: (id) => `/offers/${id}/favorite`,
        removeFromFavorites: (id) => `/offers/${id}/favorite`,
        favoriteStatus: (id) => `/offers/${id}/favorite/status`,
        toggleFavorite: (id) => `/offers/${id}/favorite/toggle`,
    },
    // Location endpoints
    locations: {
        available: '/locations/available',
        reverseGeocode: '/locations/reverse-geocode',
        stats: '/locations/stats',
    },
    // Booking endpoints
    bookings: {
        list: '/bookings',
        create: '/bookings',
        get: (id) => `/bookings/${id}`,
        userBookings: '/bookings/user',
        merchantBookings: '/bookings/merchant',
        cancel: (id) => `/bookings/${id}/cancel`,
        confirm: (id) => `/bookings/${id}/confirm`,
        complete: (id) => `/bookings/${id}/complete`,
    },
    // Enhanced Chat endpoints
    chats: {
        list: '/chats',
        get: (id) => `/chats/${id}`,
        messages: (id) => `/chats/${id}/messages`,
        sendMessage: (id) => `/chats/${id}/messages`,
        // New chat endpoints from updated controller
        userConversations: '/chat/conversations/user',
        merchantConversations: '/chat/conversations/merchant',
        startConversation: '/chat/start',
        searchConversations: '/chat/search',
        analytics: '/chat/analytics',
        getMessages: (conversationId) => `/chat/conversations/${conversationId}/messages`,
        sendChatMessage: '/chat/send',
        updateMessageStatus: (messageId) => `/chat/messages/${messageId}/status`,
        markAsRead: (conversationId) => `/chat/conversations/${conversationId}/read`,
    },
    // Enhanced Notification endpoints
    notifications: {
        // Core endpoints
        list: '/notifications',
        counts: '/notifications/counts',
        analytics: '/notifications/analytics',
        byStore: (storeId) => `/notifications/store/${storeId}`,

        // Single notification operations
        get: (id) => `/notifications/${id}`,
        markAsRead: (id) => `/notifications/${id}/read`,
        delete: (id) => `/notifications/${id}`,

        // Bulk operations
        markAllAsRead: '/notifications/mark-all-read',
        bulkMarkRead: '/notifications/bulk/mark-read',
        bulkDelete: '/notifications/bulk',

        // Settings
        settings: '/notifications/settings',
        updateSettings: '/notifications/settings',

        // Admin/System
        broadcast: '/notifications/broadcast',
        cleanup: '/notifications/cleanup',
        health: '/notifications/health',

        // Create notification
        create: '/notifications',
    },
    // Service Marketplace endpoints
    marketplace: {
        requests: {
            list: '/marketplace/requests',
            get: (id) => `/marketplace/requests/${id}`,
            create: '/marketplace/requests',
            update: (id) => `/marketplace/requests/${id}`,
            delete: (id) => `/marketplace/requests/${id}`,
        },
        offers: {
            list: '/marketplace/offers',
            get: (id) => `/marketplace/offers/${id}`,
            create: '/marketplace/offers',
            accept: (id) => `/marketplace/offers/${id}/accept`,
            reject: (id) => `/marketplace/offers/${id}/reject`,
            withdraw: (id) => `/marketplace/offers/${id}/withdraw`,
        },
    },
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

// Enhanced Notification API
export const notificationAPI = {
    // Get notifications with filters
    async getNotifications(params = {}) {
        const queryParams = new URLSearchParams({
            page: params.page || 1,
            limit: params.limit || 20,
            type: params.type || 'all',
            unreadOnly: params.unreadOnly || false,
            storeId: params.storeId || '',
            priority: params.priority || '',
        }).toString();

        return handleApiCall(() => api.get(`${API_ENDPOINTS.notifications.list}?${queryParams}`));
    },

    // Get notification counts
    async getCounts(storeId = null) {
        const url = storeId
            ? `${API_ENDPOINTS.notifications.counts}?storeId=${storeId}`
            : API_ENDPOINTS.notifications.counts;
        return handleApiCall(() => api.get(url));
    },

    // Get notification analytics
    async getAnalytics(period = '7d', storeId = null) {
        const params = new URLSearchParams({
            period,
            ...(storeId && { storeId })
        }).toString();
        return handleApiCall(() => api.get(`${API_ENDPOINTS.notifications.analytics}?${params}`));
    },

    // Get notifications for specific store (merchant only)
    async getByStore(storeId, params = {}) {
        const queryParams = new URLSearchParams({
            page: params.page || 1,
            limit: params.limit || 20,
            unreadOnly: params.unreadOnly || false,
        }).toString();
        return handleApiCall(() => api.get(`${API_ENDPOINTS.notifications.byStore(storeId)}?${queryParams}`));
    },

    // Mark single notification as read
    async markAsRead(notificationId) {
        return handleApiCall(() => api.put(API_ENDPOINTS.notifications.markAsRead(notificationId)));
    },

    // Mark all notifications as read with optional filters
    async markAllAsRead(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const url = params
            ? `${API_ENDPOINTS.notifications.markAllAsRead}?${params}`
            : API_ENDPOINTS.notifications.markAllAsRead;
        return handleApiCall(() => api.put(url));
    },

    // Bulk mark notifications as read
    async bulkMarkAsRead(notificationIds) {
        return handleApiCall(() => api.put(API_ENDPOINTS.notifications.bulkMarkRead, { notificationIds }));
    },

    // Delete single notification
    async deleteNotification(notificationId) {
        return handleApiCall(() => api.delete(API_ENDPOINTS.notifications.delete(notificationId)));
    },

    // Bulk delete notifications
    async bulkDelete(notificationIds) {
        return handleApiCall(() => api.delete(API_ENDPOINTS.notifications.bulkDelete, {
            data: { notificationIds }
        }));
    },

    // Create notification (for testing/admin)
    async createNotification(data) {
        return handleApiCall(() => api.post(API_ENDPOINTS.notifications.create, data));
    },

    // Get notification settings
    async getSettings() {
        return handleApiCall(() => api.get(API_ENDPOINTS.notifications.settings));
    },

    // Update notification settings
    async updateSettings(settings) {
        return handleApiCall(() => api.put(API_ENDPOINTS.notifications.updateSettings, settings));
    },

    // Broadcast notification (admin only)
    async broadcast(data) {
        return handleApiCall(() => api.post(API_ENDPOINTS.notifications.broadcast, data));
    },

    // Clean up old notifications (admin only)
    async cleanup(daysOld = 30) {
        return handleApiCall(() => api.delete(`${API_ENDPOINTS.notifications.cleanup}?daysOld=${daysOld}`));
    },

    // Health check
    async healthCheck() {
        return handleApiCall(() => api.get(API_ENDPOINTS.notifications.health));
    },
};

// Enhanced Chat API
export const chatAPI = {
    // Get user conversations (customer view)
    async getUserConversations() {
        return handleApiCall(() => api.get(API_ENDPOINTS.chats.userConversations));
    },

    // Get merchant conversations (merchant view)
    async getMerchantConversations() {
        return handleApiCall(() => api.get(API_ENDPOINTS.chats.merchantConversations));
    },

    // Start new conversation
    async startConversation(storeId, initialMessage = '') {
        return handleApiCall(() => api.post(API_ENDPOINTS.chats.startConversation, {
            storeId,
            initialMessage
        }));
    },

    // Get messages for a conversation
    async getMessages(conversationId, page = 1, limit = 50) {
        const params = new URLSearchParams({ page, limit }).toString();
        return handleApiCall(() => api.get(`${API_ENDPOINTS.chats.getMessages(conversationId)}?${params}`));
    },

    // Send message
    async sendMessage(conversationId, content, messageType = 'text') {
        return handleApiCall(() => api.post(API_ENDPOINTS.chats.sendChatMessage, {
            conversationId,
            content,
            messageType
        }));
    },

    // Update message status
    async updateMessageStatus(messageId, status) {
        return handleApiCall(() => api.put(API_ENDPOINTS.chats.updateMessageStatus(messageId), { status }));
    },

    // Mark messages as read
    async markAsRead(conversationId) {
        return handleApiCall(() => api.put(API_ENDPOINTS.chats.markAsRead(conversationId)));
    },

    // Search conversations
    async searchConversations(query, type = 'all') {
        const params = new URLSearchParams({ query, type }).toString();
        return handleApiCall(() => api.get(`${API_ENDPOINTS.chats.searchConversations}?${params}`));
    },

    // Get chat analytics (merchant only)
    async getAnalytics() {
        return handleApiCall(() => api.get(API_ENDPOINTS.chats.analytics));
    },

    // Legacy support for existing chat endpoints
    async getChats(params = {}) {
        return handleApiCall(() => api.get(API_ENDPOINTS.chats.list, { params }));
    },

    async getChatById(id) {
        if (!id) {
            throw new Error('Chat ID is required');
        }
        return handleApiCall(() => api.get(API_ENDPOINTS.chats.get(id)));
    },

    async getChatMessages(id, params = {}) {
        if (!id) {
            throw new Error('Chat ID is required');
        }
        return handleApiCall(() => api.get(API_ENDPOINTS.chats.messages(id), { params }));
    },

    async sendChatMessage(id, message) {
        if (!id) {
            throw new Error('Chat ID is required');
        }
        if (!message) {
            throw new Error('Message is required');
        }
        return handleApiCall(() => api.post(API_ENDPOINTS.chats.sendMessage(id), { message }));
    },
};

// Booking API with notification support
export const bookingAPI = {
    async getBookings(params = {}) {
        return handleApiCall(() => api.get(API_ENDPOINTS.bookings.list, { params }));
    },

    async getBookingById(id) {
        if (!id) {
            throw new Error('Booking ID is required');
        }
        return handleApiCall(() => api.get(API_ENDPOINTS.bookings.get(id)));
    },

    async createBooking(bookingData) {
        if (!bookingData) {
            throw new Error('Booking data is required');
        }
        return handleApiCall(() => api.post(API_ENDPOINTS.bookings.create, bookingData));
    },

    async cancelBooking(id, reason = '') {
        if (!id) {
            throw new Error('Booking ID is required');
        }
        return handleApiCall(() => api.post(API_ENDPOINTS.bookings.cancel(id), { reason }));
    },

    async confirmBooking(id) {
        if (!id) {
            throw new Error('Booking ID is required');
        }
        return handleApiCall(() => api.post(API_ENDPOINTS.bookings.confirm(id)));
    },

    async completeBooking(id) {
        if (!id) {
            throw new Error('Booking ID is required');
        }
        return handleApiCall(() => api.post(API_ENDPOINTS.bookings.complete(id)));
    },

    async getUserBookings(params = {}) {
        return handleApiCall(() => api.get(API_ENDPOINTS.bookings.userBookings, { params }));
    },

    async getMerchantBookings(params = {}) {
        return handleApiCall(() => api.get(API_ENDPOINTS.bookings.merchantBookings, { params }));
    },
};

// Service Marketplace API
export const marketplaceAPI = {
    // Service Request methods
    requests: {
        async list(params = {}) {
            return handleApiCall(() => api.get(API_ENDPOINTS.marketplace.requests.list, { params }));
        },

        async get(id) {
            if (!id) throw new Error('Request ID is required');
            return handleApiCall(() => api.get(API_ENDPOINTS.marketplace.requests.get(id)));
        },

        async create(data) {
            if (!data) throw new Error('Request data is required');
            return handleApiCall(() => api.post(API_ENDPOINTS.marketplace.requests.create, data));
        },

        async update(id, data) {
            if (!id) throw new Error('Request ID is required');
            if (!data) throw new Error('Request data is required');
            return handleApiCall(() => api.put(API_ENDPOINTS.marketplace.requests.update(id), data));
        },

        async delete(id) {
            if (!id) throw new Error('Request ID is required');
            return handleApiCall(() => api.delete(API_ENDPOINTS.marketplace.requests.delete(id)));
        },
    },

    // Service Offer methods
    offers: {
        async list(params = {}) {
            return handleApiCall(() => api.get(API_ENDPOINTS.marketplace.offers.list, { params }));
        },

        async get(id) {
            if (!id) throw new Error('Offer ID is required');
            return handleApiCall(() => api.get(API_ENDPOINTS.marketplace.offers.get(id)));
        },

        async create(data) {
            if (!data) throw new Error('Offer data is required');
            return handleApiCall(() => api.post(API_ENDPOINTS.marketplace.offers.create, data));
        },

        async accept(id) {
            if (!id) throw new Error('Offer ID is required');
            return handleApiCall(() => api.post(API_ENDPOINTS.marketplace.offers.accept(id)));
        },

        async reject(id, reason = '') {
            if (!id) throw new Error('Offer ID is required');
            return handleApiCall(() => api.post(API_ENDPOINTS.marketplace.offers.reject(id), { reason }));
        },

        async withdraw(id, reason = '') {
            if (!id) throw new Error('Offer ID is required');
            return handleApiCall(() => api.post(API_ENDPOINTS.marketplace.offers.withdraw(id), { reason }));
        },
    },
};

// WebSocket configuration for real-time updates
export const WS_CONFIG = {
    url: process.env.REACT_APP_WS_URL || '${process.env.REACT_APP_API_BASE_URL}',

    events: {
        // Notification events
        NEW_NOTIFICATION: 'new_notification',
        NOTIFICATION_READ: 'notification_read',
        NOTIFICATIONS_BULK_READ: 'notifications_bulk_read',
        NOTIFICATION_DELETED: 'notification_deleted',
        NOTIFICATIONS_BULK_DELETED: 'notifications_bulk_deleted',
        NOTIFICATION_COUNT_UPDATE: 'notification_count_update',

        // Chat events
        NEW_MESSAGE: 'new_message',
        MESSAGE_READ: 'message_read',
        MESSAGES_READ: 'messages_read',
        MESSAGE_STATUS_UPDATE: 'message_status_update',
        NEW_CUSTOMER_STORE_CONVERSATION: 'new_customer_store_conversation',

        // Booking events
        BOOKING_CREATED: 'booking_created',
        BOOKING_CONFIRMED: 'booking_confirmed',
        BOOKING_CANCELLED: 'booking_cancelled',
        BOOKING_COMPLETED: 'booking_completed',

        // Store events
        STORE_ONLINE: 'store_online',
        STORE_OFFLINE: 'store_offline',
        STORE_FOLLOWED: 'store_followed',
        STORE_UNFOLLOWED: 'store_unfollowed',

        // User status events
        USER_ONLINE: 'user_online',
        USER_OFFLINE: 'user_offline',

        // Connection events
        CONNECT: 'connect',
        DISCONNECT: 'disconnect',
        CONNECT_ERROR: 'connect_error',
        RECONNECT: 'reconnect',

        // Room events
        JOIN_NOTIFICATIONS: 'join_notifications',
        JOIN_CHAT: 'join_chat',
        LEAVE_CHAT: 'leave_chat',
        JOIN_STORE: 'join_store',
        LEAVE_STORE: 'leave_store',
    },

    options: {
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
    }
};

// [KEEP ALL EXISTING EXPORTS AND FUNCTIONS BELOW]

// Location API endpoints
export const locationAPI = {
    // Get all available locations from stores and offers
    getAvailableLocations: async () => {
        console.log('📍 Fetching available locations from API...');

        try {
            const response = await api.get(API_ENDPOINTS.locations.available);
            console.log('✅ Available locations response:', response.data);

            return {
                success: true,
                locations: response.data.locations || [],
                message: response.data.message
            };
        } catch (error) {
            console.error('❌ Error fetching available locations:', error);

            // Fallback: Try to get locations from stores endpoint
            try {
                const storeResponse = await api.get(API_ENDPOINTS.stores.locations);
                return {
                    success: true,
                    locations: storeResponse.data.locations || [],
                    message: 'Fetched from stores endpoint'
                };
            } catch (fallbackError) {
                console.error('❌ Fallback location fetch also failed:', fallbackError);
                return {
                    success: false,
                    locations: [],
                    message: error.response?.data?.message || 'Failed to fetch locations'
                };
            }
        }
    },

    // Get location statistics
    getLocationStats: async () => {
        try {
            const response = await api.get(API_ENDPOINTS.locations.stats);
            return {
                success: true,
                stats: response.data.stats || {}
            };
        } catch (error) {
            console.error('❌ Error fetching location stats:', error);
            return {
                success: false,
                stats: {}
            };
        }
    },

    // Reverse geocode coordinates to location name
    reverseGeocode: async (latitude, longitude) => {
        if (!latitude || !longitude) {
            throw new Error('Latitude and longitude are required');
        }

        console.log(`🌍 Reverse geocoding: ${latitude}, ${longitude}`);

        try {
            const response = await api.post(API_ENDPOINTS.locations.reverseGeocode, {
                latitude,
                longitude
            });

            return {
                success: true,
                location: response.data.location,
                nearestAvailableLocation: response.data.nearestAvailableLocation,
                coordinates: response.data.coordinates
            };
        } catch (error) {
            console.error('❌ Backend reverse geocoding failed:', error);

            // Fallback to client-side reverse geocoding
            return await locationAPI.clientReverseGeocode(latitude, longitude);
        }
    },

    // Client-side reverse geocoding fallback
    clientReverseGeocode: async (latitude, longitude) => {
        try {
            console.log('🔄 Using client-side reverse geocoding...');

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
                {
                    headers: {
                        'User-Agent': 'YourApp/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Geocoding request failed');
            }

            const data = await response.json();

            if (data && data.address) {
                const area = data.address.suburb ||
                    data.address.neighbourhood ||
                    data.address.residential ||
                    data.address.commercial ||
                    data.address.city_district ||
                    'Unknown Area';

                const city = data.address.city ||
                    data.address.town ||
                    data.address.municipality ||
                    'Unknown City';

                const locationName = `${area}, ${city}`;

                return {
                    success: true,
                    location: locationName,
                    coordinates: { latitude, longitude }
                };
            }

            throw new Error('No address found in geocoding response');
        } catch (error) {
            console.error('❌ Client-side reverse geocoding failed:', error);

            // Ultimate fallback for Kenya coordinates
            if (latitude >= -4.7 && latitude <= 4.6 && longitude >= 33.9 && longitude <= 41.9) {
                return {
                    success: true,
                    location: 'Nairobi, Kenya',
                    isApproximate: true
                };
            }

            return {
                success: false,
                error: error.message
            };
        }
    }
};

// Offer API endpoints
export const offerAPI = {
    // Get all offers with pagination and filters (including location)
    getOffers: async (params = {}) => {
        return handleApiCall(() => api.get(API_ENDPOINTS.offers.list, { params }));
    },

    // Get random offers (location-aware)
    getRandomOffers: async (limit = 12, location = null) => {
        const params = { limit };
        if (location && location !== 'All Locations') params.location = location;
        return handleApiCall(() => api.get(API_ENDPOINTS.offers.random, { params }));
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
        if (!id || id.trim() === '') {
            throw new Error('Offer ID is required');
        }

        console.log('🔍 Fetching offer by ID:', id);

        try {
            const response = await api.get(API_ENDPOINTS.offers.get(id));
            console.log('✅ Offer API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Offer API error:', error);

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
        return handleApiCall(() => api.post(API_ENDPOINTS.offers.create, offerData));
    },

    // Update offer
    updateOffer: async (id, offerData) => {
        if (!id) {
            throw new Error('Offer ID is required');
        }
        if (!offerData) {
            throw new Error('Offer data is required');
        }
        return handleApiCall(() => api.put(API_ENDPOINTS.offers.update(id), offerData));
    },

    // Delete offer
    deleteOffer: async (id) => {
        if (!id) {
            throw new Error('Offer ID is required');
        }
        return handleApiCall(() => api.delete(API_ENDPOINTS.offers.delete(id)));
    },

    // Get categories with counts (location-aware)
    getCategories: async (location = null) => {
        const params = (location && location !== 'All Locations') ? { location } : {};
        return handleApiCall(() => api.get(API_ENDPOINTS.offers.categories, { params }));
    },

    // Get top deals (location-aware)
    getTopDeals: async (limit = 3, location = null) => {
        const params = { limit };
        if (location && location !== 'All Locations') params.location = location;
        return handleApiCall(() => api.get(API_ENDPOINTS.offers.topDeals, { params }));
    },

    // Get featured offers (location-aware)
    getFeaturedOffers: async (limit = 6, location = null) => {
        const params = { limit };
        if (location && location !== 'All Locations') params.location = location;
        return handleApiCall(() => api.get(API_ENDPOINTS.offers.featured, { params }));
    },
};

// Store API endpoints
export const storeAPI = {
    // Get stores with location filtering
    getStores: async (params = {}) => {
        return handleApiCall(() => api.get(API_ENDPOINTS.stores.list, { params }));
    },

    // Get single store by ID
    getStoreById: async (id) => {
        if (!id) {
            throw new Error('Store ID is required');
        }
        return handleApiCall(() => api.get(API_ENDPOINTS.stores.get(id)));
    },

    // Get stores by location
    getStoresByLocation: async (location, params = {}) => {
        const mergedParams = { ...params };
        if (location && location !== 'All Locations') {
            mergedParams.location = location;
        }
        return handleApiCall(() => api.get(API_ENDPOINTS.stores.list, { params: mergedParams }));
    },

    // Get available store locations
    getStoreLocations: async () => {
        return handleApiCall(() => api.get(API_ENDPOINTS.stores.locations));
    },

    // Get store categories (location-aware)
    getStoreCategories: async (location = null) => {
        const params = (location && location !== 'All Locations') ? { location } : {};
        return handleApiCall(() => api.get(API_ENDPOINTS.stores.categories, { params }));
    },

    // Get random stores (location-aware)
    getRandomStores: async (limit = 21, location = null) => {
        const params = { limit };
        if (location && location !== 'All Locations') params.location = location;
        return handleApiCall(() => api.get('/stores/random', { params }));
    },
};

// Service API endpoints
export const serviceAPI = {
    getServices: async (params = {}) => {
        return handleApiCall(() => api.get(API_ENDPOINTS.services.list, { params }));
    },

    getServiceById: async (id) => {
        if (!id) {
            throw new Error('Service ID is required');
        }
        return handleApiCall(() => api.get(API_ENDPOINTS.services.get(id)));
    },
};

// Favorites API endpoints
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
                const result = await favoritesAPI.isFavorite(offerId);
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

// User API endpoints
export const userAPI = {
    getProfile: async () => {
        return handleApiCall(() => api.get(API_ENDPOINTS.user.profile));
    },

    updateProfile: async (profileData) => {
        return handleApiCall(() => api.put(API_ENDPOINTS.user.profile, profileData));
    },

    login: async (credentials) => {
        return handleApiCall(() => api.post(API_ENDPOINTS.user.login, credentials));
    },

    register: async (userData) => {
        return handleApiCall(() => api.post(API_ENDPOINTS.user.register, userData));
    },

    // Notification settings
    getNotificationSettings: async () => {
        return handleApiCall(() => api.get(API_ENDPOINTS.user.notificationSettings));
    },

    updateNotificationSettings: async (settings) => {
        return handleApiCall(() => api.put(API_ENDPOINTS.user.notificationSettings, settings));
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

// API test function specifically for favorites
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

// Location-aware search functionality
export const searchAPI = {
    // Search stores with location filtering
    searchStores: async (query, location = null, params = {}) => {
        const searchParams = { ...params, search: query };
        if (location && location !== 'All Locations') {
            searchParams.location = location;
        }
        return handleApiCall(() => api.get(API_ENDPOINTS.stores.list, { params: searchParams }));
    },

    // Search offers with location filtering
    searchOffers: async (query, location = null, params = {}) => {
        const searchParams = { ...params, search: query };
        if (location && location !== 'All Locations') {
            searchParams.location = location;
        }
        return handleApiCall(() => api.get(API_ENDPOINTS.offers.list, { params: searchParams }));
    },

    // Combined search
    searchAll: async (query, location = null, params = {}) => {
        try {
            const [storesResult, offersResult] = await Promise.allSettled([
                searchAPI.searchStores(query, location, { ...params, limit: 5 }),
                searchAPI.searchOffers(query, location, { ...params, limit: 5 })
            ]);

            return {
                success: true,
                stores: storesResult.status === 'fulfilled' ? storesResult.value : { stores: [] },
                offers: offersResult.status === 'fulfilled' ? offersResult.value : { offers: [] },
                location: location
            };
        } catch (error) {
            return {
                success: false,
                message: 'Search failed',
                stores: { stores: [] },
                offers: { offers: [] }
            };
        }
    }
};

// Export cookie management functions
export { getTokenFromCookie, setTokenToCookie, removeTokenFromCookie };

export default api;