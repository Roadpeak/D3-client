// hooks/useFavorites.js
import { useState, useEffect, useCallback } from 'react';
import { favoritesAPI } from '../services/favoritesService';
import authService from '../services/authService';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all favorites
  const fetchFavorites = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await favoritesAPI.getFavorites();
      
      if (response.success) {
        setFavorites(response.favorites);
        // Create a Set of favorite offer IDs for quick lookups
        const ids = new Set(response.favorites.map(fav => fav.offer_id || fav.id));
        setFavoriteIds(ids);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error in fetchFavorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to favorites
  const addToFavorites = useCallback(async (offerId, offerData = null) => {
    if (!authService.isAuthenticated()) {
      setError('Please log in to add favorites');
      return false;
    }

    try {
      const response = await favoritesAPI.addToFavorites(offerId);
      
      if (response.success) {
        // Update local state
        setFavoriteIds(prev => new Set([...prev, offerId]));
        
        // If we have offer data, add to favorites list
        if (offerData) {
          setFavorites(prev => [...prev, { offer_id: offerId, ...offerData }]);
        }
        
        setError(null);
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      setError('Failed to add to favorites');
      return false;
    }
  }, []);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (offerId) => {
    if (!authService.isAuthenticated()) {
      return false;
    }

    try {
      const response = await favoritesAPI.removeFromFavorites(offerId);
      
      if (response.success) {
        // Update local state
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(offerId);
          return newSet;
        });
        
        setFavorites(prev => prev.filter(fav => (fav.offer_id || fav.id) !== offerId));
        setError(null);
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Failed to remove from favorites');
      return false;
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (offerId, offerData = null) => {
    const isFav = favoriteIds.has(offerId);
    
    if (isFav) {
      return await removeFromFavorites(offerId);
    } else {
      return await addToFavorites(offerId, offerData);
    }
  }, [favoriteIds, addToFavorites, removeFromFavorites]);

  // Check if offer is favorite
  const isFavorite = useCallback((offerId) => {
    return favoriteIds.has(offerId);
  }, [favoriteIds]);

  // Get favorites count
  const getFavoritesCount = useCallback(() => {
    return favorites.length;
  }, [favorites.length]);

  // Load favorites on mount
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    refreshFavorites: fetchFavorites,
    clearError: () => setError(null)
  };
};

export default useFavorites;