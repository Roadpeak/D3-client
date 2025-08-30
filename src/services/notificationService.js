// services/notificationService.js - Fixed notification service with proper auth
import api, { API_ENDPOINTS, getTokenFromCookie } from '../config/api';

class NotificationService {
  constructor() {
    this.API_BASE = process.env.NODE_ENV === 'production'
      ? `${window.location.protocol}//${window.location.hostname}/api/v1`
      : '${process.env.REACT_APP_API_BASE_URL}/api/v1';
  }

  // FIXED: Use the same token retrieval as authService
  getAuthToken() {
    // Use the same method as authService from api config
    return getTokenFromCookie();
  }

  getHeaders() {
    const token = this.getAuthToken();
    console.log('🔑 Notification service token:', token ? 'Token exists' : 'No token');

    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Get all notifications for the user
  async getNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        type: params.type || 'all',
        unreadOnly: params.unreadOnly || false
      });

      console.log('📡 Fetching notifications from:', `${this.API_BASE}/notifications?${queryParams}`);

      const response = await fetch(`${this.API_BASE}/notifications?${queryParams}`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get notification counts by type
  async getNotificationCounts() {
    try {
      console.log('📊 Fetching notification counts from:', `${this.API_BASE}/notifications/counts`);
      console.log('📊 Headers being sent:', this.getHeaders());

      const response = await fetch(`${this.API_BASE}/notifications/counts`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      // Return default counts on error
      return {
        success: true,
        data: {
          total: 0,
          unread: 0,
          byType: {
            message: 0,
            booking: 0,
            offer: 0,
            store_follow: 0
          }
        }
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${this.API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(type = null) {
    try {
      const url = type
        ? `${this.API_BASE}/notifications/mark-all-read?type=${type}`
        : `${this.API_BASE}/notifications/mark-all-read`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Create a notification (for testing or internal use)
  async createNotification(notificationData) {
    try {
      const response = await fetch(`${this.API_BASE}/notifications`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(notificationData)
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${this.API_BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const response = await fetch(`${this.API_BASE}/users/notification-settings`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return {
        success: true,
        data: {
          email: true,
          push: true,
          messages: true,
          bookings: true,
          offers: true,
          storeUpdates: true
        }
      };
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const response = await fetch(`${this.API_BASE}/users/notification-settings`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // ALTERNATIVE: Use your existing API instance for consistency
  async getNotificationCountsViaApi() {
    try {
      // Check if we can use your existing api instance
      if (typeof api !== 'undefined' && API_ENDPOINTS?.notifications?.counts) {
        const response = await api.get(API_ENDPOINTS.notifications.counts);
        return {
          success: true,
          data: response.data
        };
      } else {
        // Fallback to direct fetch
        return this.getNotificationCounts();
      }
    } catch (error) {
      console.error('Error fetching notification counts via API:', error);
      return {
        success: true,
        data: {
          total: 0,
          unread: 0,
          byType: {
            message: 0,
            booking: 0,
            offer: 0,
            store_follow: 0
          }
        }
      };
    }
  }

  // Format notification for display
  formatNotification(notification) {
    const typeConfig = {
      message: {
        icon: '💬',
        color: 'bg-blue-100 text-blue-800',
        priority: 'high'
      },
      booking: {
        icon: '📅',
        color: 'bg-green-100 text-green-800',
        priority: 'high'
      },
      offer: {
        icon: '🎯',
        color: 'bg-orange-100 text-orange-800',
        priority: 'medium'
      },
      store_follow: {
        icon: '🏪',
        color: 'bg-purple-100 text-purple-800',
        priority: 'low'
      },
      system: {
        icon: '🔔',
        color: 'bg-gray-100 text-gray-800',
        priority: 'low'
      }
    };

    const config = typeConfig[notification.type] || typeConfig.system;

    return {
      ...notification,
      icon: config.icon,
      color: config.color,
      priority: config.priority,
      timeAgo: this.formatTimeAgo(notification.createdAt),
      isNew: this.isNewNotification(notification.createdAt)
    };
  }

  // Format time ago
  formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return time.toLocaleDateString();
  }

  // Check if notification is new (within last hour)
  isNewNotification(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    return diffInMinutes < 60;
  }

  // Get notification action URL
  getNotificationActionUrl(notification) {
    const actionUrls = {
      message: `/chat`,
      booking: `/profile/bookings`,
      offer: `/requestservice`,
      store_follow: `/stores/${notification.metadata?.storeId || ''}`
    };

    return actionUrls[notification.type] || '/profile';
  }

  // Handle notification click
  handleNotificationClick(notification, navigate) {
    // Mark as read
    this.markAsRead(notification.id).catch(console.error);

    // Navigate to appropriate page
    const url = this.getNotificationActionUrl(notification);

    if (notification.metadata?.conversationId) {
      navigate(url, {
        state: {
          selectedConversation: { id: notification.metadata.conversationId }
        }
      });
    } else if (notification.metadata?.bookingId) {
      navigate(url, {
        state: {
          selectedBooking: notification.metadata.bookingId
        }
      });
    } else {
      navigate(url);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;