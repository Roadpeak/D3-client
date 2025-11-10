import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import chatService from '../services/chatService';
import authService from '../services/authService';

// Icons
const NotificationIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const OfferIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const StoreIcon = ({ src, className, fallback = false }) => {
  const [error, setError] = useState(false);

  if (error || !src || fallback) {
    return (
      <div className={`flex items-center justify-center bg-blue-500 text-white rounded-full ${className}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Store Logo"
      className={`rounded-full object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
};

const NotificationButton = ({
  isMobile = false,
  isAuthenticated = false,
  className = ""
}) => {
  const navigate = useNavigate();

  // State management
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Ref for the dropdown container
  const dropdownRef = useRef(null);

  // Load comprehensive notifications
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setHasError(false);

      // Load notification counts first
      const countsResponse = await notificationService.getNotificationCounts();
      if (countsResponse.success) {
        setNotificationCounts(countsResponse.data);
      }

      // Load recent notifications
      const notificationsResponse = await notificationService.getNotifications({
        page: 1,
        limit: 10
      });

      if (notificationsResponse.success) {
        const formattedNotifications = notificationsResponse.data.notifications?.map(
          notification => notificationService.formatNotification(notification)
        ) || [];

        loadUnreadChatMessages(formattedNotifications);
      } else {
        loadUnreadChatMessages([]);
      }

    } catch (error) {
      setHasError(true);
      loadUnreadChatMessages([]);
    }
  }, [isAuthenticated]);

  // Load chat message counts and generate notifications
  const loadUnreadChatMessages = useCallback(async (existingNotifications = []) => {
    try {
      if (!isAuthenticated) {
        setUnreadChatCount(0);
        setNotifications(existingNotifications);
        setIsLoading(false);
        return;
      }

      const response = await chatService.getConversations('customer');

      if (response.success && response.data && Array.isArray(response.data)) {
        const chatsWithUnread = response.data.filter(chat => (chat.unreadCount || 0) > 0);
        const totalUnreadCount = chatsWithUnread.length;

        setUnreadChatCount(totalUnreadCount);

        let chatNotifications = [];
        if (totalUnreadCount > 0 && chatsWithUnread.length > 0) {
          const timestamp = Date.now();
          chatNotifications = chatsWithUnread.map((chat, index) => {
            let messageDate;
            try {
              messageDate = chat.lastMessageTime ? new Date(chat.lastMessageTime) : new Date();
              if (isNaN(messageDate.getTime())) {
                messageDate = new Date();
              }
            } catch (e) {
              messageDate = new Date();
            }

            const formattedTime = chatService.formatTime(messageDate);
            const chatId = chat.id || '';

            return {
              id: `chat-${chatId}-${timestamp}-${index}`,
              type: 'new_message',
              title: `New message from ${chat.store?.name || 'Store'}`,
              subtitle: chat.unreadCount > 1 ? `You have ${chat.unreadCount} unread messages` : undefined,
              message: chat.lastMessage || 'You have a new message',
              createdAt: messageDate,
              isRead: false,
              store: {
                id: chat.store?.id,
                name: chat.store?.name || 'Store',
                logo_url: chat.store?.avatar || null
              },
              avatar: chat.store?.avatar || null,
              data: {
                chatId: chatId,
                conversationId: chatId,
                unreadCount: chat.unreadCount || 1,
                storeName: chat.store?.name || 'Store',
                storeAvatar: chat.store?.avatar || null
              },
              time: formattedTime,
              timeAgo: formattedTime
            };
          });
        }

        const nonChatNotifs = existingNotifications.filter(notif =>
          notif.type !== 'new_message' &&
          notif.type !== 'chat_started' &&
          notif.type !== 'message_read' &&
          !notif.id?.startsWith('chat-')
        );

        const combinedNotifications = [...chatNotifications, ...nonChatNotifs];

        setNotifications(combinedNotifications);
      } else {
        setUnreadChatCount(0);
        setNotifications(existingNotifications);
      }
    } catch (error) {
      setUnreadChatCount(0);
      setNotifications(existingNotifications);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Load all notification data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, loadNotifications]);

  // Refresh notifications periodically and when user returns
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        loadNotifications();
      }
    };

    const handleNotificationUpdate = () => {
      loadNotifications();
    };

    const handleChatUpdate = () => {
      loadUnreadChatMessages(notifications);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('notificationUpdate', handleNotificationUpdate);
    window.addEventListener('chatUpdated', handleChatUpdate);
    window.addEventListener('messageReceived', handleChatUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('notificationUpdate', handleNotificationUpdate);
      window.removeEventListener('chatUpdated', handleChatUpdate);
      window.removeEventListener('messageReceived', handleChatUpdate);
    };
  }, [isAuthenticated, loadNotifications, loadUnreadChatMessages, notifications]);

  // Event handlers
  const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);

  const handleNotificationClick = async (notification) => {
    setIsNotificationOpen(false);

    // Handle service offer notifications - redirect to request-service
    if (notification.type === 'service_request_offer' || notification.type === 'offer_received') {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id).catch(() => { });
      }

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notification.id ? { ...notif, isRead: true } : notif
        )
      );

      setNotificationCounts(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));

      navigate('/request-service');
      return;
    }

    // For chat notifications
    if (notification.type === 'new_message' || notification.type === 'chat_started' || notification.id?.startsWith('chat-')) {
      const chatId = notification.data?.chatId || notification.metadata?.chatId;
      if (chatId) {
        if (!notification.isRead) {
          if (notification.id && !notification.id.startsWith('chat-')) {
            await notificationService.markAsRead(notification.id).catch(() => { });
          }
        }

        const unreadCount = notification.data?.unreadCount || 1;
        setUnreadChatCount(prev => Math.max(0, prev - unreadCount));

        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notification.id ? { ...notif, isRead: true } : notif
          )
        );

        setNotificationCounts(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          byType: {
            ...prev.byType,
            message: Math.max(0, prev.byType.message - 1)
          }
        }));

        navigate('/chat');
        return;
      }
    }

    // For other notifications
    notificationService.handleNotificationClick(notification, navigate);

    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notification.id ? { ...notif, isRead: true } : notif
      )
    );

    setNotificationCounts(prev => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1)
    }));

    window.dispatchEvent(new CustomEvent('notificationUpdate'));
  };

  const markAllNotificationsAsRead = async () => {
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

      setUnreadChatCount(0);
    } catch (error) {
      // Silently handle error
    }
  };

  // Calculate total unread count from actual notifications to avoid double counting
  const totalUnreadCount = notifications.filter(n => !n.isRead).length;

  if (!isAuthenticated) {
    return null;
  }

  // Render notification item
  const renderNotificationItem = (notification) => {
    // Special rendering for chat notifications
    if (notification.type === 'new_message' || notification.type === 'chat_started' || notification.id?.startsWith('chat-')) {
      const storeName = notification.store?.name || notification.data?.storeName || 'Store';
      const storeAvatar = notification.store?.logo_url || notification.avatar || notification.data?.storeAvatar;
      const unreadCount = notification.data?.unreadCount || 1;
      const messagePreview = notification.message || 'New message';

      return (
        <div
          key={notification.id}
          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notification.isRead ? 'bg-blue-50/30' : ''
            }`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start space-x-3">
            <div className="relative flex-shrink-0">
              <StoreIcon
                src={storeAvatar}
                className="w-10 h-10"
                fallback={!storeAvatar}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <ChatIcon className="w-2 h-2 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">New message from {storeName}</span>
                    {unreadCount > 1 && (
                      <span className="ml-1">
                        You have <span className="font-semibold">{unreadCount}</span> unread messages
                      </span>
                    )}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">{notification.time || notification.timeAgo}</p>
                  </div>
                  {messagePreview && (
                    <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                      {messagePreview}
                    </div>
                  )}
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default rendering for other notifications
    return (
      <div
        key={notification.id}
        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notification.isRead ? 'bg-blue-50/30' : ''
          }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start space-x-3">
          <div className="relative flex-shrink-0">
            <img
              src={notification.avatar || 'https://via.placeholder.com/40'}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/40';
              }}
            />
            {notification.type === 'mention' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
            {notification.type === 'request' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
            )}
            {notification.type === 'file' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
            )}
            {(notification.type === 'service_request_offer' || notification.type === 'offer_received') && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                <OfferIcon className="w-2 h-2 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{notification.title}</span>
                  {notification.subtitle && (
                    <span className="ml-1">{notification.subtitle}</span>
                  )}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-500">{notification.time || notification.timeAgo}</p>
                  {notification.team && (
                    <>
                      <span className="text-xs text-gray-300">•</span>
                      <p className="text-xs text-gray-500">{notification.team}</p>
                    </>
                  )}
                </div>
                {notification.description && (
                  <div className="mt-2 text-xs text-gray-600">
                    {notification.description}
                  </div>
                )}
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={toggleNotifications}
        className={`
          relative flex items-center justify-center transition-all duration-200
          ${isMobile
            ? 'w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 backdrop-blur-sm border border-slate-200/50'
            : 'bg-slate-100/60 hover:bg-slate-200/80 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/50'
          }
        `}
      >
        <NotificationIcon className="w-5 h-5 text-slate-600" />
        {totalUnreadCount > 0 && (
          <span className={`
            absolute bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg
            ${isMobile ? '-top-1 -right-1 w-4 h-4' : '-top-1 -right-1 w-5 h-5'}
          `}>
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <div className={`
          absolute bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden
          ${isMobile
            ? 'top-12 w-80 max-w-[calc(100vw-2rem)]'
            : 'right-0 top-12 w-96'
          }
        `}
          style={isMobile ? {
            right: '-1rem',
            transform: 'translateX(0)'
          } : {}}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {/* {notifications.length > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Mark all as read</span>
                </button>
              )} */}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No notification yet</h4>
                <p className="text-sm text-gray-500">
                  You'll see notifications here when they are available
                </p>
              </div>
            ) : (
              notifications.map(notification => renderNotificationItem(notification))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;