import { BASE_URL, getTokenFromCookie } from '../config/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getTokenFromCookie();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': process.env.REACT_APP_API_KEY
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const serviceAPI = {
  getServices: async (params = {}) => {
    try {
      let url;
      if (params.storeId) {
        // BASE_URL already includes /api/v1
        url = `${BASE_URL}/services/store/${params.storeId}`;
      } else {
        url = `${BASE_URL}/services`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Services API error:', error);

      if (params.storeId) {
        try {
          const response = await fetch(`${BASE_URL}/services?storeId=${params.storeId}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
          });

          if (response.ok) {
            return response.json();
          }
        } catch (fallbackError) {
          console.warn('Fallback services API also failed:', fallbackError);
        }
      }

      return { services: [] };
    }
  },

  getServiceById: async (serviceId) => {
    try {
      const response = await fetch(`${BASE_URL}/services/${serviceId}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Get service by ID error:', error);
      throw error;
    }
  },

  bookService: async (serviceId, bookingData) => {
    try {
      const response = await fetch(`${BASE_URL}/services/${serviceId}/book`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Book service error:', error);
      throw error;
    }
  }
};

export default serviceAPI;
