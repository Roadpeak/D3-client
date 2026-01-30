// services/reelsService.js
import { getTokenFromCookie } from '../config/api';

class ReelService {
    constructor() {
        // REACT_APP_API_BASE_URL already includes /api/v1
        this.API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api/v1';
    }

    // Use the same token retrieval as authService and notificationService
    getAuthToken() {
        return getTokenFromCookie();
    }

    getHeaders() {
        const token = this.getAuthToken();

        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': process.env.REACT_APP_API_KEY || '',
        };
    }

    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Get reels feed for customers
     */
    async getReelsFeed(params = {}) {
        try {
            const { limit = 20, offset = 0, location, category, store_id, sort = 'recent' } = params;

            const queryParams = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                sort: sort,
                ...(location && { location }),
                ...(category && { category }),
                ...(store_id && { store_id }),
            });

            console.log('🔍 Fetching reels feed:', queryParams.toString());

            const response = await fetch(`${this.API_BASE}/reels?${queryParams}`, {
                headers: this.getHeaders(),
                credentials: 'include'
            });

            const result = await this.handleResponse(response);
            console.log('✅ Reels feed response:', result);
            return result;
        } catch (error) {
            console.error('❌ Error fetching reels feed:', error);
            throw error;
        }
    }

    /**
     * Get single reel
     */
    async getReel(reelId) {
        try {
            const response = await fetch(`${this.API_BASE}/reels/${reelId}`, {
                headers: this.getHeaders(),
                credentials: 'include'
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching reel:', error);
            throw error;
        }
    }

    /**
     * Toggle like on a reel
     */
    async toggleLike(reelId) {
        try {
            const token = this.getAuthToken();

            if (!token) {
                throw new Error('Authentication required. Please log in to like reels.');
            }

            console.log('❤️ Toggling like for reel:', reelId);

            const response = await fetch(`${this.API_BASE}/reels/${reelId}/like`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            const result = await this.handleResponse(response);
            console.log('✅ Like toggled:', result);
            return result;
        } catch (error) {
            console.error('❌ Error toggling like:', error);
            throw error;
        }
    }

    /**
     * Track reel view
     */
    async trackView(reelId, duration = 0) {
        try {
            console.log('👁️ Tracking view for reel:', reelId);

            const response = await fetch(`${this.API_BASE}/reels/${reelId}/view`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ duration })
            });

            const result = await this.handleResponse(response);
            console.log('✅ View tracked:', result);
            return result;
        } catch (error) {
            console.error('❌ Error tracking view:', error);
            // Don't throw error for view tracking - silent failure
            return { success: false, error: error.message };
        }
    }

    /**
     * Track share
     */
    async trackShare(reelId) {
        try {
            console.log('🔄 Tracking share for reel:', reelId);

            const response = await fetch(`${this.API_BASE}/reels/${reelId}/share`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            const result = await this.handleResponse(response);
            console.log('✅ Share tracked:', result);
            return result;
        } catch (error) {
            console.error('❌ Error tracking share:', error);
            // Don't throw error for share tracking - silent failure
            return { success: false, error: error.message };
        }
    }

    /**
     * Track chat initiation
     */
    async trackChat(reelId) {
        try {
            console.log('💬 Tracking chat for reel:', reelId);

            const response = await fetch(`${this.API_BASE}/reels/${reelId}/chat`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            const result = await this.handleResponse(response);
            console.log('✅ Chat tracked:', result);
            return result;
        } catch (error) {
            console.error('❌ Error tracking chat:', error);
            // Don't throw error for chat tracking - silent failure
            return { success: false, error: error.message };
        }
    }

    /**
     * Get reel analytics (for merchants)
     */
    async getReelAnalytics(reelId) {
        try {
            const response = await fetch(`${this.API_BASE}/reels/${reelId}/analytics`, {
                headers: this.getHeaders(),
                credentials: 'include'
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching reel analytics:', error);
            throw error;
        }
    }

    /**
     * Search reels by query
     */
    async searchReels(query, params = {}) {
        try {
            const { limit = 20, offset = 0 } = params;

            const queryParams = new URLSearchParams({
                q: query,
                limit: limit.toString(),
                offset: offset.toString(),
            });

            const response = await fetch(`${this.API_BASE}/reels/search?${queryParams}`, {
                headers: this.getHeaders(),
                credentials: 'include'
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error searching reels:', error);
            throw error;
        }
    }

    /**
     * Get reels by store
     */
    async getStoreReels(storeId, params = {}) {
        try {
            const { limit = 20, offset = 0 } = params;

            const queryParams = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
            });

            const response = await fetch(`${this.API_BASE}/reels?store_id=${storeId}&${queryParams}`, {
                headers: this.getHeaders(),
                credentials: 'include'
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching store reels:', error);
            throw error;
        }
    }

    /**
     * Get reels by category
     */
    async getCategoryReels(category, params = {}) {
        try {
            const { limit = 20, offset = 0 } = params;

            const queryParams = new URLSearchParams({
                category: category,
                limit: limit.toString(),
                offset: offset.toString(),
            });

            const response = await fetch(`${this.API_BASE}/reels?${queryParams}`, {
                headers: this.getHeaders(),
                credentials: 'include'
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching category reels:', error);
            throw error;
        }
    }

    /**
     * Get trending reels
     */
    async getTrendingReels(params = {}) {
        try {
            const { limit = 20, offset = 0 } = params;

            const queryParams = new URLSearchParams({
                sort: 'trending',
                limit: limit.toString(),
                offset: offset.toString(),
            });

            const response = await fetch(`${this.API_BASE}/reels?${queryParams}`, {
                headers: this.getHeaders(),
                credentials: 'include'
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching trending reels:', error);
            throw error;
        }
    }

    /**
     * Report reel
     */
    async reportReel(reelId, reason, description = '') {
        try {
            const token = this.getAuthToken();

            if (!token) {
                throw new Error('Authentication required to report reels.');
            }

            const response = await fetch(`${this.API_BASE}/reels/${reelId}/report`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ reason, description })
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('Error reporting reel:', error);
            throw error;
        }
    }
}

// Create singleton instance
const reelService = new ReelService();

export default reelService;