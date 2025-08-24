import { useState, useEffect, useCallback } from 'react';
import { useLocation } from '../contexts/LocationContext';
import locationAwareApiService from '../services/LocationAwareApiService'; // Fixed: Capital L

// Custom hook for location-aware API calls
export const useLocationAwareApi = () => {
  const { currentLocation } = useLocation();
  
  // Update the API service whenever location changes
  useEffect(() => {
    console.log('🔄 Syncing API service location:', currentLocation);
    locationAwareApiService.setCurrentLocation(currentLocation);
    
    // Verify sync worked
    const apiLocation = locationAwareApiService.getCurrentLocation();
    console.log('✅ API service location after sync:', apiLocation);
    
    if (apiLocation !== currentLocation) {
      console.warn('⚠️ Location sync mismatch!', { context: currentLocation, api: apiLocation });
    }
  }, [currentLocation]);

  return locationAwareApiService;
};

// Custom hook for fetching stores with location filtering
export const useLocationStores = (filters = {}) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  const { currentLocation } = useLocation();
  const apiService = useLocationAwareApi();

  const fetchStores = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...filters, ...params };
      console.log('🏪 Fetching stores for location:', currentLocation, 'with params:', mergedParams);
      
      const result = await apiService.getStores(mergedParams);
      
      if (result.success) {
        setStores(result.data.stores || []);
        setPagination(result.data.pagination || null);
      } else {
        setError(result.message);
        setStores([]);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to fetch stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, filters, apiService]);

  // Fetch stores when location or filters change
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Listen for location change events from navbar
  useEffect(() => {
    const handleLocationChange = (event) => {
      console.log('📍 Location change event received:', event.detail);
      fetchStores();
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, [fetchStores]);

  const refreshStores = useCallback(() => {
    fetchStores();
  }, [fetchStores]);

  const loadMore = useCallback(async () => {
    if (!pagination || !pagination.hasNextPage) return;
    
    try {
      const result = await apiService.getStores({
        ...filters,
        page: pagination.currentPage + 1
      });
      
      if (result.success && result.data.stores) {
        setStores(prev => [...prev, ...result.data.stores]);
        setPagination(result.data.pagination);
      }
    } catch (err) {
      console.error('Error loading more stores:', err);
    }
  }, [pagination, filters, apiService]);

  return {
    stores,
    loading,
    error,
    pagination,
    refreshStores,
    loadMore,
    currentLocation
  };
};

// Custom hook for fetching offers with location filtering
export const useLocationOffers = (filters = {}) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  const { currentLocation } = useLocation();
  const apiService = useLocationAwareApi();

  const fetchOffers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...filters, ...params };
      console.log('🎯 Fetching offers for location:', currentLocation, 'with params:', mergedParams);
      
      const result = await apiService.getOffers(mergedParams);
      
      if (result.success) {
        setOffers(result.data.offers || []);
        setPagination(result.data.pagination || null);
      } else {
        setError(result.message);
        setOffers([]);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to fetch offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, filters, apiService]);

  // Fetch offers when location or filters change
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Listen for location change events from navbar
  useEffect(() => {
    const handleLocationChange = (event) => {
      console.log('📍 Location change event received:', event.detail);
      fetchOffers();
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, [fetchOffers]);

  const refreshOffers = useCallback(() => {
    fetchOffers();
  }, [fetchOffers]);

  const loadMore = useCallback(async () => {
    if (!pagination || !pagination.hasNextPage) return;
    
    try {
      const result = await apiService.getOffers({
        ...filters,
        page: pagination.currentPage + 1
      });
      
      if (result.success && result.data.offers) {
        setOffers(prev => [...prev, ...result.data.offers]);
        setPagination(result.data.pagination);
      }
    } catch (err) {
      console.error('Error loading more offers:', err);
    }
  }, [pagination, filters, apiService]);

  return {
    offers,
    loading,
    error,
    pagination,
    refreshOffers,
    loadMore,
    currentLocation
  };
};

// Custom hook for random stores with location
export const useRandomStores = (limit = 21) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentLocation } = useLocation();
  const apiService = useLocationAwareApi();

  const fetchRandomStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎲 Fetching random stores for location:', currentLocation);
      
      const result = await apiService.getRandomStores(limit);
      
      if (result.success) {
        setStores(result.data.stores || []);
      } else {
        setError(result.message);
        setStores([]);
      }
    } catch (err) {
      console.error('Error fetching random stores:', err);
      setError('Failed to fetch random stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, limit, apiService]);

  useEffect(() => {
    fetchRandomStores();
  }, [fetchRandomStores]);

  // Listen for location change events
  useEffect(() => {
    const handleLocationChange = () => {
      fetchRandomStores();
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, [fetchRandomStores]);

  return { stores, loading, error, refresh: fetchRandomStores };
};

// Custom hook for random offers with location
export const useRandomOffers = (limit = 12) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentLocation } = useLocation();
  const apiService = useLocationAwareApi();

  const fetchRandomOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎲 Fetching random offers for location:', currentLocation);
      
      const result = await apiService.getRandomOffers(limit);
      
      if (result.success) {
        setOffers(result.data.offers || []);
      } else {
        setError(result.message);
        setOffers([]);
      }
    } catch (err) {
      console.error('Error fetching random offers:', err);
      setError('Failed to fetch random offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, limit, apiService]);

  useEffect(() => {
    fetchRandomOffers();
  }, [fetchRandomOffers]);

  // Listen for location change events
  useEffect(() => {
    const handleLocationChange = () => {
      fetchRandomOffers();
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, [fetchRandomOffers]);

  return { offers, loading, error, refresh: fetchRandomOffers };
};

// Custom hook for top deals with location
export const useTopDeals = (limit = 3) => {
  const [topDeals, setTopDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentLocation } = useLocation();
  const apiService = useLocationAwareApi();

  const fetchTopDeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getTopDeals(limit);
      
      if (result.success) {
        setTopDeals(result.data.topDeals || []);
      } else {
        setError(result.message);
        setTopDeals([]);
      }
    } catch (err) {
      console.error('Error fetching top deals:', err);
      setError('Failed to fetch top deals');
      setTopDeals([]);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, limit, apiService]);

  useEffect(() => {
    fetchTopDeals();
  }, [fetchTopDeals]);

  // Listen for location change events
  useEffect(() => {
    const handleLocationChange = () => {
      fetchTopDeals();
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, [fetchTopDeals]);

  return { topDeals, loading, error, refresh: fetchTopDeals };
};

// Custom hook for featured offers with location
export const useFeaturedOffers = (limit = 6) => {
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentLocation } = useLocation();
  const apiService = useLocationAwareApi();

  const fetchFeaturedOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getFeaturedOffers(limit);
      
      if (result.success) {
        setFeaturedOffers(result.data.offers || []);
      } else {
        setError(result.message);
        setFeaturedOffers([]);
      }
    } catch (err) {
      console.error('Error fetching featured offers:', err);
      setError('Failed to fetch featured offers');
      setFeaturedOffers([]);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, limit, apiService]);

  useEffect(() => {
    fetchFeaturedOffers();
  }, [fetchFeaturedOffers]);

  // Listen for location change events
  useEffect(() => {
    const handleLocationChange = () => {
      fetchFeaturedOffers();
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, [fetchFeaturedOffers]);

  return { featuredOffers, loading, error, refresh: fetchFeaturedOffers };
};

// Custom hook for location-aware search
export const useLocationSearch = () => {
  const [searchResults, setSearchResults] = useState({ stores: [], offers: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { currentLocation } = useLocation();
  const apiService = useLocationAwareApi();

  const search = useCallback(async (query, type = 'all', params = {}) => {
    if (!query.trim()) {
      setSearchResults({ stores: [], offers: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Searching for:', query, 'in location:', currentLocation);
      
      const result = await apiService.search(query, type, params);
      
      if (result.success) {
        if (type === 'stores') {
          setSearchResults({ stores: result.data.stores || [], offers: [] });
        } else if (type === 'offers') {
          setSearchResults({ stores: [], offers: result.data.offers || [] });
        } else {
          setSearchResults({
            stores: result.data.stores?.stores || [],
            offers: result.data.offers?.offers || []
          });
        }
      } else {
        setError(result.message);
        setSearchResults({ stores: [], offers: [] });
      }
    } catch (err) {
      console.error('Error searching:', err);
      setError('Search failed');
      setSearchResults({ stores: [], offers: [] });
    } finally {
      setLoading(false);
    }
  }, [currentLocation, apiService]);

  const clearSearch = useCallback(() => {
    setSearchResults({ stores: [], offers: [] });
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    search,
    clearSearch,
    currentLocation
  };
};

// Export all hooks
export default useLocationAwareApi;