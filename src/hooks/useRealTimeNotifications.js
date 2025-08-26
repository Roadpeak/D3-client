// hooks/useRealTimeNotifications.js - Real-time notification system
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import notificationService from '../services/notificationService';
import { getTokenFromCookie } from '../config/api';

export const useRealTimeNotifications = (isAuthenticated) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCounts, setNotificationCounts] = useState({
    total: 0,
    unread: 0,
    byType: {
      message: 0,
      booking: 0,
      offer: 0,
      store_follow: 0
    }
  });
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize WebSocket connection
  const initializeSocket = () => {
    if (!isAuthenticated || socketRef.current) return;

    const token = getTokenFromCookie();
    if (!token) return;

    console.log('Connecting to WebSocket for real-time notifications...');

    // Create socket connection
    socketRef.current = io(process.env.REACT_APP_WS_URL || 'http://localhost:4000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      upgrade: true
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected for notifications');
      setIsConnected(true);
      
      // Join user's notification room
      socket.emit('join_notifications', { token });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isAuthenticated && !socketRef.current?.connected) {
          console.log('Attempting to reconnect WebSocket...');
          socket.connect();
        }
      }, 3000);
    });

    // Real-time notification events
    socket.on('new_notification', (notification) => {
      console.log('New real-time notification received:', notification);
      
      const formattedNotification = notificationService.formatNotification(notification);
      
      // Add to notifications list
      setNotifications(prev => [formattedNotification, ...prev.slice(0, 9)]);
      
      // Update counts
      setNotificationCounts(prev => ({
        total: prev.total + 1,
        unread: prev.unread + 1,
        byType: {
          ...prev.byType,
          [notification.type]: (prev.byType[notification.type] || 0) + 1
        }
      }));

      // Show browser notification if supported
      showBrowserNotification(formattedNotification);
    });

    socket.on('notification_count_update', () => {
      console.log('Notification counts updated, refreshing...');
      loadNotificationCounts();
    });

    // Chat-specific real-time updates
    socket.on('new_message', (data) => {
      console.log('New chat message received:', data);
      loadUnreadChatCount();
    });

    socket.on('message_read', (data) => {
      console.log('Chat message marked as read:', data);
      loadUnreadChatCount();
    });

    // Connection error handling
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });
  };

  // Load initial notification data
  const loadNotificationCounts = async () => {
    if (!isAuthenticated) return;

    try {
      const countsResponse = await notificationService.getNotificationCounts();
      if (countsResponse.success) {
        setNotificationCounts(countsResponse.data);
      }
    } catch (error) {
      console.error('Error loading notification counts:', error);
    }
  };

  const loadNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      const notificationsResponse = await notificationService.getNotifications({
        page: 1,
        limit: 10
      });

      if (notificationsResponse.success) {
        const formattedNotifications = notificationsResponse.data.notifications.map(
          notification => notificationService.formatNotification(notification)
        );
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Set fallback data
      setNotifications([]);
    }
  };

  const loadUnreadChatCount = async () => {
    try {
      if (!isAuthenticated) {
        setUnreadChatCount(0);
        return;
      }

      // This would integrate with your existing chat service
      const chatService = (await import('../services/chatService')).default;
      const response = await chatService.getConversations('customer');
      
      if (response.success && response.data) {
        const totalUnreadCount = response.data.reduce((total, chat) => {
          return total + (chat.unreadCount || 0);
        }, 0);
        
        setUnreadChatCount(totalUnreadCount);
      }
    } catch (error) {
      console.error('Error loading unread chat count:', error);
      setUnreadChatCount(0);
    }
  };

  // Browser notifications
  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/notification-badge.png',
        tag: `notification-${notification.id}`,
        renotify: false,
        requireInteraction: false,
        silent: false
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);

      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        // You could dispatch a custom event here to handle navigation
        window.dispatchEvent(new CustomEvent('notificationClicked', {
          detail: notification
        }));
        browserNotification.close();
      };
    }
  };

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  // Cleanup function
  const cleanup = () => {
    if (socketRef.current) {
      console.log('Disconnecting notification WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  };

  // Initialize when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Load initial data
      loadNotificationCounts();
      loadNotifications();
      loadUnreadChatCount();
      
      // Initialize WebSocket for real-time updates
      initializeSocket();
      
      // Request browser notification permission
      requestNotificationPermission();
    } else {
      // Clear data and cleanup when not authenticated
      setNotifications([]);
      setNotificationCounts({
        total: 0,
        unread: 0,
        byType: {
          message: 0,
          booking: 0,
          offer: 0,
          store_follow: 0
        }
      });
      setUnreadChatCount(0);
      cleanup();
    }

    return cleanup;
  }, [isAuthenticated]);

  // Refresh data periodically as fallback
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (!socketRef.current?.connected) {
        // Only poll if WebSocket isn't connected
        console.log('WebSocket not connected, polling for updates...');
        loadNotificationCounts();
        loadUnreadChatCount();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setNotificationCounts(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          byType: {
            ...prev.byType,
            [notification.type]: Math.max(0, prev.byType[notification.type] - 1)
          }
        }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      setNotificationCounts(prev => ({
        ...prev,
        unread: 0,
        byType: {
          message: 0,
          booking: 0,
          offer: 0,
          store_follow: 0
        }
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification, navigate) => {
    notificationService.handleNotificationClick(notification, navigate);
    markAsRead(notification.id);
  };

  return {
    notifications,
    notificationCounts,
    unreadChatCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    loadNotifications,
    loadNotificationCounts,
    loadUnreadChatCount,
    requestNotificationPermission
  };
};