// services/chatService.js - FIXED: Customer↔Store Communication Model
import { BASE_URL, WS_CONFIG } from '../config/api';

class ChatService {
  constructor() {
    // BASE_URL already includes /api/v1 with proper production fallback
    this.API_BASE = BASE_URL;
    this.SOCKET_URL = WS_CONFIG.url;
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
      // Silent error handling
    }
    return '';
  }

  getHeaders() {
    // Token may be in localStorage (fallback) or HttpOnly cookie (primary)
    // HttpOnly cookies are sent automatically via credentials: 'include'
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.REACT_APP_API_KEY || '',
    };

    // Only add Authorization header if we have a readable token
    // If token is in HttpOnly cookie, it will be sent automatically
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
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
        const response = await fetch(endpoint, {
          headers: this.getHeaders(),
          credentials: 'include'
        });

        if (response.ok) {
          const result = await this.handleResponse(response);
          return result;
        }
      } catch (error) {
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
    } else {
      // Customer getting their conversations with stores
      endpoint = `${this.API_BASE}/chat/user/conversations`;
    }

    try {
      const response = await fetch(endpoint, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const result = await this.handleResponse(response);

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get messages for a customer↔store conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    const endpoint = `${this.API_BASE}/chat/conversations/${conversationId}/messages`;
    const url = `${endpoint}?page=${page}&limit=${limit}`;

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
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

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const result = await this.handleResponse(response);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async startConversation(storeId, initialMessage = '') {
    const endpoint = `${this.API_BASE}/chat/conversations`;

    const body = {
      storeId: storeId, // ✅ Keep as string UUID
      initialMessage: initialMessage.trim()
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const result = await this.handleResponse(response);
      return result;
    } catch (error) {
      throw error;
    }
  }
  // Mark messages as read in customer↔store conversation
  async markMessagesAsRead(conversationId) {
    const endpoint = `${this.API_BASE}/chat/conversations/${conversationId}/read`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (response.status === 404) {
        return { success: true, message: 'Read status updated via other means' };
      }

      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update message status
  async updateMessageStatus(messageId, status) {
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
      throw error;
    }
  }

  // Search customer↔store conversations
  async searchConversations(query, type = 'all') {
    const endpoint = `${this.API_BASE}/chat/search`;
    const url = `${endpoint}?query=${encodeURIComponent(query)}&type=${type}`;

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  // Get analytics for merchant (customer↔store conversations)
  async getConversationAnalytics(period = '7d') {
    const endpoint = `${this.API_BASE}/chat/analytics`;
    const url = `${endpoint}?period=${period}`;

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
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

    for (const endpoint of endpoints) {
      try {
        await fetch(endpoint, {
          method: 'HEAD',
          headers: this.getHeaders(),
          credentials: 'include'
        });
      } catch (error) {
        // Silent error handling
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