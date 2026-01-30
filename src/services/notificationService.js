import api, { API_ENDPOINTS, getTokenFromCookie, BASE_URL } from '../config/api';

class NotificationService {
  constructor() {
    // BASE_URL already includes /api/v1 with proper production fallback
    this.API_BASE = BASE_URL;

    this.fallbackNotifications = {
      message: [],
      offer: [],
      unread: 0,
      total: 0
    };
  }
  // Use the same token retrieval as authService
  getAuthToken() {
    return getTokenFromCookie();
  }

  getHeaders() {
    const token = this.getAuthToken();

    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'x-api-key': process.env.REACT_APP_API_KEY || '',
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

      const response = await fetch(`${this.API_BASE}/notifications?${queryParams}`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const result = await this.handleResponse(response);

      // If successful, also get service offer notifications
      if (result.success && result.data) {
        const offerNotifications = await this.getServiceOfferNotifications(params);

        // Merge offer notifications with regular notifications
        if (offerNotifications && offerNotifications.length > 0) {
          result.data.notifications = this.mergeAndSortNotifications(
            result.data.notifications || [],
            offerNotifications
          );
        }
      }

      return result;
    } catch (error) {
      // Try to get service offer notifications as fallback
      try {
        const offerNotifications = await this.getServiceOfferNotifications(params);
        if (offerNotifications && offerNotifications.length > 0) {
          return {
            success: true,
            data: {
              notifications: offerNotifications,
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalCount: offerNotifications.length
              }
            }
          };
        }
      } catch (offerError) {
        // Silent error handling
      }

      // Return fallback data on error
      return {
        success: true,
        data: {
          notifications: this.fallbackNotifications.message,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0
          }
        }
      };
    }
  }

  // NEW: Get service offer notifications specifically
  async getServiceOfferNotifications(params = {}) {
    try {
      // Import the service request service to get user's offers
      const userServiceRequestService = await import('./userServiceRequestService')
        .then(module => module.default);

      const offersResponse = await userServiceRequestService.getUserOffers({
        page: 1,
        limit: 50, // Get more offers to check for recent ones
        status: 'pending' // Focus on pending offers for notifications
      });

      if (!offersResponse.success || !offersResponse.data?.offers) {
        return [];
      }

      const offers = offersResponse.data.offers;

      // Convert offers to notification format
      const offerNotifications = offers
        .filter(offer => this.isRecentOffer(offer.createdAt))
        .map(offer => this.createOfferNotification(offer))
        .filter(Boolean);

      return offerNotifications;
    } catch (error) {
      return [];
    }
  }

  // Get notification counts by type with service offers
  async getNotificationCounts() {
    try {
      const response = await fetch(`${this.API_BASE}/notifications/counts`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const result = await this.handleResponse(response);

      // If backend reports no notifications, enhance with service offer and chat data
      if (result.success && result.data.unread === 0) {
        try {
          // Get service offer counts
          const offerNotifications = await this.getServiceOfferNotifications();
          const unreadOfferCount = offerNotifications.filter(notif => !notif.isRead).length;

          // Get chat counts
          const chatService = await import('./chatService').then(module => module.default);
          const chatResponse = await chatService.getConversations('customer');

          let unreadChatCount = 0;
          if (chatResponse.success && chatResponse.data) {
            unreadChatCount = chatResponse.data.reduce((total, chat) => {
              return total + (chat.unreadCount || 0);
            }, 0);
          }

          // Update counts with offer and chat data
          if (unreadOfferCount > 0 || unreadChatCount > 0) {
            result.data.unread = unreadOfferCount + unreadChatCount;
            result.data.byType.message = (result.data.byType.message || 0) + unreadChatCount;
            result.data.byType.offer = (result.data.byType.offer || 0) + unreadOfferCount;
            result.data.byType.service_request_offer = unreadOfferCount;
            result.data.total += (unreadOfferCount + unreadChatCount);
          }
        } catch (enhancementError) {
          // Silent error handling
        }
      }

      return result;
    } catch (error) {
      // Get fallback counts from service offers and chats
      try {
        const offerNotifications = await this.getServiceOfferNotifications();
        const unreadOfferCount = offerNotifications.filter(notif => !notif.isRead).length;

        const chatService = await import('./chatService').then(module => module.default);
        const chatResponse = await chatService.getConversations('customer');

        let unreadChatCount = 0;
        if (chatResponse.success && chatResponse.data) {
          unreadChatCount = chatResponse.data.reduce((total, chat) => {
            return total + (chat.unreadCount || 0);
          }, 0);
        }

        return {
          success: true,
          data: {
            total: unreadOfferCount + unreadChatCount,
            unread: unreadOfferCount + unreadChatCount,
            byType: {
              message: unreadChatCount,
              booking: 0,
              offer: unreadOfferCount,
              service_request_offer: unreadOfferCount,
              store_follow: 0
            }
          }
        };
      } catch (fallbackError) {
        // Silent error handling
      }

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
            service_request_offer: 0,
            store_follow: 0
          }
        }
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      // Handle synthetic notification IDs (starting with "sample-", "chat-", or "offer-")
      if (notificationId.startsWith('sample-') ||
        notificationId.startsWith('chat-') ||
        notificationId.startsWith('offer-')) {
        // For synthetic notifications, just return success without API call
        return {
          success: true,
          data: {
            id: notificationId,
            read: true,
            readAt: new Date()
          }
        };
      }

      const response = await fetch(`${this.API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
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
      throw error;
    }
  }

  // NEW: Create notification from service offer
  createOfferNotification(offer) {
    if (!offer || !offer.id) return null;

    // Determine notification priority based on offer status and timing
    let priority = 'normal';
    if (offer.status === 'pending') {
      priority = this.isUrgentOffer(offer) ? 'high' : 'normal';
    }

    return {
      id: `offer-${offer.id}-${Date.now()}`,
      type: 'service_request_offer',
      title: 'New Service Offer Received',
      subtitle: `${offer.storeName || offer.providerName} made an offer`,
      message: `You received a ${offer.price} offer for "${offer.requestTitle}"`,
      description: offer.message || 'View offer details to see the full proposal',
      createdAt: offer.createdAt,
      avatar: offer.avatar || 'https://via.placeholder.com/40',
      isRead: false,
      priority,
      data: {
        offerId: offer.id,
        requestId: offer.requestId,
        requestTitle: offer.requestTitle,
        storeName: offer.storeName,
        storeId: offer.storeId,
        providerName: offer.providerName,
        providerId: offer.providerId,
        quotedPrice: offer.quotedPrice,
        price: offer.price,
        estimatedDuration: offer.estimatedDuration,
        availability: offer.availability,
        includesSupplies: offer.includesSupplies,
        warranty: offer.warranty,
        responseTime: offer.responseTime,
        verified: offer.verified,
        rating: offer.rating,
        storeDetails: offer.storeDetails
      },
      actionUrl: `/marketplace/offers/${offer.id}`,
      metadata: {
        offerId: offer.id,
        requestId: offer.requestId,
        storeId: offer.storeId,
        type: 'service_offer'
      }
    };
  }

  // Check if offer is recent (within last 24 hours)
  isRecentOffer(timestamp) {
    if (!timestamp) return false;

    const now = new Date();
    const offerTime = new Date(timestamp);
    const diffInHours = Math.floor((now - offerTime) / (1000 * 60 * 60));

    return diffInHours <= 24; // Consider offers from last 24 hours as recent
  }

  // Check if offer is urgent (high budget, quick timeline, etc.)
  isUrgentOffer(offer) {
    if (!offer) return false;

    // Mark as urgent if:
    // 1. High quoted price (> $500)
    // 2. From verified/highly rated provider
    // 3. Quick response time

    const highValue = offer.quotedPrice && parseFloat(offer.quotedPrice) > 500;
    const verifiedProvider = offer.verified && offer.rating > 4.5;
    const quickResponse = offer.responseTime && offer.responseTime.includes('hour');

    return highValue || verifiedProvider || quickResponse;
  }

  // Merge and sort notifications from different sources
  mergeAndSortNotifications(regularNotifications, offerNotifications) {
    const allNotifications = [...regularNotifications, ...offerNotifications];

    // Sort by priority first, then by creation time
    return allNotifications.sort((a, b) => {
      // Priority order: urgent > high > normal > low
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;

      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      // If same priority, sort by creation time (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  // Format notification for display with enhanced compatibility
  formatNotification(notification) {
    // Map notification type to a simplified category
    const getCategoryForType = (type) => {
      const messageTypes = ['new_message', 'message_read', 'chat_started'];
      const bookingTypes = ['booking_created', 'booking_confirmed', 'booking_cancelled', 'booking_completed', 'booking_reminder'];
      const offerTypes = ['service_request_offer', 'offer_accepted', 'offer_rejected', 'offer_withdrawn'];
      const storeTypes = ['store_follow', 'store_unfollow', 'new_review', 'review_response'];

      if (messageTypes.includes(type)) return 'message';
      if (bookingTypes.includes(type)) return 'booking';
      if (offerTypes.includes(type)) return 'offer';
      if (storeTypes.includes(type)) return 'store_follow';
      return 'system';
    };

    // Define type configuration for visual styling
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

    // Get the notification category for consistent UI
    const notificationType = notification.type || 'system';
    const category = getCategoryForType(notificationType);
    const config = typeConfig[category] || typeConfig.system;

    // Get sender/store info for avatar display
    const avatar = notification.sender?.avatar ||
      notification.store?.logo_url ||
      notification.data?.senderAvatar ||
      notification.avatar ||
      'https://via.placeholder.com/40';

    // Format notification for consistent display
    return {
      id: notification.id,
      type: notificationType,
      title: notification.title || 'New notification',
      subtitle: notification.subtitle || notification.data?.subtitle || '',
      message: notification.message || '',
      description: notification.description || notification.data?.description || notification.data?.details || '',
      time: this.formatTimeAgo(notification.createdAt),
      avatar: avatar,
      isRead: notification.read || notification.isRead || false,
      hasActions: notification.actionType !== 'none' && notification.actionType !== 'navigate',
      actionUrl: notification.actionUrl || '/',
      metadata: notification.data || notification.metadata || {},
      icon: config.icon,
      color: config.color,
      priority: notification.priority || config.priority,
      timeAgo: this.formatTimeAgo(notification.createdAt),
      isNew: this.isNewNotification(notification.createdAt),
      team: notification.store?.name || notification.data?.teamName || notification.data?.storeName || ''
    };
  }

  // Format time ago
  formatTimeAgo(timestamp) {
    if (!timestamp) return 'Unknown time';

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
    if (!timestamp) return false;

    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    return diffInMinutes < 60;
  }

  // Get notification action URL based on type
  getNotificationActionUrl(notification) {
    // Handle synthetic or sample notifications
    if (notification.actionUrl) {
      return notification.actionUrl;
    }

    // Extract entity IDs from metadata
    const data = notification.metadata || {};
    const chatId = data.chatId || data.conversationId;
    const bookingId = data.bookingId;
    const offerId = data.offerId;
    const storeId = data.storeId;

    // Type-based routing
    const actionUrls = {
      new_message: chatId ? `/chat/${chatId}` : '/chat',
      message_read: chatId ? `/chat/${chatId}` : '/chat',
      chat_started: chatId ? `/chat/${chatId}` : '/chat',

      booking_created: bookingId ? `/profile/bookings/${bookingId}` : '/profile/bookings',
      booking_confirmed: bookingId ? `/profile/bookings/${bookingId}` : '/profile/bookings',
      booking_cancelled: bookingId ? `/profile/bookings/${bookingId}` : '/profile/bookings',
      booking_completed: bookingId ? `/profile/bookings/${bookingId}` : '/profile/bookings',

      service_request_offer: offerId ? `/marketplace/offers/${offerId}` : '/marketplace',
      offer_accepted: offerId ? `/marketplace/offers/${offerId}` : '/marketplace',
      offer_rejected: offerId ? `/marketplace/offers/${offerId}` : '/marketplace',

      store_follow: storeId ? `/stores/${storeId}` : '/stores',
      new_review: storeId ? `/stores/${storeId}/reviews` : '/stores',

      // Default route
      default: '/profile'
    };

    return actionUrls[notification.type] || actionUrls.default;
  }

  // Handle notification click with enhanced routing
  handleNotificationClick(notification, navigate) {
    // Mark as read (if not already)
    if (!notification.isRead) {
      this.markAsRead(notification.id).catch(() => { });
    }

    // Get appropriate URL
    const url = notification.actionUrl || this.getNotificationActionUrl(notification);

    // Handle special navigation with state
    const data = notification.metadata || {};

    if (data.conversationId || data.chatId) {
      navigate(url, {
        state: {
          selectedConversation: { id: data.conversationId || data.chatId }
        }
      });
    } else if (data.bookingId) {
      navigate(url, {
        state: {
          selectedBooking: data.bookingId
        }
      });
    } else if (data.offerId) {
      navigate(url, {
        state: {
          selectedOffer: data.offerId,
          offerDetails: {
            id: data.offerId,
            requestId: data.requestId,
            storeName: data.storeName,
            price: data.price,
            quotedPrice: data.quotedPrice
          }
        }
      });
    } else {
      navigate(url);
    }
  }

  // Create synthetic notification from chat data 
  createChatNotification(chat) {
    if (!chat) return null;

    return {
      id: `chat-${chat.id}-${Date.now()}`,
      type: 'new_message',
      title: chat.storeName || 'New message',
      subtitle: `You have ${chat.unreadCount || 1} unread message${chat.unreadCount > 1 ? 's' : ''}`,
      message: chat.lastMessage?.content || 'You have a new message',
      createdAt: chat.lastMessage?.createdAt || new Date(),
      avatar: chat.storeLogo || chat.participants?.find(p => p.id !== chat.userId)?.avatar || 'https://via.placeholder.com/40',
      isRead: false,
      data: {
        chatId: chat.id,
        conversationId: chat.id,
        senderName: chat.storeName || 'Store',
      }
    };
  }

  // Generate notifications from chat messages
  async generateChatNotifications() {
    try {
      const chatService = await import('./chatService').then(module => module.default);
      const chatResponse = await chatService.getConversations('customer');

      if (chatResponse.success && chatResponse.data) {
        const chatsWithUnread = chatResponse.data.filter(chat => chat.unreadCount > 0);

        if (chatsWithUnread.length > 0) {
          // Create synthetic notifications from chats
          const chatNotifications = chatsWithUnread
            .map(chat => this.createChatNotification(chat))
            .filter(Boolean)
            .map(notification => this.formatNotification(notification));

          // Store in fallback data
          this.fallbackNotifications = {
            ...this.fallbackNotifications,
            message: chatNotifications,
            unread: chatsWithUnread.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0),
            total: chatNotifications.length
          };

          return chatNotifications;
        }
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // NEW: Generate notifications from service offers
  async generateOfferNotifications() {
    try {
      const offerNotifications = await this.getServiceOfferNotifications();

      if (offerNotifications && offerNotifications.length > 0) {
        const formattedOffers = offerNotifications.map(notification =>
          this.formatNotification(notification)
        );

        // Store in fallback data
        this.fallbackNotifications = {
          ...this.fallbackNotifications,
          offer: formattedOffers,
          unread: this.fallbackNotifications.unread + formattedOffers.filter(n => !n.isRead).length,
          total: this.fallbackNotifications.total + formattedOffers.length
        };

        return formattedOffers;
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // Register a push notification subscription
  async registerPushSubscription(subscription) {
    try {
      const response = await fetch(`${this.API_BASE}/notifications/push-subscription`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ subscription })
      });

      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  // Unregister a push notification subscription
  async unregisterPushSubscription(subscriptionId) {
    try {
      const response = await fetch(`${this.API_BASE}/notifications/push-subscription/${subscriptionId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  // Request browser notifications permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Display a browser notification
  showBrowserNotification(notification) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const title = notification.title || 'New Notification';
      const options = {
        body: notification.message || notification.subtitle || '',
        icon: '/favicon.ico',
        badge: '/notification-badge.png',
        tag: `notification-${notification.id}`,
        data: notification
      };

      const browserNotification = new Notification(title, options);

      browserNotification.onclick = () => {
        window.focus();

        // Dispatch event so app can handle navigation
        window.dispatchEvent(new CustomEvent('notificationClicked', {
          detail: notification
        }));

        browserNotification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    } catch (error) {
      // Silent error handling
    }
  }

  // Process and emit realtime notification from websocket
  processRealtimeNotification(data) {
    try {
      // Format the notification for display
      const formattedNotification = this.formatNotification(data);

      // Show browser notification if supported
      this.showBrowserNotification(formattedNotification);

      return formattedNotification;
    } catch (error) {
      return null;
    }
  }

  // Subscribe to realtime notifications using socket.io
  subscribeToRealtimeNotifications(socketInstance, onNotificationReceived) {
    if (!socketInstance) return;

    // Listen for notification events
    socketInstance.on('new_notification', (data) => {
      const notification = this.processRealtimeNotification(data);
      if (notification && onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    socketInstance.on('service_offer_received', (data) => {
      // Create offer notification from service offer data
      const offerNotification = this.createOfferNotification(data);
      if (offerNotification && onNotificationReceived) {
        const formatted = this.formatNotification(offerNotification);
        onNotificationReceived(formatted);
      }
    });

    socketInstance.on('notification_read', (data) => {
      // You can handle this event if needed
    });

    socketInstance.on('notification_count_update', () => {
      // You can trigger a refresh here if needed
    });

    // Join the notifications room
    const token = this.getAuthToken();
    if (token) {
      socketInstance.emit('join_notifications', { token });
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
      return {
        success: true,
        data: {
          total: 0,
          unread: 0,
          byType: {
            message: 0,
            booking: 0,
            offer: 0,
            service_request_offer: 0,
            store_follow: 0
          }
        }
      };
    }
  }

  // NEW: Get service offers for notification generation with caching
  async getServiceOffersForNotifications() {
    try {
      // Check if we have cached offers from the last 5 minutes
      const cacheKey = 'service_offers_notifications';
      const cachedData = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);

      if (cachedData && cacheTime) {
        const timeDiff = Date.now() - parseInt(cacheTime);
        if (timeDiff < 5 * 60 * 1000) { // 5 minutes cache
          return JSON.parse(cachedData);
        }
      }

      const userServiceRequestService = await import('./userServiceRequestService')
        .then(module => module.default);

      const offersResponse = await userServiceRequestService.getUserOffers({
        page: 1,
        limit: 20,
        status: 'all' // Get all offers to properly track status changes
      });

      if (offersResponse.success && offersResponse.data?.offers) {
        // Cache the results
        sessionStorage.setItem(cacheKey, JSON.stringify(offersResponse.data.offers));
        sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());

        return offersResponse.data.offers;
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  // NEW: Check for new service offers since last check
  async checkForNewOffers() {
    try {
      const lastCheckKey = 'last_offer_check';
      const lastCheck = localStorage.getItem(lastCheckKey);
      const now = Date.now();

      // Update last check time
      localStorage.setItem(lastCheckKey, now.toString());

      const offers = await this.getServiceOffersForNotifications();

      if (!lastCheck) {
        // First time checking, don't show notifications for existing offers
        return [];
      }

      const lastCheckTime = new Date(parseInt(lastCheck));

      // Find offers that are new since last check
      const newOffers = offers.filter(offer => {
        const offerTime = new Date(offer.createdAt);
        return offerTime > lastCheckTime;
      });

      return newOffers.map(offer => this.createOfferNotification(offer));
    } catch (error) {
      return [];
    }
  }

  // NEW: Poll for service offer updates
  startServiceOfferPolling(onNewOffer, intervalMs = 60000) {
    // Clear any existing interval
    if (this.offerPollingInterval) {
      clearInterval(this.offerPollingInterval);
    }

    // Set up polling
    this.offerPollingInterval = setInterval(async () => {
      try {
        const newOffers = await this.checkForNewOffers();

        if (newOffers.length > 0 && onNewOffer) {
          newOffers.forEach(offer => {
            const formattedOffer = this.formatNotification(offer);
            onNewOffer(formattedOffer);

            // Show browser notification
            this.showBrowserNotification(formattedOffer);
          });
        }
      } catch (error) {
        // Silent error handling
      }
    }, intervalMs);

    return this.offerPollingInterval;
  }

  // NEW: Stop service offer polling
  stopServiceOfferPolling() {
    if (this.offerPollingInterval) {
      clearInterval(this.offerPollingInterval);
      this.offerPollingInterval = null;
    }
  }

  // NEW: Get offer notification by offer ID
  async getOfferNotificationById(offerId) {
    try {
      const offers = await this.getServiceOffersForNotifications();
      const offer = offers.find(o => o.id === offerId);

      if (offer) {
        return this.formatNotification(this.createOfferNotification(offer));
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // NEW: Mark offer as viewed (for notification tracking)
  markOfferAsViewed(offerId) {
    try {
      const viewedOffersKey = 'viewed_offers';
      const viewedOffers = JSON.parse(localStorage.getItem(viewedOffersKey) || '[]');

      if (!viewedOffers.includes(offerId)) {
        viewedOffers.push(offerId);
        localStorage.setItem(viewedOffersKey, JSON.stringify(viewedOffers));
      }
    } catch (error) {
      // Silent error handling
    }
  }

  // NEW: Check if offer has been viewed
  hasOfferBeenViewed(offerId) {
    try {
      const viewedOffersKey = 'viewed_offers';
      const viewedOffers = JSON.parse(localStorage.getItem(viewedOffersKey) || '[]');
      return viewedOffers.includes(offerId);
    } catch (error) {
      return false;
    }
  }

  // Enhanced service offer notification creation with better context
  createOfferNotification(offer) {
    if (!offer || !offer.id) return null;

    // Check if offer has been viewed
    const hasBeenViewed = this.hasOfferBeenViewed(offer.id);

    // Determine notification priority based on offer details
    let priority = 'normal';
    let urgencyIndicators = [];

    if (offer.status === 'pending') {
      // High-value offers
      if (offer.quotedPrice && parseFloat(offer.quotedPrice) > 500) {
        priority = 'high';
        urgencyIndicators.push('high-value');
      }

      // Verified/highly rated providers
      if (offer.verified && offer.rating > 4.5) {
        priority = priority === 'high' ? 'urgent' : 'high';
        urgencyIndicators.push('verified-provider');
      }

      // Quick response offers
      if (offer.responseTime &&
        (offer.responseTime.includes('Quick') || offer.responseTime.includes('hour'))) {
        urgencyIndicators.push('quick-response');
      }

      // Include supplies or warranty
      if (offer.includesSupplies || offer.warranty) {
        urgencyIndicators.push('value-added');
      }
    }

    // Create contextual title and message
    const title = this.generateOfferTitle(offer, urgencyIndicators);
    const subtitle = this.generateOfferSubtitle(offer);
    const message = this.generateOfferMessage(offer);

    return {
      id: `offer-${offer.id}-${Date.now()}`,
      type: 'service_request_offer',
      title,
      subtitle,
      message,
      description: offer.message || 'View offer details to see the full proposal',
      createdAt: offer.createdAt,
      avatar: offer.avatar || offer.storeDetails?.logo_url || 'https://via.placeholder.com/40',
      isRead: hasBeenViewed,
      priority,
      hasActions: true,
      actionUrl: `/marketplace/offers/${offer.id}`,
      data: {
        offerId: offer.id,
        requestId: offer.requestId,
        requestTitle: offer.requestTitle,
        requestCategory: offer.requestCategory,
        storeName: offer.storeName,
        storeId: offer.storeId,
        providerName: offer.providerName,
        providerId: offer.providerId,
        quotedPrice: offer.quotedPrice,
        price: offer.price,
        estimatedDuration: offer.estimatedDuration,
        availability: offer.availability,
        includesSupplies: offer.includesSupplies,
        warranty: offer.warranty,
        responseTime: offer.responseTime,
        verified: offer.verified,
        rating: offer.rating,
        storeDetails: offer.storeDetails,
        urgencyIndicators,
        status: offer.status
      },
      metadata: {
        offerId: offer.id,
        requestId: offer.requestId,
        storeId: offer.storeId,
        type: 'service_offer',
        category: offer.requestCategory,
        value: offer.quotedPrice,
        urgent: priority === 'urgent' || priority === 'high'
      }
    };
  }

  // Generate contextual offer title
  generateOfferTitle(offer, urgencyIndicators) {
    if (urgencyIndicators.includes('verified-provider')) {
      return '⭐ Verified Provider Made an Offer';
    }

    if (urgencyIndicators.includes('high-value')) {
      return '💰 Premium Service Offer Received';
    }

    if (urgencyIndicators.includes('quick-response')) {
      return '⚡ Quick Response Offer';
    }

    return 'New Service Offer Received';
  }

  // Generate contextual offer subtitle
  generateOfferSubtitle(offer) {
    const storeName = offer.storeName || offer.providerName || 'Provider';
    const price = offer.price || `${offer.quotedPrice}`;

    return `${storeName} offered ${price}`;
  }

  // Generate contextual offer message
  generateOfferMessage(offer) {
    const requestTitle = offer.requestTitle || 'your service request';
    const price = offer.price || `${offer.quotedPrice}`;

    let message = `${price} offer for "${requestTitle}"`;

    // Add value-added information
    const valueAdds = [];
    if (offer.includesSupplies) valueAdds.push('supplies included');
    if (offer.warranty) valueAdds.push('warranty offered');
    if (offer.estimatedDuration) valueAdds.push(`${offer.estimatedDuration} duration`);

    if (valueAdds.length > 0) {
      message += ` (${valueAdds.join(', ')})`;
    }

    return message;
  }

  // Clean up resources
  cleanup() {
    this.stopServiceOfferPolling();

    // Clear cached data
    const cacheKeys = ['service_offers_notifications', 'service_offers_notifications_time'];
    cacheKeys.forEach(key => sessionStorage.removeItem(key));
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;