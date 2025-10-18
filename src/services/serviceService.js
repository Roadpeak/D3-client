const serviceAPI = {
  getServices: async (params = {}) => {
    try {
      let url;
      if (params.storeId) {
        // REMOVE /api/v1 since it's in REACT_APP_API_BASE_URL
        url = `${process.env.REACT_APP_API_BASE_URL}/api/v1/services/store/${params.storeId}`;
      } else {
        url = `${process.env.REACT_APP_API_BASE_URL}/services`;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': process.env.REACT_APP_API_KEY 
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Services API error:', error);

      if (params.storeId) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/services?storeId=${params.storeId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'x-api-key': process.env.REACT_APP_API_KEY
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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/services/${serviceId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': process.env.REACT_APP_API_KEY 
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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/services/${serviceId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('authToken')}`,
          'x-api-key': process.env.REACT_APP_API_KEY       
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