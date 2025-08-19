// hooks/useFavorites.js - TRULY FIXED VERSION with proper ID extraction
import { useState, useEffect, useCallback } from 'react';
import { favoritesAPI } from '../services/api';
import authService from '../services/authService';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Helper function to extract offer ID from favorite object
  const extractOfferId = (favorite) => {
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
        console.log('🔍 Extracted offer ID:', id, 'from favorite:', favorite);
        return id;
      }
    }
    
    console.warn('⚠️ Could not extract offer ID from favorite:', favorite);
    return null;
  };

  // Fetch all favorites
  const fetchFavorites = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      console.log('🔒 User not authenticated, clearing favorites');
      setFavorites([]);
      setFavoriteIds(new Set());
      setInitialized(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching favorites from API...');
      const response = await favoritesAPI.getFavorites();
      console.log('📥 Favorites API response:', response);
      
      if (response.success && Array.isArray(response.favorites)) {
        console.log('✅ Processing favorites:', response.favorites.length, 'items');
        
        setFavorites(response.favorites);
        
        // Extract offer IDs with better error handling
        const extractedIds = response.favorites
          .map(extractOfferId)
          .filter(Boolean); // Remove null/undefined values
        
        const ids = new Set(extractedIds);
        
        console.log('📋 Extracted favorite IDs:', Array.from(ids));
        console.log('🔢 Total favorites:', response.favorites.length, 'Extracted IDs:', ids.size);
        
        setFavoriteIds(ids);
        setInitialized(true);
        
        // Debug: log each favorite and its extracted ID
        response.favorites.forEach((fav, index) => {
          const id = extractOfferId(fav);
          console.log(`Favorite ${index + 1}:`, {
            structure: Object.keys(fav),
            extractedId: id,
            rawFavorite: fav
          });
        });
        
      } else {
        console.log('⚠️ No favorites found or API error:', response.message);
        setFavorites([]);
        setFavoriteIds(new Set());
        setInitialized(true);
        if (response.message && !response.message.includes('No favorites') && !response.message.includes('Authentication required')) {
          setError(response.message);
        }
      }
    } catch (err) {
      console.error('❌ Error in fetchFavorites:', err);
      setError('Failed to load favorites');
      setFavorites([]);
      setFavoriteIds(new Set());
      setInitialized(true);
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

    if (!offerId) {
      console.error('❌ No offer ID provided to addToFavorites');
      return false;
    }

    try {
      console.log('💖 Adding offer to favorites:', offerId);
      const response = await favoritesAPI.addToFavorites(offerId);
      
      if (response.success) {
        // Update local state immediately for better UX
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.add(offerId);
          console.log('✅ Updated favoriteIds (add):', Array.from(newSet));
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
        console.log('✅ Successfully added to favorites');
        return true;
      } else {
        // Handle "already exists" case gracefully
        if (response.alreadyExists) {
          console.log('ℹ️ Offer already in favorites, updating local state');
          setFavoriteIds(prev => new Set([...prev, offerId]));
          return true;
        }
        setError(response.message);
        return false;
      }
    } catch (err) {
      console.error('❌ Error adding to favorites:', err);
      setError('Failed to add to favorites');
      return false;
    }
  }, []);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (offerId) => {
    if (!authService.isAuthenticated()) {
      return false;
    }

    if (!offerId) {
      console.error('❌ No offer ID provided to removeFromFavorites');
      return false;
    }

    try {
      console.log('💔 Removing offer from favorites:', offerId);
      const response = await favoritesAPI.removeFromFavorites(offerId);
      
      if (response.success) {
        // Update local state immediately
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(offerId);
          console.log('✅ Updated favoriteIds (remove):', Array.from(newSet));
          return newSet;
        });
        
        setFavorites(prev => prev.filter(fav => {
          const id = extractOfferId(fav);
          return id !== offerId;
        }));
        
        setError(null);
        console.log('✅ Successfully removed from favorites');
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      console.error('❌ Error removing from favorites:', err);
      setError('Failed to remove from favorites');
      return false;
    }
  }, []);

  // Toggle favorite status - FIXED to work properly
  const toggleFavorite = useCallback(async (offerId, offerData = null) => {
    if (!offerId) {
      console.error('❌ No offer ID provided to toggleFavorite');
      return false;
    }

    const isFav = favoriteIds.has(offerId);
    console.log(`🔄 Toggling favorite: ${offerId} (currently ${isFav ? 'favorited' : 'not favorited'})`);
    
    if (isFav) {
      return await removeFromFavorites(offerId);
    } else {
      return await addToFavorites(offerId, offerData);
    }
  }, [favoriteIds, addToFavorites, removeFromFavorites]);

  // Check if offer is favorite - WITH DEBUGGING
  const isFavorite = useCallback((offerId) => {
    if (!offerId) {
      return false;
    }
    
    const result = favoriteIds.has(offerId);
    console.log(`🔍 Checking isFavorite for ${offerId}:`, result, 'in set:', Array.from(favoriteIds));
    return result;
  }, [favoriteIds]);

  // Get favorites count
  const getFavoritesCount = useCallback(() => {
    return favorites.length;
  }, [favorites.length]);

  // Initialize favorites on mount - ONLY ONCE
  useEffect(() => {
    let mounted = true;
    
    const initFavorites = async () => {
      if (mounted) {
        console.log('🚀 Initializing favorites hook...');
        await fetchFavorites();
      }
    };
    
    // Initialize regardless of auth status (fetchFavorites handles auth internally)
    initFavorites();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Debug log when favoriteIds changes
  useEffect(() => {
    console.log('🔄 FavoriteIds updated:', Array.from(favoriteIds));
  }, [favoriteIds]);

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