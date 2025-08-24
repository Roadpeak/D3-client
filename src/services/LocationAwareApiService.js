import api from '../config/api';

// API Service with location support
class LocationAwareApiService {
  constructor() {
    this.currentLocation = 'All Locations'; // FIXED: Default to "All Locations"
  }

  // Set current location for all subsequent API calls
  setCurrentLocation(location) {
    this.currentLocation = location || 'All Locations'; // FIXED: Fallback to "All Locations"
    console.log('🔄 API Service location updated to:', this.currentLocation);
  }

  // Get current location
  getCurrentLocation() {
    return this.currentLocation;
  }

  // FIXED: Helper to add location parameter to API calls
  addLocationParams(params = {}) {
    // Only add location parameter if it's not "All Locations"
    if (this.currentLocation && this.currentLocation !== 'All Locations') {
      console.log('📍 Adding location filter:', this.currentLocation);
      return { ...params, location: this.currentLocation };
    }
    
    console.log('🌍 Using all locations (no filter)');
    return params;
  }

  // STORES API METHODS
  async getStores(params = {}) {
    try {
      const locationParams = this.addLocationParams(params);
      console.log('🏪 API Call Debug:', {
        originalParams: params,
        locationParams: locationParams,
        currentServiceLocation: this.currentLocation,
        hasLocationFilter: this.hasLocationFilter()
      });
      
      const response = await api.get('/stores', { params: locationParams });
      
      console.log('🏪 API Response Debug:', {
        storesReceived: response.data.stores?.length || 0,
        totalItems: response.data.pagination?.totalItems || 0,
        locationFilter: locationParams.location || 'None (All Locations)',
        firstStore: response.data.stores?.[0]?.name || 'None'
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Store API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching stores',
        error
      };
    }
  }

  async getRandomStores(limit = 21) {
    try {
      const locationParams = this.addLocationParams({ limit });
      console.log('🎲 Fetching random stores with params:', locationParams);
      
      const response = await api.get('/stores/random', { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching random stores:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching random stores',
        error
      };
    }
  }

  async getStoreById(storeId) {
    try {
      console.log('🔍 Fetching store by ID:', storeId);
      
      const response = await api.get(`/stores/${storeId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching store:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching store',
        error
      };
    }
  }

  async followStore(storeId) {
    try {
      const response = await api.post(`/stores/${storeId}/follow`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error following store:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error following store',
        error
      };
    }
  }

  async getStoreCategories() {
    try {
      const locationParams = this.addLocationParams();
      console.log('📂 Fetching store categories with params:', locationParams);
      
      const response = await api.get('/stores/categories', { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching store categories:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching categories',
        error
      };
    }
  }

  async getStoreLocations() {
    try {
      const response = await api.get('/stores/locations');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching store locations:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching locations',
        error
      };
    }
  }

  // OFFERS API METHODS
  async getOffers(params = {}) {
    try {
      const locationParams = this.addLocationParams(params);
      console.log('🎯 Fetching offers with params:', locationParams);
      
      const response = await api.get('/offers', { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching offers:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching offers',
        error
      };
    }
  }

  async getRandomOffers(limit = 12) {
    try {
      const locationParams = this.addLocationParams({ limit });
      console.log('🎲 Fetching random offers with params:', locationParams);
      
      const response = await api.get('/offers/random', { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching random offers:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching random offers',
        error
      };
    }
  }

  async getOfferById(offerId) {
    try {
      console.log('🔍 Fetching offer by ID:', offerId);
      
      const response = await api.get(`/offers/${offerId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching offer:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching offer',
        error
      };
    }
  }

  async getOffersByStore(storeId, params = {}) {
    try {
      const locationParams = this.addLocationParams(params);
      console.log('🏪 Fetching offers by store with params:', locationParams);
      
      const response = await api.get(`/offers/store/${storeId}`, { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching offers by store:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching offers by store',
        error
      };
    }
  }

  async getTopDeals(limit = 3) {
    try {
      const locationParams = this.addLocationParams({ limit });
      console.log('🔥 Fetching top deals with params:', locationParams);
      
      const response = await api.get('/offers/top-deals', { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching top deals:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching top deals',
        error
      };
    }
  }

  async getFeaturedOffers(limit = 6) {
    try {
      const locationParams = this.addLocationParams({ limit });
      console.log('⭐ Fetching featured offers with params:', locationParams);
      
      const response = await api.get('/offers/featured', { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching featured offers:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching featured offers',
        error
      };
    }
  }

  async getOfferCategories() {
    try {
      const locationParams = this.addLocationParams();
      console.log('📂 Fetching offer categories with params:', locationParams);
      
      const response = await api.get('/offers/categories', { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching offer categories:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching offer categories',
        error
      };
    }
  }

  async getOfferStats(storeId = null) {
    try {
      const locationParams = this.addLocationParams();
      console.log('📊 Fetching offer stats with params:', locationParams);
      
      const url = storeId ? `/offers/stats/${storeId}` : '/offers/stats';
      const response = await api.get(url, { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching offer stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching offer stats',
        error
      };
    }
  }

  // SEARCH METHODS
  async searchStores(query, params = {}) {
    try {
      const locationParams = this.addLocationParams({ ...params, search: query });
      console.log('🔍 Searching stores with params:', locationParams);
      
      const response = await api.get('/stores', { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error searching stores:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error searching stores',
        error
      };
    }
  }

  async searchOffers(query, params = {}) {
    try {
      const locationParams = this.addLocationParams({ ...params, search: query });
      console.log('🔍 Searching offers with params:', locationParams);
      
      const response = await api.get('/offers', { params: locationParams });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error searching offers:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error searching offers',
        error
      };
    }
  }

  // COMBINED SEARCH METHOD
  async search(query, type = 'all', params = {}) {
    try {
      const locationParams = this.addLocationParams({ ...params, search: query, type });
      console.log('🔍 Global search with params:', locationParams);
      
      if (type === 'stores') {
        return await this.searchStores(query, params);
      } else if (type === 'offers') {
        return await this.searchOffers(query, params);
      } else {
        // Combined search - search both stores and offers
        const [storesResult, offersResult] = await Promise.allSettled([
          this.searchStores(query, { ...params, limit: 5 }),
          this.searchOffers(query, { ...params, limit: 5 })
        ]);

        return {
          success: true,
          data: {
            stores: storesResult.status === 'fulfilled' ? storesResult.value.data : { stores: [] },
            offers: offersResult.status === 'fulfilled' ? offersResult.value.data : { offers: [] },
            location: this.currentLocation
          }
        };
      }
    } catch (error) {
      console.error('Error in global search:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error searching',
        error
      };
    }
  }

  // UTILITY METHODS
  async healthCheck() {
    try {
      const response = await api.get('/offers/health');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        message: 'API health check failed',
        error
      };
    }
  }

  // FIXED: Clear location (reset to "All Locations")
  clearLocation() {
    this.currentLocation = 'All Locations';
  }

  // FIXED: Check if location filtering is active
  hasLocationFilter() {
    return this.currentLocation && this.currentLocation !== 'All Locations';
  }

  // FIXED: Get formatted location for display
  getLocationDisplay() {
    if (!this.currentLocation || this.currentLocation === 'All Locations') {
      return 'All Locations';
    }
    return this.currentLocation.split(',')[0]; // Return just the area name
  }
}

// Create and export a singleton instance
const locationAwareApiService = new LocationAwareApiService();

// Export individual methods for easier importing
export const {
  setCurrentLocation,
  getCurrentLocation,
  getStores,
  getRandomStores,
  getStoreById,
  followStore,
  getStoreCategories,
  getStoreLocations,
  getOffers,
  getRandomOffers,
  getOfferById,
  getOffersByStore,
  getTopDeals,
  getFeaturedOffers,
  getOfferCategories,
  getOfferStats,
  searchStores,
  searchOffers,
  search,
  healthCheck,
  clearLocation,
  hasLocationFilter,
  getLocationDisplay
} = locationAwareApiService;

export default locationAwareApiService;