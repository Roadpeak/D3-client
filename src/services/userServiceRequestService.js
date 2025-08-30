// services/userServiceRequestService.js - Updated without dummy data fallbacks
import authService from './authService';
import { getTokenFromCookie } from '../config/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || '${process.env.REACT_APP_API_BASE_URL}/api/v1';

// ✅ Enhanced function to get auth token
const getAuthToken = () => {
  let token = null;

  // 1. Use the same getTokenFromCookie that authService uses
  token = getTokenFromCookie();

  // 2. Fallback to manual cookie parsing if needed
  if (!token) {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }

  // 3. Try localStorage as backup
  if (!token) {
    token = localStorage.getItem('authToken') || localStorage.getItem('token');
  }

  // 4. Try sessionStorage as final backup
  if (!token) {
    token = sessionStorage.getItem('authToken') || sessionStorage.getItem('token');
  }

  return token;
};

// Helper function to check if user is authenticated
const ensureUserAuthenticated = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please log in to access this feature.');
  }

  if (!authService.isAuthenticated()) {
    throw new Error('Your session has expired. Please log in again.');
  }
};

// ✅ Enhanced function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// ✅ Enhanced API request function for users
const makeUserAPIRequest = async (url, options = {}) => {
  try {
    const isAuthRequired = options.requireAuth !== false;

    let headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // ✅ Always try to add auth headers if user is authenticated
    if (authService.isAuthenticated()) {
      const authHeaders = getAuthHeaders();
      headers = { ...headers, ...authHeaders };
    } else if (isAuthRequired) {
      throw new Error('Authentication required but user is not logged in');
    }

    const config = {
      ...options,
      headers
    };

    console.log('🌐 User API Request:', {
      url: url.replace(API_BASE_URL, ''),
      method: config.method || 'GET',
      authenticated: !!headers.Authorization,
      requireAuth: isAuthRequired
    });

    const response = await fetch(url, config);

    console.log(`📡 User API Response: ${response.status}`);

    // Handle different response types
    let data;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    // Handle HTTP errors
    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;

      // Handle authentication errors
      if (response.status === 401) {
        console.warn('🔒 User authentication failed (401)');

        // Clear user auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');

        // Try to logout via authService
        if (authService.logout) {
          authService.logout();
        }

        throw new Error(data.message || 'Your session has expired. Please log in again.');
      }

      if (response.status === 403) {
        throw new Error(data.message || 'Access denied. You may not have permission for this action.');
      }

      if (response.status === 404) {
        throw new Error(data.message || 'Resource not found.');
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after') || data.retryAfter || 60;
        throw new Error(`Too many requests. Please try again in ${retryAfter} seconds.`);
      }

      if (response.status >= 500) {
        throw new Error(data.message || 'Server error. Please try again later.');
      }

      throw error;
    }

    console.log('✅ User API request successful');
    return data;

  } catch (error) {
    console.error(`❌ User API request failed:`, error);

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }

    throw error;
  }
};

class UserServiceRequestService {
  // ✅ Get all public service requests (no dummy data fallback)
  async getPublicServiceRequests(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== 'all' && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/request-service?${queryParams}`;
      const response = await makeUserAPIRequest(url, { requireAuth: false });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch service requests');
      }

      return response;
    } catch (error) {
      console.error('Error fetching public service requests:', error);
      throw error;
    }
  }

  // ✅ Get service categories (no dummy data fallback)
  async getServiceCategories() {
    try {
      const url = `${API_BASE_URL}/request-service/categories`;
      const response = await makeUserAPIRequest(url, { requireAuth: false });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch service categories');
      }

      return response;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
  }

  // ✅ Get platform statistics (no dummy data fallback)
  async getPlatformStatistics() {
    try {
      const url = `${API_BASE_URL}/request-service/statistics`;
      const response = await makeUserAPIRequest(url, { requireAuth: false });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch platform statistics');
      }

      return response;
    } catch (error) {
      console.error('Error fetching platform statistics:', error);
      throw error;
    }
  }

  // ✅ Create new service request (user auth required)
  async createServiceRequest(requestData) {
    try {
      ensureUserAuthenticated();

      // Validate required fields
      const requiredFields = ['title', 'category', 'description', 'budgetMin', 'budgetMax', 'timeline', 'location'];
      const missingFields = requiredFields.filter(field => !requestData[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate budget range
      if (parseFloat(requestData.budgetMin) >= parseFloat(requestData.budgetMax)) {
        throw new Error('Maximum budget must be greater than minimum budget');
      }

      // Validate description length
      if (requestData.description.length < 10) {
        throw new Error('Description must be at least 10 characters long');
      }

      const url = `${API_BASE_URL}/request-service`;

      console.log('🚀 Creating service request with data:', {
        title: requestData.title,
        category: requestData.category,
        hasAuth: !!getAuthToken()
      });

      const response = await makeUserAPIRequest(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
        requireAuth: true
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create service request');
      }

      return response;
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  }

  // ✅ Get offers received for user's requests (user auth required) - NO DUMMY DATA
  async getUserOffers(pagination = {}) {
    try {
      ensureUserAuthenticated();

      const { page = 1, limit = 10, status = 'all' } = pagination;
      const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });

      if (status !== 'all') {
        queryParams.append('status', status);
      }

      const url = `${API_BASE_URL}/request-service/offers?${queryParams}`;
      const response = await makeUserAPIRequest(url, { requireAuth: true });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user offers');
      }

      return response;
    } catch (error) {
      console.error('Error fetching user offers:', error);
      throw error;
    }
  }

  // ✅ Get user's past requests (user auth required) - NO DUMMY DATA
  async getUserPastRequests(pagination = {}) {
    try {
      ensureUserAuthenticated();

      const { page = 1, limit = 10, status = 'all' } = pagination;
      const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });

      if (status !== 'all') {
        queryParams.append('status', status);
      }

      const url = `${API_BASE_URL}/request-service/my-requests?${queryParams}`;
      const response = await makeUserAPIRequest(url, { requireAuth: true });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user past requests');
      }

      return response;
    } catch (error) {
      console.error('Error fetching user past requests:', error);
      throw error;
    }
  }

  // ✅ Accept an offer (user auth required)
  async acceptOffer(offerId, requestId) {
    try {
      ensureUserAuthenticated();

      if (!offerId || !requestId) {
        throw new Error('Offer ID and Request ID are required');
      }

      const url = `${API_BASE_URL}/request-service/${requestId}/accept-offer/${offerId}`;
      const response = await makeUserAPIRequest(url, {
        method: 'PUT',
        requireAuth: true
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to accept offer');
      }

      return response;
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  }

  // ✅ Reject an offer (user auth required)
  async rejectOffer(offerId, requestId, reason = '') {
    try {
      ensureUserAuthenticated();

      if (!offerId || !requestId) {
        throw new Error('Offer ID and Request ID are required');
      }

      const url = `${API_BASE_URL}/request-service/${requestId}/reject-offer/${offerId}`;
      const response = await makeUserAPIRequest(url, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
        requireAuth: true
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to reject offer');
      }

      return response;
    } catch (error) {
      console.error('Error rejecting offer:', error);
      throw error;
    }
  }

  // ✅ Create individual offer (for users who are also service providers)
  async createIndividualOffer(requestId, offerData) {
    try {
      ensureUserAuthenticated();

      if (!requestId) {
        throw new Error('Request ID is required');
      }

      // Validate required fields
      const requiredFields = ['quotedPrice', 'message', 'availability'];
      const missingFields = requiredFields.filter(field => !offerData[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate quoted price
      if (parseFloat(offerData.quotedPrice) <= 0) {
        throw new Error('Quoted price must be greater than 0');
      }

      // Validate message length
      if (offerData.message.length < 10) {
        throw new Error('Message must be at least 10 characters long');
      }

      const url = `${API_BASE_URL}/request-service/${requestId}/offers`;

      console.log('🚀 Creating individual offer with data:', {
        requestId,
        quotedPrice: offerData.quotedPrice,
        hasAuth: !!getAuthToken()
      });

      const response = await makeUserAPIRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          quotedPrice: parseFloat(offerData.quotedPrice),
          message: offerData.message,
          availability: offerData.availability
        }),
        requireAuth: true
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create individual offer');
      }

      return response;
    } catch (error) {
      console.error('Error creating individual offer:', error);
      throw error;
    }
  }

  // ✅ Get specific service request details
  async getServiceRequestDetails(requestId) {
    try {
      if (!requestId) {
        throw new Error('Request ID is required');
      }

      const url = `${API_BASE_URL}/request-service/${requestId}`;
      const response = await makeUserAPIRequest(url, { requireAuth: false });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch service request details');
      }

      return response;
    } catch (error) {
      console.error('Error fetching service request details:', error);
      throw error;
    }
  }

  // ✅ Rate and review completed service (user auth required)
  async rateAndReviewService(requestId, rating, review) {
    try {
      ensureUserAuthenticated();

      if (!requestId) {
        throw new Error('Request ID is required');
      }

      if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const url = `${API_BASE_URL}/request-service/${requestId}/review`;
      const response = await makeUserAPIRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          rating: parseInt(rating),
          review: review || ''
        }),
        requireAuth: true
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to rate and review service');
      }

      return response;
    } catch (error) {
      console.error('Error rating and reviewing service:', error);
      throw error;
    }
  }

  // ✅ Search service requests with advanced filters
  async searchServiceRequests(searchParams = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/request-service/search?${queryParams}`;
      const response = await makeUserAPIRequest(url, { requireAuth: false });

      if (!response.success) {
        throw new Error(response.message || 'Failed to search service requests');
      }

      return response;
    } catch (error) {
      console.error('Error searching service requests:', error);
      throw error;
    }
  }

  // ✅ Get user's service request statistics (user auth required)
  async getUserStatistics() {
    try {
      ensureUserAuthenticated();

      const url = `${API_BASE_URL}/users/service-statistics`;
      const response = await makeUserAPIRequest(url, { requireAuth: true });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user statistics');
      }

      return response;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  }

  // Helper methods
  isAuthenticated() {
    return authService.isAuthenticated();
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // ✅ Enhanced debug method to check authentication state
  debugAuth() {
    const token = getAuthToken();
    const cookieToken = getTokenFromCookie();
    const isAuth = authService.isAuthenticated();
    const user = this.getCurrentUser();

    console.log('🔍 Auth Debug:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      cookieToken: !!cookieToken,
      cookieTokenLength: cookieToken ? cookieToken.length : 0,
      tokensMatch: token === cookieToken,
      isAuthenticated: isAuth,
      hasUser: !!user,
      userEmail: user?.email,
      allCookies: document.cookie
    });

    return {
      hasToken: !!token,
      cookieToken: !!cookieToken,
      tokensMatch: token === cookieToken,
      isAuthenticated: isAuth,
      hasUser: !!user,
      user
    };
  }

  // ✅ Add method to expose getTokenFromCookie for external debugging
  getTokenFromCookie() {
    return getTokenFromCookie();
  }

  // Validate form data before submission
  validateServiceRequestData(data) {
    const errors = [];

    if (!data.title || data.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }

    if (data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (data.description && data.description.length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }

    if (!data.budgetMin || !data.budgetMax) {
      errors.push('Budget range is required');
    }

    if (data.budgetMin && data.budgetMax && parseFloat(data.budgetMin) >= parseFloat(data.budgetMax)) {
      errors.push('Maximum budget must be greater than minimum budget');
    }

    if (data.budgetMin && parseFloat(data.budgetMin) < 0) {
      errors.push('Budget cannot be negative');
    }

    if (!data.timeline) {
      errors.push('Timeline is required');
    }

    if (!data.location || data.location.trim().length < 3) {
      errors.push('Location must be at least 3 characters long');
    }

    if (data.location && data.location.length > 255) {
      errors.push('Location must be less than 255 characters');
    }

    return errors;
  }

  validateOfferData(data) {
    const errors = [];

    if (!data.quotedPrice || parseFloat(data.quotedPrice) <= 0) {
      errors.push('Valid quoted price is required and must be greater than 0');
    }

    if (!data.message || data.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    }

    if (data.message && data.message.length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }

    if (!data.availability) {
      errors.push('Availability information is required');
    }

    if (data.availability && data.availability.length > 200) {
      errors.push('Availability must be less than 200 characters');
    }

    return errors;
  }
}

// Create and export singleton instance
const userServiceRequestService = new UserServiceRequestService();

export default userServiceRequestService;