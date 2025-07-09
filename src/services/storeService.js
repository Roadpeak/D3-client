const API_BASE_URL = 'http://localhost:4000/api/v1';

class StoreService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async fetchData(endpoint, options = {}) {
    try {
      console.log(`Making request to: ${this.baseURL}${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders(),
        ...options,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        // Try to get error details from response body
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;
        
        try {
          const errorBody = await response.text();
          console.log('Error response body:', errorBody);
          
          // Try to parse as JSON
          try {
            errorDetails = JSON.parse(errorBody);
            errorMessage = errorDetails.message || errorMessage;
          } catch (e) {
            // If not JSON, use the text as is
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
      console.log('Response data received:', data);
      return data;
      
    } catch (error) {
      console.error('API Error Details:', {
        message: error.message,
        status: error.status,
        endpoint: `${this.baseURL}${endpoint}`,
        stack: error.stack
      });
      
      // Re-throw with additional context
      const enhancedError = new Error(error.message);
      enhancedError.originalError = error;
      enhancedError.endpoint = endpoint;
      enhancedError.status = error.status;
      throw enhancedError;
    }
  }

  async getStores(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== 'All Locations') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    return this.fetchData(`/stores${queryString ? `?${queryString}` : ''}`);
  }

  async getStoreById(id) {
    // Validate ID format
    if (!id) {
      throw new Error('Store ID is required');
    }
    
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid store ID format');
    }

    console.log(`Fetching store with ID: ${id}`);
    return this.fetchData(`/stores/${id}`);
  }

  async getRandomStores(limit = 21) {
    return this.fetchData(`/stores/random?limit=${limit}`);
  }

  async getCategories() {
    return this.fetchData('/stores/categories');
  }

  async getLocations() {
    return this.fetchData('/stores/locations');
  }

  async createStore(storeData) {
    if (!storeData) {
      throw new Error('Store data is required');
    }
    
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
    
    return this.fetchData(`/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
  }

  async deleteStore(id) {
    if (!id) {
      throw new Error('Store ID is required');
    }
    
    return this.fetchData(`/stores/${id}`, {
      method: 'DELETE',
    });
  }

  // Helper method to check if server is reachable
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Helper method to test specific store ID
  async testStoreExists(id) {
    try {
      const response = await fetch(`${this.baseURL}/stores/${id}`, {
        method: 'HEAD', // Only check if exists, don't fetch full data
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Store existence check failed:', error);
      return false;
    }
  }
}

export default new StoreService();