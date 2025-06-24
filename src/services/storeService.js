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
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders(),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
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
    return this.fetchData('/stores', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  async updateStore(id, storeData) {
    return this.fetchData(`/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
  }

  async deleteStore(id) {
    return this.fetchData(`/stores/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new StoreService();
