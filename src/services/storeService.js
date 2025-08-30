// services/storeService.js - UPDATED with top-rated store methods
const API_BASE_URL = process.env.REACT_APP_API_URL || '${process.env.REACT_APP_API_BASE_URL}/api/v1';
const API_KEY = process.env.REACT_APP_API_KEY || 'API_KEY_12345ABCDEF!@#67890-xyZQvTPOl';

class StoreService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('🏪 StoreService initialized');
    console.log('🌐 Base URL:', this.baseURL);
    console.log('🔑 API Key configured:', API_KEY ? 'Yes' : 'No');
  }

  // Get auth token using the same method as your auth service
  getAuthToken() {
    const tokenSources = [
      localStorage.getItem('access_token'),
      localStorage.getItem('authToken'),
      localStorage.getItem('token'),
      this.getCookieToken('access_token'),
      this.getCookieToken('authToken'),
      this.getCookieToken('token')
    ];

    const token = tokenSources.find(t => t && t.trim());

    if (token) {
      console.log('🔐 Auth token found:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No auth token found in any location');
    }

    return token;
  }

  // Get token from cookie
  getCookieToken(name = 'access_token') {
    try {
      if (typeof document === 'undefined') return null;

      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name && value) {
          return decodeURIComponent(value);
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading cookie:', error);
      return null;
    }
  }

  // Get headers with proper auth token inclusion
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['api-key'] = API_KEY;
      console.log('✅ API key added to store service request');
    } else {
      console.warn('⚠️ REACT_APP_API_KEY not found in environment variables');
    }

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Auth token added to request');
    } else {
      console.log('ℹ️ No auth token found for request');
    }

    return headers;
  }

  async fetchData(endpoint, options = {}) {
    try {
      const fullUrl = `${this.baseURL}${endpoint}`;
      console.log(`🔗 Making request to: ${fullUrl}`);
      console.log(`📤 Request method: ${options.method || 'GET'}`);

      const response = await fetch(fullUrl, {
        headers: this.getHeaders(),
        ...options,
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;

        try {
          const errorBody = await response.text();
          console.log('❌ Error response body:', errorBody);

          try {
            errorDetails = JSON.parse(errorBody);
            errorMessage = errorDetails.message || errorMessage;
          } catch (e) {
            errorMessage = errorBody || errorMessage;
          }
        } catch (e) {
          console.error('Could not read error response body:', e);
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }

      const data = await response.json();
      console.log('✅ Response data received successfully');
      return data;

    } catch (error) {
      console.error('🔥 API Error Details:', {
        message: error.message,
        status: error.status,
        endpoint: `${this.baseURL}${endpoint}`,
        name: error.name
      });

      const enhancedError = new Error(error.message);
      enhancedError.originalError = error;
      enhancedError.endpoint = endpoint;
      enhancedError.status = error.status;
      throw enhancedError;
    }
  }

  // NEW: Get most reviewed stores specifically
  async getMostReviewedStores(limit = 8) {
    console.log(`📝 Fetching top ${limit} most reviewed stores`);
    const endpoint = `/stores?sortBy=Most Reviewed&limit=${limit}`;

    try {
      const data = await this.fetchData(endpoint);

      if (data.success && data.stores) {
        console.log(`✅ Successfully fetched ${data.stores.length} most reviewed stores`);
        console.log('📊 Review count distribution:', {
          averageReviews: data.stores.reduce((sum, store) => sum + (parseInt(store.totalReviews) || 0), 0) / data.stores.length,
          highestReviews: Math.max(...data.stores.map(store => parseInt(store.totalReviews) || 0)),
          lowestReviews: Math.min(...data.stores.map(store => parseInt(store.totalReviews) || 0))
        });

        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch most reviewed stores');
      }
    } catch (error) {
      console.error('🔥 Error fetching most reviewed stores:', error);
      throw error;
    }
  }

  // NEW: Get most reviewed stores by category
  async getMostReviewedStoresByCategory(category, limit = 4) {
    console.log(`📝 Fetching top ${limit} most reviewed stores in ${category} category`);
    const endpoint = `/stores?sortBy=Most Reviewed&category=${encodeURIComponent(category)}&limit=${limit}`;

    try {
      const data = await this.fetchData(endpoint);

      if (data.success) {
        console.log(`✅ Successfully fetched ${data.stores?.length || 0} most reviewed ${category} stores`);
        return data;
      } else {
        throw new Error(data.message || `Failed to fetch most reviewed ${category} stores`);
      }
    } catch (error) {
      console.error(`🔥 Error fetching most reviewed ${category} stores:`, error);
      throw error;
    }
  }

  // NEW: Get trending stores (high ratings + recent activity)
  async getTrendingStores(limit = 8) {
    console.log(`📈 Fetching ${limit} trending stores`);

    try {
      // First try to get popular stores, then filter for trending characteristics
      const data = await this.getTopRatedStores(limit * 2); // Get more to filter from

      if (data.success && data.stores) {
        // Filter for stores with good ratings and recent reviews
        const trendingStores = data.stores
          .filter(store => {
            const rating = parseFloat(store.rating) || 0;
            const reviews = parseInt(store.totalReviews) || 0;
            return rating >= 3.5 && reviews > 0; // Basic trending criteria
          })
          .slice(0, limit);

        console.log(`✅ Found ${trendingStores.length} trending stores`);

        return {
          ...data,
          stores: trendingStores
        };
      } else {
        throw new Error('Failed to fetch trending stores');
      }
    } catch (error) {
      console.error('🔥 Error fetching trending stores:', error);
      throw error;
    }
  }

  // Enhanced getStoreById with social links debugging
  async getStoreById(id) {
    if (!id) {
      throw new Error('Store ID is required');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid store ID format');
    }

    console.log(`🏪 Fetching store with ID: ${id}`);
    const data = await this.fetchData(`/stores/${id}`);

    // Debug social links in response
    console.log('🔍 Store data social links debug:', {
      hasSocialLinksRaw: !!(data.store?.socialLinksRaw),
      socialLinksRawCount: data.store?.socialLinksRaw?.length || 0,
      hasSocialLinks: !!(data.store?.socialLinks),
      socialLinksKeys: data.store?.socialLinks ? Object.keys(data.store.socialLinks).filter(key => data.store.socialLinks[key]) : [],
      firstSocialLink: data.store?.socialLinksRaw?.[0] || 'None'
    });

    return data;
  }

  // Your existing methods...
  async getStores(filters = {}) {
    console.log('🏪 StoreService.getStores called with filters:', filters);

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== 'All Locations') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/stores${queryString ? `?${queryString}` : ''}`;

    console.log('📍 Final endpoint:', endpoint);

    return this.fetchData(endpoint);
  }

  async getRandomStores(limit = 21) {
    console.log(`🎲 Fetching ${limit} random stores`);
    return this.fetchData(`/stores/random?limit=${limit}`);
  }

  async getCategories() {
    console.log('📂 Fetching store categories');
    return this.fetchData('/stores/categories');
  }

  async getLocations() {
    console.log('📍 Fetching store locations');
    return this.fetchData('/stores/locations');
  }

  async createStore(storeData) {
    if (!storeData) {
      throw new Error('Store data is required');
    }

    console.log('🏗️ Creating new store:', {
      name: storeData.name,
      category: storeData.category
    });

    return this.fetchData('/stores', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  async updateStore(id, storeData) {
    if (!id) {
      throw new Error('Store ID is required');
    }
    if (!storeData) {
      throw new Error('Store data is required');
    }

    console.log(`✏️ Updating store ${id}`);

    return this.fetchData(`/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
  }

  async deleteStore(id) {
    if (!id) {
      throw new Error('Store ID is required');
    }

    console.log(`🗑️ Deleting store ${id}`);

    return this.fetchData(`/stores/${id}`, {
      method: 'DELETE',
    });
  }

  // NEW: Follow/Unfollow store
  async toggleFollowStore(storeId) {
    if (!storeId) {
      throw new Error('Store ID is required');
    }

    console.log(`💖 Toggling follow for store ${storeId}`);

    return this.fetchData(`/stores/${storeId}/follow`, {
      method: 'POST'
    });
  }

  // NEW: Get followed stores
  async getFollowedStores() {
    console.log('💖 Fetching followed stores');
    return this.fetchData('/stores/followed');
  }

  // NEW: Submit review
  async submitReview(storeId, reviewData) {
    if (!storeId) {
      throw new Error('Store ID is required');
    }
    if (!reviewData || !reviewData.rating) {
      throw new Error('Review data with rating is required');
    }

    console.log(`📝 Submitting review for store ${storeId}`);

    return this.fetchData(`/stores/${storeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async healthCheck() {
    try {
      console.log('🏥 Performing health check');
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
      const isHealthy = response.ok;
      console.log(`🏥 Health check result: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
      return isHealthy;
    } catch (error) {
      console.error('🏥 Health check failed:', error);
      return false;
    }
  }

  async testStoreExists(id) {
    try {
      console.log(`🔍 Testing if store ${id} exists`);
      const response = await fetch(`${this.baseURL}/stores/${id}`, {
        method: 'HEAD',
        headers: this.getHeaders(),
      });
      const exists = response.ok;
      console.log(`🔍 Store ${id} exists: ${exists}`);
      return exists;
    } catch (error) {
      console.error('🔍 Store existence check failed:', error);
      return false;
    }
  }

  async debugConnectivity() {
    console.log('🐛 Running connectivity debug...');

    try {
      // Test 1: Health check
      const isHealthy = await this.healthCheck();
      console.log('🐛 Health check:', isHealthy ? 'PASS' : 'FAIL');

      // Test 2: Categories endpoint
      try {
        const categories = await this.getCategories();
        console.log('🐛 Categories endpoint:', 'PASS', categories);
      } catch (error) {
        console.log('🐛 Categories endpoint:', 'FAIL', error.message);
      }

      // Test 3: Most reviewed stores endpoint
      try {
        const mostReviewedStores = await this.getMostReviewedStores(5);
        console.log('🐛 Most reviewed stores endpoint:', 'PASS', `${mostReviewedStores.stores?.length || 0} stores`);
      } catch (error) {
        console.log('🐛 Most reviewed stores endpoint:', 'FAIL', error.message);
      }

      // Test 4: Stores endpoint
      try {
        const stores = await this.getStores({ limit: 1 });
        console.log('🐛 Stores endpoint:', 'PASS', `${stores.stores?.length || 0} stores`);
      } catch (error) {
        console.log('🐛 Stores endpoint:', 'FAIL', error.message);
      }

    } catch (error) {
      console.error('🐛 Debug connectivity failed:', error);
    }
  }

  // Test authentication
  async testAuthentication() {
    try {
      console.log('🔐 Testing authentication...');

      const token = this.getAuthToken();
      console.log('🎫 Token available:', !!token);

      if (!token) {
        return { authenticated: false, reason: 'No token found' };
      }

      const response = await fetch(`${this.baseURL}/stores/categories`, {
        headers: this.getHeaders()
      });

      console.log('🔐 Auth test response:', response.status);

      return {
        authenticated: response.ok,
        status: response.status,
        reason: response.ok ? 'Valid token' : 'Invalid token'
      };
    } catch (error) {
      console.error('🔐 Auth test failed:', error);
      return { authenticated: false, reason: error.message };
    }
  }
}

// Create instance and export
const storeServiceInstance = new StoreService();
export default storeServiceInstance;