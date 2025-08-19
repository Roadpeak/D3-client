// services/favoritesService.js - Updated to match your API structure
import api from '../config/api';

export const favoritesAPI = {
  // Get user's favorite offers
  // Calls: GET /api/v1/users/favorites
  getFavorites: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.category) queryParams.append('category', params.category);
      
      const url = `/users/favorites${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('Fetching favorites from:', url);
      
      const response = await api.get(url);
      return {
        success: true,
        favorites: response.data.favorites || response.data.data || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch favorites',
        favorites: [],
        pagination: {}
      };
    }
  },

  // Add offer to favorites
  // Calls: POST /api/v1/offers/:offerId/favorite
  addToFavorites: async (offerId) => {
    try {
      console.log('Adding to favorites:', offerId);
      const response = await api.post(`/offers/${offerId}/favorite`);
      return {
        success: true,
        message: response.data.message || 'Added to favorites',
        data: response.data
      };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to favorites'
      };
    }
  },

  // Remove offer from favorites
  // Calls: DELETE /api/v1/offers/:offerId/favorite
  removeFromFavorites: async (offerId) => {
    try {
      console.log('Removing from favorites:', offerId);
      const response = await api.delete(`/offers/${offerId}/favorite`);
      return {
        success: true,
        message: response.data.message || 'Removed from favorites',
        data: response.data
      };
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from favorites'
      };
    }
  },

  // Toggle favorite status
  // Calls: POST /api/v1/offers/:offerId/favorite/toggle
  toggleFavorite: async (offerId) => {
    try {
      console.log('Toggling favorite:', offerId);
      const response = await api.post(`/offers/${offerId}/favorite/toggle`);
      return {
        success: true,
        action: response.data.action,
        message: response.data.message || 'Favorite status updated',
        data: response.data
      };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update favorite'
      };
    }
  },

  // Check if offer is in favorites
  // Calls: GET /api/v1/offers/:offerId/favorite/status
  isFavorite: async (offerId) => {
    try {
      const response = await api.get(`/offers/${offerId}/favorite/status`);
      return {
        success: true,
        isFavorite: response.data.isFavorite || false
      };
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return {
        success: false,
        isFavorite: false
      };
    }
  },

  // Get favorites count
  // Calls: GET /api/v1/users/favorites/count
  getFavoritesCount: async () => {
    try {
      const response = await api.get('/users/favorites/count');
      return {
        success: true,
        count: response.data.count || 0
      };
    } catch (error) {
      console.error('Error fetching favorites count:', error);
      return {
        success: false,
        count: 0
      };
    }
  }
};

export default favoritesAPI;