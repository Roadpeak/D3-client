// services/reviewService.js - Updated service for handling reviews

const API_BASE_URL = process.env.REACT_APP_API_URL || '${process.env.REACT_APP_API_BASE_URL}';

class ReviewService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('📝 ReviewService initialized with URL:', this.baseURL);
  }

  // Get auth token (same pattern as StoreService)
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
      console.log('🔐 Auth token found for reviews');
    } else {
      console.log('⚠️ No auth token found for reviews');
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

  // Get headers with auth
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add API key if available
    const apiKey = process.env.REACT_APP_API_KEY;
    if (apiKey) {
      headers['api-key'] = apiKey;
    }

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Fetch data helper
  async fetchData(endpoint, options = {}) {
    try {
      const fullUrl = `${this.baseURL}${endpoint}`;
      console.log(`🔗 Making review request to: ${fullUrl}`);
      console.log(`📤 Method: ${options.method || 'GET'}`);

      const response = await fetch(fullUrl, {
        headers: this.getHeaders(),
        ...options,
      });

      console.log(`📡 Review response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;

        try {
          const errorBody = await response.text();
          console.log('❌ Review error response:', errorBody);

          try {
            errorDetails = JSON.parse(errorBody);
            errorMessage = errorDetails.message || errorMessage;
          } catch (e) {
            errorMessage = errorBody || errorMessage;
          }
        } catch (e) {
          console.error('Could not read error response:', e);
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }

      const data = await response.json();
      console.log('✅ Review response data received');
      return data;

    } catch (error) {
      console.error('🔥 Review API Error:', {
        message: error.message,
        status: error.status,
        endpoint: `${this.baseURL}${endpoint}`
      });

      throw error;
    }
  }

  // Get reviews for a specific store (public endpoint)
  async getStoreReviews(storeId, params = {}) {
    const { page = 1, limit = 20, rating = 'all', sortBy = 'newest' } = params;

    console.log('📖 Fetching store reviews:', storeId, params);

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy
    });

    if (rating && rating !== 'all') {
      queryParams.append('rating', rating);
    }

    return this.fetchData(`/stores/${storeId}/reviews?${queryParams.toString()}`);
  }

  // Create a new review (for customers)
  async createReview(reviewData) {
    console.log('✍️ Creating review:', reviewData);

    return this.fetchData('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  // Update a review
  async updateReview(reviewId, updateData) {
    console.log('✏️ Updating review:', reviewId, updateData);

    return this.fetchData(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  // Delete a review
  async deleteReview(reviewId) {
    console.log('🗑️ Deleting review:', reviewId);

    return this.fetchData(`/reviews/${reviewId}`, {
      method: 'DELETE'
    });
  }

  // Get a single review by ID
  async getReviewById(reviewId) {
    console.log('🔍 Fetching review by ID:', reviewId);

    return this.fetchData(`/reviews/${reviewId}`);
  }

  // Get reviews for merchant's own store (dashboard endpoint)
  async getMerchantStoreReviews(params = {}) {
    const { page = 1, limit = 20, rating = 'all', sortBy = 'newest' } = params;

    console.log('📊 Fetching merchant store reviews with params:', params);

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy
    });

    if (rating && rating !== 'all') {
      queryParams.append('rating', rating);
    }

    return this.fetchData(`/merchant/reviews?${queryParams.toString()}`);
  }

  // Submit review via store endpoint (alternative endpoint)
  async submitStoreReview(storeId, reviewData) {
    console.log('✍️ Submitting store review:', storeId, reviewData);

    return this.fetchData(`/stores/${storeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  // Export reviews (future feature)
  async exportReviews(storeId, format = 'csv') {
    console.log('📤 Exporting reviews:', storeId, format);

    // This would be implemented when export functionality is added
    return this.fetchData(`/stores/${storeId}/reviews/export?format=${format}`);
  }

  // Test review service connectivity
  async testConnectivity() {
    try {
      console.log('🧪 Testing review service connectivity...');

      // Test basic endpoint
      const response = await fetch(`${this.baseURL}/reviews/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🧪 Test response status:', response.status);

      return {
        connected: response.ok,
        status: response.status,
        message: response.ok ? 'Review service connected' : 'Review service unavailable'
      };
    } catch (error) {
      console.error('🧪 Review service test failed:', error);
      return {
        connected: false,
        status: 0,
        message: error.message
      };
    }
  }

  // Debug method to check authentication
  async debugAuth() {
    try {
      console.log('🔐 Debug: Testing review service authentication...');

      const token = this.getAuthToken();
      console.log('🎫 Token available:', !!token);
      console.log('🎫 Token preview:', token ? `${token.substring(0, 20)}...` : 'None');

      if (!token) {
        return { authenticated: false, reason: 'No token found' };
      }

      // Test with a simple authenticated request
      const response = await this.fetchData('/reviews/auth-test');

      return {
        authenticated: true,
        tokenValid: true,
        message: 'Authentication successful'
      };
    } catch (error) {
      console.error('🔐 Auth debug failed:', error);
      return {
        authenticated: false,
        tokenValid: false,
        reason: error.message
      };
    }
  }
}

// Create and export instance
const reviewServiceInstance = new ReviewService();
export default reviewServiceInstance;