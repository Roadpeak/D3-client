// hooks/useFavorites.js - FIXED VERSION - No infinite loops, no auth checks
import { useState, useEffect, useCallback, useRef } from 'react';
import { favoritesAPI } from '../services/api';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Helper function to extract offer ID from favorite object
  const extractOfferId = useCallback((favorite) => {
    // Try multiple possible ID fields based on your API response structure
    const possibleIds = [
      favorite.offer_id,
      favorite.id,
      favorite.offer?.id,
      favorite.offerId,
      // If the API returns nested structure
      favorite.Offer?.id,
      favorite.offer?.offer_id
    ];
    
    // Find the first valid ID
    for (const id of possibleIds) {
      if (id) {
        // REMOVED: Excessive logging that was causing console spam
        return id;
      }
    }
    
    // Only log when there's actually a problem
    console.warn('Could not extract offer ID from favorite:', favorite);
    return null;
  }, []);

  // Fetch all favorites
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await favoritesAPI.getFavorites();
      
      if (response.success && Array.isArray(response.favorites)) {
        setFavorites(response.favorites);
        
        // Extract offer IDs with better error handling
        const extractedIds = response.favorites
          .map(extractOfferId)
          .filter(Boolean); // Remove null/undefined values
        
        const ids = new Set(extractedIds);
        setFavoriteIds(ids);
        setInitialized(true);
        
      } else {
        setFavorites([]);
        setFavoriteIds(new Set());
        setInitialized(true);
        if (response.message && !response.message.includes('No favorites') && !response.message.includes('Authentication required')) {
          setError(response.message);
        }
      }
    } catch (err) {
      console.error('Error in fetchFavorites:', err);
      setError('Failed to load favorites');
      setFavorites([]);
      setFavoriteIds(new Set());
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [extractOfferId]);

  // Add to favorites
  const addToFavorites = useCallback(async (offerId, offerData = null) => {
    if (!offerId) {
      console.error('No offer ID provided to addToFavorites');
      return false;
    }

    try {
      const response = await favoritesAPI.addToFavorites(offerId);
      
      if (response.success) {
        // Update local state immediately for better UX
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.add(offerId);
          return newSet;
        });
        
        // If we have offer data, add to favorites list
        if (offerData) {
          setFavorites(prev => [...prev, { 
            offer_id: offerId, 
            id: offerId,
            ...offerData,
            created_at: new Date().toISOString()
          }]);
        }
        
        setError(null);
        return true;
      } else {
        // Handle "already exists" case gracefully
        if (response.alreadyExists) {
          setFavoriteIds(prev => new Set([...prev, offerId]));
          return true;
        }
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
    if (!offerId) {
      console.error('No offer ID provided to removeFromFavorites');
      return false;
    }

    try {
      const response = await favoritesAPI.removeFromFavorites(offerId);
      
      if (response.success) {
        // Update local state immediately
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(offerId);
          return newSet;
        });
        
        setFavorites(prev => prev.filter(fav => {
          const id = extractOfferId(fav);
          return id !== offerId;
        }));
        
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
  }, [extractOfferId]);

  // Toggle favorite status - FIXED to work properly
  const toggleFavorite = useCallback(async (offerId, offerData = null) => {
    if (!offerId) {
      console.error('No offer ID provided to toggleFavorite');
      return false;
    }

    const isFav = favoriteIds.has(offerId);
    
    if (isFav) {
      return await removeFromFavorites(offerId);
    } else {
      return await addToFavorites(offerId, offerData);
    }
  }, [favoriteIds, addToFavorites, removeFromFavorites]);

  // Check if offer is favorite - REMOVED EXCESSIVE LOGGING
  const isFavorite = useCallback((offerId) => {
    if (!offerId) {
      return false;
    }
    
    // FIXED: No more console.log on every check - this was causing 28k logs!
    return favoriteIds.has(offerId);
  }, [favoriteIds]);

  // Get favorites count
  const getFavoritesCount = useCallback(() => {
    return favorites.length;
  }, [favorites.length]);

  // REMOVED: Auto-fetch on mount was causing issues with unauthenticated users
  // Now components should call refreshFavorites() when they know user is authenticated
  // This prevents unnecessary 401 errors on initial page load

  // Mark as initialized immediately since we're not auto-fetching
  useEffect(() => {
    setInitialized(true);
  }, []);

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    initialized,
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