// services/chatService.js - FIXED VERSION
class ChatService {
  constructor() {
    this.API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
    this.SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';
  }

  // Get auth token from multiple sources
  getAuthToken() {
    // Function to get token from cookies
    const getTokenFromCookie = () => {
      const name = 'authToken=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const ca = decodedCookie.split(';');
      
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    };

    // Try multiple token sources
    const token = getTokenFromCookie() || 
                 localStorage.getItem('authToken') || 
                 localStorage.getItem('access_token') ||
                 sessionStorage.getItem('authToken') ||
                 sessionStorage.getItem('access_token');

    console.log('🎫 ChatService getting token:', token ? `Found (${token.substring(0, 20)}...)` : 'Not found');
    console.log('🎫 Token sources check:');
    console.log('  - Cookie:', getTokenFromCookie() ? 'Present' : 'Missing');
    console.log('  - localStorage.authToken:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
    console.log('  - localStorage.access_token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
    
    return token;
  }

  // API headers with authentication - FIXED
  getHeaders() {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ ChatService: Authorization header added');
    } else {
      console.error('❌ ChatService: No token found - requests will fail!');
    }

    console.log('📋 ChatService headers:', headers);
    return headers;
  }

  // Handle API responses with better error handling
  async handleResponse(response) {
    console.log(`📡 ChatService response: ${response.status} ${response.statusText}`);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorData = {};
      
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP ${response.status} - ${response.statusText}` };
        }
      } else {
        errorData = { message: `HTTP ${response.status} - ${response.statusText}` };
      }
      
      console.error('❌ ChatService API error:', errorData);
      
      // Handle specific error codes
      if (response.status === 401) {
        // Token expired or invalid
        this.clearAuthToken();
        throw new Error('Authentication required. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Access denied. Please check your permissions.');
      } else if (response.status === 404) {
        throw new Error('Resource not found.');
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('✅ ChatService response data:', data);
      return data;
    } else {
      return response.text();
    }
  }

  // Clear auth token on logout/error
  clearAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('access_token');
    
    // Clear cookie
    document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  // Get current user profile with better error handling
  async getCurrentUser() {
    const endpoints = [
      `${this.API_BASE}/users/profile`,
      `${this.API_BASE}/users/me`,
      `${this.API_BASE}/auth/me`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 ChatService: Trying to get user from ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include'
        });
        
        if (response.ok) {
          return this.handleResponse(response);
        }
      } catch (error) {
        console.log(`Failed to fetch from ${endpoint}:`, error.message);
        continue;
      }
    }
    
    throw new Error('Unable to fetch user profile');
  }

  // Get conversations with better error handling - FIXED
  async getConversations(userRole = 'customer') {
    const endpoint = userRole === 'merchant' 
      ? `${this.API_BASE}/chat/merchant/conversations`
      : `${this.API_BASE}/chat/conversations`;

    try {
      console.log(`🔍 ChatService: Fetching conversations from: ${endpoint}`);
      
      const headers = this.getHeaders();
      console.log(`📋 ChatService: Request headers:`, headers);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: headers, // Use the headers correctly
        credentials: 'include'
      });

      console.log(`📡 ChatService: Response status: ${response.status}`);
      
      return await this.handleResponse(response);
      
    } catch (error) {
      console.error('❌ ChatService: Error fetching conversations:', error);
      throw error;
    }
  }

  // Get messages with better error handling - FIXED
  async getMessages(conversationId, page = 1, limit = 50) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const endpoint = `${this.API_BASE}/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`;
    
    try {
      console.log(`🔍 ChatService: Fetching messages from: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('❌ ChatService: Error fetching messages:', error);
      throw error;
    }
  }

  // Send message with better error handling - FIXED
  async sendMessage(conversationId, content, messageType = 'text') {
    if (!conversationId || !content) {
      throw new Error('Conversation ID and content are required');
    }

    const endpoint = `${this.API_BASE}/chat/messages`;
    
    try {
      console.log(`🔍 ChatService: Sending message to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          conversationId,
          content,
          messageType
        })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('❌ ChatService: Error sending message:', error);
      throw error;
    }
  }

  // Start conversation with better error handling - FIXED
  async startConversation(storeId, initialMessage = '') {
    if (!storeId) {
      throw new Error('Store ID is required');
    }

    const endpoint = `${this.API_BASE}/chat/conversations`;
    
    try {
      console.log(`🔍 ChatService: Starting conversation at: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          storeId,
          initialMessage
        })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('❌ ChatService: Error starting conversation:', error);
      throw error;
    }
  }

  // Mark messages as read - FIXED
  async markMessagesAsRead(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const endpoint = `${this.API_BASE}/chat/conversations/${conversationId}/read`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('❌ ChatService: Error marking messages as read:', error);
      throw error;
    }
  }

  // Update message status - FIXED
  async updateMessageStatus(messageId, status) {
    if (!messageId || !status) {
      throw new Error('Message ID and status are required');
    }

    const endpoint = `${this.API_BASE}/chat/messages/${messageId}/status`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('❌ ChatService: Error updating message status:', error);
      throw error;
    }
  }

  // Search conversations - FIXED
  async searchConversations(query, type = 'all') {
    if (!query || query.length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    const endpoint = `${this.API_BASE}/chat/search?query=${encodeURIComponent(query)}&type=${type}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('❌ ChatService: Error searching conversations:', error);
      throw error;
    }
  }

  // Get conversation analytics - FIXED
  async getConversationAnalytics(period = '7d') {
    const endpoint = `${this.API_BASE}/chat/analytics?period=${period}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('❌ ChatService: Error fetching analytics:', error);
      throw error;
    }
  }

  // Check authentication status
  async checkAuth() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { isAuthenticated: false, user: null };
      }

      const userResponse = await this.getCurrentUser();
      return { 
        isAuthenticated: true, 
        user: userResponse.user || userResponse 
      };
    } catch (error) {
      console.error('❌ ChatService: Auth check failed:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  // Simplified method to check if user is authenticated
  isAuthenticated() {
    const token = this.getAuthToken();
    console.log(`🔍 ChatService: isAuthenticated check - ${token ? 'Yes' : 'No'}`);
    return !!token;
  }

  // Test connection
  async testConnection() {
    try {
      const response = await fetch(`${this.API_BASE.replace('/api/v1', '')}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ChatService: API connection test successful:', data);
        return true;
      } else {
        console.error('❌ ChatService: API connection test failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ ChatService: API connection test error:', error);
      return false;
    }
  }

  // Debug method to test auth headers
  async debugAuth() {
    console.log('=== ChatService Debug Auth ===');
    const token = this.getAuthToken();
    const headers = this.getHeaders();
    
    console.log('Token found:', token ? 'Yes' : 'No');
    console.log('Headers:', headers);
    
    if (token) {
      try {
        // Test with a simple authenticated endpoint
        const response = await fetch(`${this.API_BASE}/users/profile`, {
          method: 'GET',
          headers: headers,
          credentials: 'include'
        });
        
        console.log('Test auth response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Auth test successful:', data);
          return { success: true, data };
        } else {
          const errorData = await response.json();
          console.log('Auth test failed:', errorData);
          return { success: false, error: errorData };
        }
      } catch (error) {
        console.log('Auth test error:', error);
        return { success: false, error: error.message };
      }
    } else {
      return { success: false, error: 'No token found' };
    }
  }
}

export default new ChatService();