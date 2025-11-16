// services/reelService.js - Customer Reel API Service
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api/v1';

class ReelService {
    /**
     * Get authentication headers (optional)
     */
    getAuthHeaders() {
        const token = localStorage.getItem('token') || localStorage.getItem('userToken');

        if (token) {
            return {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-api-key': process.env.REACT_APP_API_KEY || '',
            };
        }

        return {
            'Content-Type': 'application/json',
        };
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

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/reels?${queryParams}`,
                { headers: this.getAuthHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error fetching reels feed:', error);
            throw error.response?.data || error;
        }
    }

    /**
     * Get single reel
     */
    async getReel(reelId) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/reels/${reelId}`,
                { headers: this.getAuthHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error fetching reel:', error);
            throw error.response?.data || error;
        }
    }

    /**
     * Toggle like on reel
     */
    async toggleLike(reelId) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/reels/${reelId}/like`,
                {},
                { headers: this.getAuthHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error.response?.data || error;
        }
    }

    /**
     * Track view
     */
    async trackView(reelId, duration = 0) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/reels/${reelId}/view`,
                { duration },
                { headers: this.getAuthHeaders() }
            );

            return response.data;
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
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/reels/${reelId}/share`,
                {},
                { headers: this.getAuthHeaders() }
            );

            return response.data;
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
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/reels/${reelId}/chat`,
                {},
                { headers: this.getAuthHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error tracking chat:', error);
            // Don't throw error for tracking - fail silently
            return null;
        }
    }
}

export default new ReelService();