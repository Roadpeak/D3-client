const serviceAPI = {
  getServices: async (params = {}) => {
    try {
      // Try multiple endpoints for services
      let url;
      if (params.storeId) {
        // First try the store-specific endpoint
        url = `${process.env.REACT_APP_API_BASE_URL}/services/store/${params.storeId}`;
      } else {
        url = `${process.env.REACT_APP_API_BASE_URL}/services`;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': process.env.REACT_APP_API_KEY || 'API_KEY_12345ABCDEF!@#67890-xyZQvTPOl'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Services API error:', error);

      // If store-specific endpoint fails, try general endpoint with filter
      if (params.storeId) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/services?storeId=${params.storeId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'x-api-key': process.env.REACT_APP_API_KEY || 'API_KEY_12345ABCDEF!@#67890-xyZQvTPOl'
            }
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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/services/${serviceId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': process.env.REACT_APP_API_KEY || 'API_KEY_12345ABCDEF!@#67890-xyZQvTPOl'
        }
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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/services/${serviceId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('authToken')}`,
          'x-api-key': process.env.REACT_APP_API_KEY || 'API_KEY_12345ABCDEF!@#67890-xyZQvTPOl'      
        },
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
