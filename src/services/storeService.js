// services/storeService.js - FIXED version with proper authentication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
const API_KEY = process.env.REACT_APP_API_KEY || 'API_KEY_12345ABCDEF!@#67890-xyZQvTPOl';

class StoreService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('🏪 StoreService initialized');
    console.log('🌐 Base URL:', this.baseURL);
    console.log('🔑 API Key configured:', API_KEY ? 'Yes' : 'No');
  }

  // FIXED: Get auth token using the same method as your auth service
  getAuthToken() {
    // Priority order matching your auth service
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

  // FIXED: Get token from cookie (matching your auth system)
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

  // FIXED: Get headers with proper auth token inclusion
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Always include API key if available
    if (API_KEY) {
      headers['api-key'] = API_KEY;
      console.log('✅ API key added to store service request');
    } else {
      console.warn('⚠️ REACT_APP_API_KEY not found in environment variables');
    }

    // Include auth token if available
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Auth token added to request');
    } else {
      console.log('ℹ️ No auth token found for request');
    }

    console.log('📋 Final headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': headers['Authorization'] ? 'Bearer [TOKEN]' : 'Not set',
      'api-key': headers['api-key'] ? '[API_KEY]' : 'Not set'
    });

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
      console.log('📊 Data summary:', {
        success: data.success,
        hasStore: !!data.store,
        hasStores: !!data.stores,
        socialLinksCount: data.store?.socialLinksRaw?.length || 0,
        storesCount: data.stores?.length,
        hasPagination: !!data.pagination
      });
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

  // FIXED: Enhanced getStoreById with social links debugging
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

  // Your existing methods remain the same...
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
      
      // Test 3: Stores endpoint
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

  // FIXED: Add method to test authentication
  async testAuthentication() {
    try {
      console.log('🔐 Testing authentication...');
      
      const token = this.getAuthToken();
      console.log('🎫 Token available:', !!token);
      
      if (!token) {
        return { authenticated: false, reason: 'No token found' };
      }

      // Test with a simple authenticated endpoint
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