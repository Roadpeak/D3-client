// services/reelService.js - Customer Reel API Service
class ReelService {
    constructor() {
        this.API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
    }

    /**
     * Enhanced token retrieval (same as chatService)
     */
    getAuthToken() {
        const getTokenFromCookie = () => {
            if (typeof document === 'undefined') return '';

            const name = 'authToken=';
            const decodedCookie = decodeURIComponent(document.cookie);
            const ca = decodedCookie.split(';');

            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return '';
        };

        const tokenSources = {
            localStorage_access_token: typeof window !== 'undefined' ? localStorage.getItem('access_token') : '',
            localStorage_authToken: typeof window !== 'undefined' ? localStorage.getItem('authToken') : '',
            localStorage_token: typeof window !== 'undefined' ? localStorage.getItem('token') : '',
            cookie_authToken: getTokenFromCookie(),
        };

        return tokenSources.localStorage_access_token ||
            tokenSources.localStorage_authToken ||
            tokenSources.localStorage_token ||
            tokenSources.cookie_authToken;
    }

    /**
     * Get authentication headers
     */
    getHeaders() {
        const token = this.getAuthToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': process.env.REACT_APP_API_KEY || '',
        };
    }

    /**
     * Handle response
     */
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Get reels feed
     */
    async getReelsFeed(params = {}) {
        try {
            const {
                limit = 20,
                offset = 0,
                location,
                category,
                store_id,
                sort = 'recent'
            } = params;

            const queryParams = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                sort,
                ...(location && { location }),
                ...(category && { category }),
                ...(store_id && { store_id }),
            });

            const response = await fetch(
                `${this.API_BASE}/api/v1/reels?${queryParams}`,
                {
                    headers: this.getHeaders(),
                    credentials: 'include'
                }
            );

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching reels feed:', error);
            throw error;
        }
    }

    /**
     * Get single reel
     */
    async getReel(reelId) {
        try {
            const response = await fetch(
                `${this.API_BASE}/api/v1/reels/${reelId}`,
                {
                    headers: this.getHeaders(),
                    credentials: 'include'
                }
            );

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching reel:', error);
            throw error;
        }
    }

    /**
     * Toggle like on reel
     */
    async toggleLike(reelId) {
        try {
            const response = await fetch(
                `${this.API_BASE}/api/v1/reels/${reelId}/like`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    credentials: 'include',
                    body: JSON.stringify({})
                }
            );

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    }

    /**
     * Track view
     */
    async trackView(reelId, duration = 0) {
        try {
            const response = await fetch(
                `${this.API_BASE}/api/v1/reels/${reelId}/view`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    credentials: 'include',
                    body: JSON.stringify({ duration })
                }
            );

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error tracking view:', error);
            // Don't throw error for tracking - fail silently
            return null;
        }
    }

    /**
     * Track share
     */
    async trackShare(reelId) {
        try {
            const response = await fetch(
                `${this.API_BASE}/api/v1/reels/${reelId}/share`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    credentials: 'include',
                    body: JSON.stringify({})
                }
            );

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error tracking share:', error);
            // Don't throw error for tracking - fail silently
            return null;
        }
    }

    /**
     * Track chat initiation
     */
    async trackChat(reelId) {
        try {
            const response = await fetch(
                `${this.API_BASE}/api/v1/reels/${reelId}/chat`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    credentials: 'include',
                    body: JSON.stringify({})
                }
            );

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error tracking chat:', error);
            // Don't throw error for tracking - fail silently
            return null;
        }
    }
}

// Create and export instance
const reelService = new ReelService();
export default reelService;