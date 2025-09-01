// services/chatService.js - FIXED: Customer↔Store Communication Model
class ChatService {
  constructor() {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

    this.API_BASE = process.env.NODE_ENV === 'production'
      ? `${protocol}//${hostname}/api/v1`
      : 'http://localhost:4000/api/v1';

    this.SOCKET_URL = process.env.NODE_ENV === 'production'
      ? `${protocol}//${hostname}`
      : 'http://localhost:4000';
  }

  // Enhanced token retrieval
  getAuthToken() {
    const getTokenFromCookie = () => {
      if (typeof document === 'undefined') return '';

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

    const tokenSources = {
      localStorage_access_token: typeof window !== 'undefined' ? localStorage.getItem('access_token') : '',
      localStorage_authToken: typeof window !== 'undefined' ? localStorage.getItem('authToken') : '',
      localStorage_token: typeof window !== 'undefined' ? localStorage.getItem('token') : '',
      cookie_authToken: getTokenFromCookie(),
      cookie_access_token: this.getCookieValue('access_token'),
      cookie_token: this.getCookieValue('token')
    };

    const token = tokenSources.localStorage_access_token ||
      tokenSources.localStorage_authToken ||
      tokenSources.localStorage_token ||
      tokenSources.cookie_authToken ||
      tokenSources.cookie_access_token ||
      tokenSources.cookie_token;

    console.log('🔍 ChatService token check:', token ? `Found (${token.substring(0, 20)}...)` : 'Not found');
    return token;
  }

  getCookieValue(name) {
    if (typeof document === 'undefined') return '';

    try {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value || '');
      }
    } catch (error) {
      console.error('Error reading cookie:', error);
    }
    return '';
  }

  getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Get current user profile  
  async getCurrentUser() {
    const endpoints = [
      `${this.API_BASE}/users/profile`,
      `${this.API_BASE}/users/me`,
      `${this.API_BASE}/auth/profile`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Trying to fetch user from: ${endpoint}`);
        const response = await fetch(endpoint, {
          headers: this.getHeaders(),
          credentials: 'include'
        });

        if (response.ok) {
          const result = await this.handleResponse(response);
          console.log('✅ User fetched successfully from:', endpoint);
          return result;
        }
      } catch (error) {
        console.log(`❌ Failed to fetch from ${endpoint}:`, error.message);
        continue;
      }
    }

    throw new Error('Unable to fetch user profile from any endpoint');
  }

  // FIXED: Get conversations with proper customer/merchant distinction
  async getConversations(userRole = 'customer') {
    let endpoint;

    if (userRole === 'merchant') {
      // Merchant getting customer↔store conversations for their stores
      endpoint = `${this.API_BASE}/chat/merchant/conversations`;
      console.log('🏪 Fetching merchant store conversations (customer↔store chats)');
    } else {
      // Customer getting their conversations with stores
      endpoint = `${this.API_BASE}/chat/user/conversations`;
      console.log('👤 Fetching customer store conversations (customer↔store chats)');
    }

    console.log(`📋 Using endpoint: ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const result = await this.handleResponse(response);

      if (userRole === 'merchant') {
        console.log(`✅ Loaded ${result.data?.length || 0} customer↔store conversations for merchant`);
      } else {
        console.log(`✅ Loaded ${result.data?.length || 0} customer↔store conversations`);
      }

      return result;
    } catch (error) {
      console.error(`Error fetching ${userRole} conversations:`, error);
      throw error;
    }
  }

  // Get messages for a customer↔store conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    const endpoint = `${this.API_BASE}/chat/conversations/${conversationId}/messages`;
    const url = `${endpoint}?page=${page}&limit=${limit}`;

    console.log('📨 Fetching customer↔store messages from:', url);

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // FIXED: Send message in customer↔store conversation
  async sendMessage(conversationId, content, messageType = 'text') {
    const endpoint = `${this.API_BASE}/chat/messages`;

    // Validate content
    const validation = this.validateMessage(content);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const body = {
      conversationId,
      content: content.trim(),
      messageType
    };

    console.log('📤 Sending customer↔store message:', {
      endpoint,
      conversationId,
      contentLength: content.length
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const result = await this.handleResponse(response);
      console.log('✅ Customer↔store message sent successfully');
      return result;
    } catch (error) {
      console.error('Error sending customer↔store message:', error);
      throw error;
    }
  }

  // FIXED: Start a new customer↔store conversation
  async startConversation(storeId, initialMessage = '') {
    const endpoint = `${this.API_BASE}/chat/conversations`;

    const body = {
      storeId: parseInt(storeId), // Ensure it's a number
      initialMessage: initialMessage.trim()
    };

    console.log('🆕 Starting customer↔store conversation:', {
      storeId,
      hasInitialMessage: !!initialMessage.trim()
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const result = await this.handleResponse(response);
      console.log('✅ Customer↔store conversation started:', result.data?.conversationId);
      return result;
    } catch (error) {
      console.error('Error starting customer↔store conversation:', error);
      throw error;
    }
  }

  // Mark messages as read in customer↔store conversation
  async markMessagesAsRead(conversationId) {
    const endpoint = `${this.API_BASE}/chat/conversations/${conversationId}/read`;

    console.log('📖 Marking customer↔store messages as read:', conversationId);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        console.log('⚠️ Read endpoint not implemented, skipping');
        return { success: true, message: 'Read status updated via other means' };
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Update message status
  async updateMessageStatus(messageId, status) {
    const endpoint = `${this.API_BASE}/chat/messages/${messageId}/status`;

    console.log('📝 Updating message status:', { messageId, status });

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }

  // Search customer↔store conversations
  async searchConversations(query, type = 'all') {
    const endpoint = `${this.API_BASE}/chat/search`;
    const url = `${endpoint}?query=${encodeURIComponent(query)}&type=${type}`;

    console.log('🔍 Searching customer↔store conversations:', url);

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }

  // Get analytics for merchant (customer↔store conversations)
  async getConversationAnalytics(period = '7d') {
    const endpoint = `${this.API_BASE}/chat/analytics`;
    const url = `${endpoint}?period=${period}`;

    console.log('📊 Fetching customer↔store analytics:', url);

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // UTILITY METHODS

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
        user: userResponse.user || userResponse.data || userResponse
      };
    } catch (error) {
      console.error('Auth check failed:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.API_BASE}/chat/health`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (response.ok) {
        return { success: true, status: 'healthy' };
      } else {
        return { success: false, status: 'unhealthy', error: response.statusText };
      }
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, status: 'unhealthy', error: error.message };
    }
  }

  // Format time helper
  formatTime(timestamp) {
    try {
      const now = new Date();
      const messageTime = new Date(timestamp);
      const diffInHours = (now - messageTime) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
        return diffInMinutes <= 0 ? 'now' : `${diffInMinutes} min ago`;
      } else if (diffInHours < 24) {
        return messageTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        });
      } else {
        return messageTime.toLocaleDateString('en-US');
      }
    } catch (error) {
      return 'unknown time';
    }
  }

  // Validate message content
  validateMessage(content) {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: 'Message content is required' };
    }

    if (content.trim().length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (content.length > 2000) {
      return { valid: false, error: 'Message too long (max 2000 characters)' };
    }

    return { valid: true };
  }

  // Get message status icons for UI
  getMessageStatusIcon(status) {
    const statusMap = {
      'sent': '✓',
      'delivered': '✓✓',
      'read': '✓✓'
    };
    return statusMap[status] || '';
  }

  // Get appropriate avatar URL
  getAvatarUrl(user, size = 40) {
    if (user?.avatar) {
      return user.avatar;
    }

    const name = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random`;
  }

  // Get store avatar URL
  getStoreAvatarUrl(store, size = 40) {
    if (store?.avatar || store?.logo_url) {
      return store.avatar || store.logo_url;
    }

    const name = store?.name || 'Store';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random&color=ffffff&background=2563eb`;
  }

  // Handle network errors gracefully
  async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        console.log(`Request attempt ${attempt} failed:`, error.message);

        if (attempt === maxRetries) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  // Get socket URL for websocket connections
  getSocketUrl() {
    return this.SOCKET_URL;
  }

  // Debug method to check all endpoints
  async debugEndpoints() {
    const endpoints = [
      `${this.API_BASE}/chat/user/conversations`,
      `${this.API_BASE}/chat/merchant/conversations`,
      `${this.API_BASE}/chat/messages`,
      `${this.API_BASE}/chat/search`,
      `${this.API_BASE}/chat/analytics`,
      `${this.API_BASE}/users/profile`
    ];

    console.log('🔍 Debugging ChatService endpoints:');

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'HEAD',
          headers: this.getHeaders(),
          credentials: 'include'
        });

        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
  }

  // Get conversation type for UI display
  getConversationType(conversation, userType) {
    if (userType === 'customer') {
      return {
        type: 'customer_to_store',
        title: conversation.store?.name || 'Store',
        subtitle: conversation.store?.category || 'Store',
        avatar: this.getStoreAvatarUrl(conversation.store)
      };
    } else if (userType === 'merchant') {
      return {
        type: 'store_to_customer',
        title: conversation.customer?.name || 'Customer',
        subtitle: `Customer since ${conversation.customer?.customerSince || 'Unknown'}`,
        avatar: this.getAvatarUrl(conversation.customer),
        priority: conversation.customer?.priority || 'regular'
      };
    }

    return {
      type: 'unknown',
      title: 'Unknown',
      subtitle: '',
      avatar: '/default-avatar.png'
    };
  }

  // Format conversation for display
  formatConversation(conversation, userType) {
    const baseInfo = this.getConversationType(conversation, userType);

    return {
      ...conversation,
      displayInfo: baseInfo,
      formattedTime: this.formatTime(conversation.lastMessageTime),
      hasUnread: (conversation.unreadCount || 0) > 0
    };
  }

  // Get quick responses based on user type
  getQuickResponses(userType) {
    if (userType === 'customer') {
      return [
        "Thank you!",
        "That sounds great!",
        "Can you tell me more about this?",
        "What are your store hours?",
        "Do you have this item in stock?",
        "What's the price for this service?",
        "Is this available today?",
        "Thank you for your help!"
      ];
    } else if (userType === 'merchant') {
      return [
        "Thank you for your message! I'll help you right away.",
        "Your order is being processed and will be ready soon.",
        "We have that item in stock. Would you like me to reserve it for you?",
        "I'll check on that for you and get back to you shortly.",
        "Is there anything else I can help you with today?",
        "Our store hours are Monday to Friday, 9 AM to 6 PM.",
        "You can track your order using the link I'll send you.",
        "We offer free delivery for orders over KES 2,000."
      ];
    }

    return [];
  }
}

// Create and export instance
const chatService = new ChatService();
export default chatService;