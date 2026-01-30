// services/storeService.js - SECURE VERSION (No exposed API keys)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.discoun3ree.com/api/v1';

class StoreService {
  constructor() {
    this.baseURL = API_BASE_URL;

    // SECURE: Only check if key exists, don't expose it
    const hasApiKey = !!process.env.REACT_APP_API_KEY;
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
      return null;
    }
  }

  // SECURE: Get headers without exposing API key
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // SECURE: Only add API key if it exists in environment
    if (process.env.REACT_APP_API_KEY) {
      headers['x-api-key'] = process.env.REACT_APP_API_KEY;
    }

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async fetchData(endpoint, options = {}) {
    try {
      const fullUrl = `${this.baseURL}${endpoint}`;

      const response = await fetch(fullUrl, {
        headers: this.getHeaders(),
        credentials: 'include', // Send HttpOnly cookies with requests
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;

        try {
          const errorBody = await response.text();

          try {
            errorDetails = JSON.parse(errorBody);
            errorMessage = errorDetails.message || errorMessage;
          } catch (e) {
            errorMessage = errorBody || errorMessage;
          }
        } catch (e) {
          // Silent error handling
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }

      const data = await response.json();
      return data;

    } catch (error) {
      const enhancedError = new Error(error.message);
      enhancedError.originalError = error;
      enhancedError.endpoint = endpoint;
      enhancedError.status = error.status;
      throw enhancedError;
    }
  }

  // Get most reviewed stores specifically
  async getMostReviewedStores(limit = 8) {
    const endpoint = `/stores?sortBy=Most Reviewed&limit=${limit}`;

    try {
      const data = await this.fetchData(endpoint);

      if (data.success && data.stores) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch most reviewed stores');
      }
    } catch (error) {
      throw error;
    }
  }

  // Get most reviewed stores by category
  async getMostReviewedStoresByCategory(category, limit = 4) {
    const endpoint = `/stores?sortBy=Most Reviewed&category=${encodeURIComponent(category)}&limit=${limit}`;

    try {
      const data = await this.fetchData(endpoint);

      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || `Failed to fetch most reviewed ${category} stores`);
      }
    } catch (error) {
      throw error;
    }
  }

  // Get trending stores (high ratings + recent activity)
  async getTrendingStores(limit = 8) {
    try {
      const data = await this.getTopRatedStores(limit * 2);

      if (data.success && data.stores) {
        const trendingStores = data.stores
          .filter(store => {
            const rating = parseFloat(store.rating) || 0;
            const reviews = parseInt(store.totalReviews) || 0;
            return rating >= 3.5 && reviews > 0;
          })
          .slice(0, limit);

        return {
          ...data,
          stores: trendingStores
        };
      } else {
        throw new Error('Failed to fetch trending stores');
      }
    } catch (error) {
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

    const data = await this.fetchData(`/stores/${id}`);

    return data;
  }

  async getStores(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== 'All Locations') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/stores${queryString ? `?${queryString}` : ''}`;

    return this.fetchData(endpoint);
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

  async toggleFollowStore(storeId) {
    return this.fetchData(`/stores/${storeId}/toggle-follow`, {
      method: 'POST'
    });
  }

  async getFollowedStores() {
    return this.fetchData('/stores/followed');
  }

  async submitReview(storeId, reviewData) {
    if (!storeId) {
      throw new Error('Store ID is required');
    }
    if (!reviewData || !reviewData.rating) {
      throw new Error('Review data with rating is required');
    }

    return this.fetchData(`/stores/${storeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
      const isHealthy = response.ok;
      return isHealthy;
    } catch (error) {
      return false;
    }
  }

  async testStoreExists(id) {
    try {
      const response = await fetch(`${this.baseURL}/stores/${id}`, {
        method: 'HEAD',
        headers: this.getHeaders(),
      });
      const exists = response.ok;
      return exists;
    } catch (error) {
      return false;
    }
  }

  async debugConnectivity() {
    try {
      const isHealthy = await this.healthCheck();

      try {
        const categories = await this.getCategories();
      } catch (error) {
        // Silent error handling
      }

      try {
        const mostReviewedStores = await this.getMostReviewedStores(5);
      } catch (error) {
        // Silent error handling
      }

      try {
        const stores = await this.getStores({ limit: 1 });
      } catch (error) {
        // Silent error handling
      }

    } catch (error) {
      // Silent error handling
    }
  }

  async testAuthentication() {
    try {
      const token = this.getAuthToken();

      if (!token) {
        return { authenticated: false, reason: 'No token found' };
      }

      const response = await fetch(`${this.baseURL}/stores/categories`, {
        headers: this.getHeaders()
      });

      return {
        authenticated: response.ok,
        status: response.status,
        reason: response.ok ? 'Valid token' : 'Invalid token'
      };
    } catch (error) {
      return { authenticated: false, reason: error.message };
    }
  }

  // Add missing getTopRatedStores method that's referenced in getTrendingStores
  async getTopRatedStores(limit = 8) {
    const endpoint = `/stores?sortBy=rating&limit=${limit}`;

    try {
      const data = await this.fetchData(endpoint);

      if (data.success && data.stores) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch top rated stores');
      }
    } catch (error) {
      throw error;
    }
  }
}

// Create instance and export
const storeServiceInstance = new StoreService();
export default storeServiceInstance;