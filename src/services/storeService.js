// services/storeService.js - Complete fixed version
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
const API_KEY = process.env.REACT_APP_API_KEY || 'API_KEY_12345ABCDEF!@#67890-xyZQvTPOl';

class StoreService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('🏪 StoreService initialized');
    console.log('🌐 Base URL:', this.baseURL);
    console.log('🔑 API Key configured:', API_KEY ? 'Yes' : 'No');
  }

  getAuthToken() {
    // Check multiple possible token storage locations
    return localStorage.getItem('authToken') || 
           localStorage.getItem('access_token') ||
           this.getCookieToken();
  }

  getCookieToken() {
    // Get token from cookie (matching your main auth system)
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('access_token=')
    );
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Always include API key
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
      console.log('ℹ️ No auth token found');
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
      console.log('📊 Data summary:', {
        success: data.success,
        hasStores: !!data.stores,
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

  async getStoreById(id) {
    if (!id) {
      throw new Error('Store ID is required');
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid store ID format');
    }

    console.log(`🏪 Fetching store with ID: ${id}`);
    return this.fetchData(`/stores/${id}`);
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
}

export default new StoreService();