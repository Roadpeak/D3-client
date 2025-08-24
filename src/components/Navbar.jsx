import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import authService from '../services/authService';
import api from '../config/api';
import RealTimeSearch from './RealTimeSearch';
import { useLocation } from '../contexts/LocationContext'; // Import the Location Context
import chatService from '../services/chatService'; // Import ChatService

// Custom SVG Icons with improved styling
const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const NotificationIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

// Modern compact icon components for mobile navigation
const HomeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const FireIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
  </svg>
);

const StoreIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" />
  </svg>
);

const ServiceIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
  </svg>
);

const TagIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const BookmarkIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
  </svg>
);

const Navbar = () => {
  // FIXED: Safe location hook without hardcoded fallback
  const useSafeLocation = () => {
    try {
      return useLocation();
    } catch (error) {
      // Return minimal fallback object when provider is missing
      console.warn('LocationProvider not found, using minimal fallback');
      return {
        currentLocation: 'All Locations', // Default to "All Locations"
        isLocationLoading: false,
        availableLocations: [], // Empty array instead of hardcoded locations
        changeLocation: async (location) => {
          console.log('Fallback: changing location to', location);
        },
        getShortLocationName: () => 'All Locations',
        getCurrentLocationFromBrowser: async () => {
          console.log('Fallback: getting current location');
        }
      };
    }
  };

  // Always call hooks in the same order
  const {
    currentLocation,
    isLocationLoading,
    availableLocations,
    changeLocation,
    getShortLocationName,
    getCurrentLocationFromBrowser
  } = useSafeLocation();

  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // User and authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const navigate = useNavigate();
  const location = useRouterLocation();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
    loadNotifications();
    loadUnreadChatMessages();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsAuthenticated(authService.isAuthenticated());

      if (authService.isAuthenticated()) {
        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      if (authService.isAuthenticated()) {
        // You can implement API call to get user notifications
        // const response = await api.get('/users/notifications');
        // setNotifications(response.data.notifications);
      }

      // For now, use sample data
      setNotifications([
        {
          id: 1,
          title: "Flash Sale Alert!",
          message: "Up to 70% off Electronics - Only 2 hours left!",
          time: "2 hours ago",
          isRead: false
        },
        {
          id: 2,
          title: "Coupon Applied",
          message: "Your 25% off coupon was successfully applied",
          time: "1 day ago",
          isRead: true
        },
        {
          id: 3,
          title: "Welcome Bonus!",
          message: "Get 50% off your first purchase with code WELCOME50",
          time: "3 days ago",
          isRead: true
        }
      ]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadChatMessages = async () => {
    try {
      if (!authService.isAuthenticated()) {
        setUnreadChatCount(0);
        return;
      }

      console.log('📨 Loading unread chat messages count...');
      
      // Check if ChatService has a valid token
      const chatToken = chatService.getAuthToken();
      if (!chatToken) {
        console.log('❌ No chat token available');
        setUnreadChatCount(0);
        return;
      }

      // Get all customer conversations with stores
      const response = await chatService.getConversations('customer');
      
      if (response.success && response.data) {
        // Calculate total unread count from all conversations
        const totalUnreadCount = response.data.reduce((total, chat) => {
          return total + (chat.unreadCount || 0);
        }, 0);
        
        console.log(`📊 Total unread chat messages: ${totalUnreadCount}`);
        setUnreadChatCount(totalUnreadCount);
      } else {
        console.log('⚠️ Failed to load chat conversations:', response.message);
        setUnreadChatCount(0);
      }
    } catch (error) {
      console.error('❌ Error loading unread chat messages:', error);
      setUnreadChatCount(0);
    }
  };

  // Refresh chat count periodically and when user returns to tab
  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh chat count every 30 seconds
    const interval = setInterval(() => {
      loadUnreadChatMessages();
    }, 30000);

    // Refresh when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        loadUnreadChatMessages();
      }
    };

    // Listen for chat updates from other components
    const handleChatUpdate = () => {
      loadUnreadChatMessages();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('chatUpdated', handleChatUpdate);
    window.addEventListener('messageReceived', handleChatUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('chatUpdated', handleChatUpdate);
      window.removeEventListener('messageReceived', handleChatUpdate);
    };
  }, [isAuthenticated]);

  // Event handlers
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);
  const toggleLocation = () => setIsLocationOpen(!isLocationOpen);

  // Search handlers for the RealTimeSearch component
  const handleSearchNavigate = (path) => {
    navigate(path);
  };

  const handleStoreClick = (storeId) => {
    navigate(`/Store/${storeId}`);
  };

  const handleOfferClick = (offerId) => {
    navigate(`/offer/${offerId}`);
  };

  // FIXED: Updated location handler using context
  const handleLocationSelect = async (selectedLocation) => {
    try {
      console.log('📍 Navbar: Changing location to:', selectedLocation.name);
      
      await changeLocation(selectedLocation.name);
      setIsLocationOpen(false);
      
      // Dispatch event with more details
      const locationChangeEvent = new CustomEvent('locationChanged', {
        detail: { 
          location: selectedLocation.name,
          source: 'navbar',
          timestamp: Date.now()
        }
      });
      
      console.log('📍 Navbar: Dispatching locationChanged event');
      window.dispatchEvent(locationChangeEvent);
      
    } catch (error) {
      console.error('❌ Navbar: Error changing location:', error);
    }
  };

  // Auto-detect location handler
  const handleUseCurrentLocation = async () => {
    try {
      await getCurrentLocationFromBrowser();
      setIsLocationOpen(false);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      // API call to mark notification as read
      // await api.put(`/notifications/${notificationId}/read`);

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      // API call to mark all notifications as read
      // await api.put('/notifications/mark-all-read');

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;
  const currentLocationDisplay = getShortLocationName();

  // Show loading state if either auth or location is loading
  if (loading || isLocationLoading) {
    return (
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">D3</span>
                <TagIcon className="w-6 h-6 text-indigo-600 inline ml-1" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="animate-pulse bg-slate-200 rounded-lg w-20 h-8"></div>
              <div className="animate-pulse bg-slate-200 rounded-full w-8 h-8"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-slate-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          {/* Mobile Top Header */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between py-4">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <div className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">D3</span>
                  <TagIcon className="w-5 h-5 text-indigo-600 inline ml-1" />
                </div>
                <div className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
                  DEALS
                </div>
              </Link>

              {/* Right Icons */}
              <div className="flex items-center space-x-3">
                {/* Location Icon Only */}
                <div className="relative">
                  <button onClick={toggleLocation} className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 backdrop-blur-sm transition-all duration-200 border border-slate-200/50">
                    <MapPin className="w-5 h-5 text-slate-600" />
                  </button>

                  {/* FIXED: Location Dropdown - Only show if locations are available */}
                  {isLocationOpen && availableLocations.length > 0 && (
                    <div className="absolute top-12 right-0 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl z-50">
                      <div className="p-5 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-slate-100/50">
                        <h3 className="text-sm font-semibold text-slate-800">Choose Your Location</h3>
                        <p className="text-xs text-slate-600 mt-1">Find the best deals near you</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {availableLocations.map((locationItem) => (
                          <button
                            key={locationItem.id}
                            className="w-full p-4 text-left hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 border-b border-slate-100/50 last:border-b-0 transition-all duration-200"
                            onClick={() => handleLocationSelect(locationItem)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{locationItem.name}</p>
                                <p className="text-xs text-slate-500">{locationItem.area}</p>
                              </div>
                              <div className="text-right">
                                {locationItem.name === currentLocation && (
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mb-1"></div>
                                )}
                                <p className="text-xs text-indigo-600 font-medium">{locationItem.offers}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-4 border-t border-slate-200/50 bg-slate-50/50">
                        <button
                          onClick={handleUseCurrentLocation}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2 transition-colors"
                        >
                          <span>📍</span>
                          <span>Use My Current Location</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show message if no locations available */}
                  {isLocationOpen && availableLocations.length === 0 && (
                    <div className="absolute top-12 right-0 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl z-50">
                      <div className="p-5 text-center">
                        <p className="text-sm text-slate-600">Loading locations...</p>
                        <button
                          onClick={handleUseCurrentLocation}
                          className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2 mx-auto transition-colors"
                        >
                          <span>📍</span>
                          <span>Use My Current Location</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button onClick={toggleNotifications} className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 backdrop-blur-sm transition-all duration-200 border border-slate-200/50">
                    <NotificationIcon className="w-5 h-5 text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Enhanced Notification Popup */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 top-12 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl z-50">
                      <div className="p-5 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-slate-100/50">
                        <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
                        <p className="text-xs text-slate-600 mt-1">Stay updated with the latest deals</p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500">
                            <div className="text-4xl mb-3">🔔</div>
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-slate-100/50 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 cursor-pointer ${!notification.isRead ? 'bg-gradient-to-r from-amber-50/50 to-orange-50/50' : ''
                                }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'
                                    }`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-slate-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full ml-2 mt-1"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && unreadCount > 0 && (
                        <div className="p-4 border-t border-slate-200/50 bg-slate-50/50">
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                          >
                            Mark all as read
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Button - Updated to navigate directly */}
                {isAuthenticated && user ? (
                  <Link
                    to="/profile"
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 backdrop-blur-sm transition-all duration-200 border border-slate-200/50"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-6 h-6 rounded-lg object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                        <span className="text-white text-xs font-semibold">
                          {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </Link>
                ) : (
                  <Link
                    to="/accounts/sign-in"
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 backdrop-blur-sm transition-all duration-200 border border-slate-200/50"
                  >
                    <User className="w-5 h-5 text-slate-600" />
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Search Bar - Updated with RealTimeSearch */}
            <div className="pb-4">
              <RealTimeSearch
                placeholder="Search for deals, coupons & stores..."
                onNavigate={handleSearchNavigate}
                onStoreClick={handleStoreClick}
                onOfferClick={handleOfferClick}
              />
            </div>
          </div>

          {/* Desktop Header - Updated Profile Section */}
          <div className="hidden lg:block">
            {/* Top Header */}
            <div className="flex items-center justify-between py-4 border-b border-slate-200/50">
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-4">
                  <Link to="/" className="flex items-center space-x-3">
                    <div className="text-3xl font-bold">
                      <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">D3</span>
                      <TagIcon className="w-6 h-6 text-indigo-600 inline ml-1" />
                    </div>
                    <div className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
                      DEALS
                    </div>
                  </Link>
                </div>

                {/* FIXED: Desktop location dropdown - only show if locations available */}
                <div className="flex items-center space-x-3 text-sm text-slate-600 relative">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <button onClick={toggleLocation} className="flex items-center space-x-2 hover:text-indigo-600 transition-colors">
                    <span className="font-medium">{currentLocationDisplay}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Location Dropdown */}
                  {isLocationOpen && availableLocations.length > 0 && (
                    <div className="absolute top-10 left-0 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl z-50">
                      <div className="p-5 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-slate-100/50">
                        <h3 className="text-sm font-semibold text-slate-800">Choose Your Location</h3>
                        <p className="text-xs text-slate-600 mt-1">Find the best deals near you</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {availableLocations.map((locationItem) => (
                          <button
                            key={locationItem.id}
                            className="w-full p-4 text-left hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 border-b border-slate-100/50 last:border-b-0 transition-all duration-200"
                            onClick={() => handleLocationSelect(locationItem)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{locationItem.name}</p>
                                <p className="text-xs text-slate-500">{locationItem.area}</p>
                              </div>
                              <div className="text-right">
                                {locationItem.name === currentLocation && (
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mb-1"></div>
                                )}
                                <p className="text-xs text-indigo-600 font-medium">{locationItem.offers}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-4 border-t border-slate-200/50 bg-slate-50/50">
                        <button
                          onClick={handleUseCurrentLocation}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2 transition-colors"
                        >
                          <span>📍</span>
                          <span>Use My Current Location</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show loading/empty state for desktop too */}
                  {isLocationOpen && availableLocations.length === 0 && (
                    <div className="absolute top-10 left-0 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl z-50">
                      <div className="p-5 text-center">
                        <p className="text-sm text-slate-600">Loading locations...</p>
                        <button
                          onClick={handleUseCurrentLocation}
                          className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2 mx-auto transition-colors"
                        >
                          <span>📍</span>
                          <span>Use My Current Location</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <button className="flex items-center space-x-2 text-slate-700 hover:text-indigo-600 transition-all duration-200 bg-slate-100/60 hover:bg-slate-200/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/50">
                  <span>🏪</span>
                  <span className="font-medium">List Your Business</span>
                </button>
                <button className="flex items-center space-x-2 text-slate-700 hover:text-indigo-600 transition-all duration-200 bg-slate-100/60 hover:bg-slate-200/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/50">
                  <span>🎧</span>
                  <span className="font-medium">24/7 Support</span>
                </button>

                {/* Authentication Section - Updated to navigate directly */}
                {isAuthenticated && user ? (
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 text-slate-700 hover:text-indigo-600 transition-all duration-200 bg-slate-100/60 hover:bg-slate-200/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/50"
                  >
                    <div className="flex items-center space-x-2">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-6 h-6 rounded-lg object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <span className="text-white text-xs font-semibold">
                            {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">{user.firstName}</span>
                    </div>
                  </Link>
                ) : (
                  <Link to="/accounts/sign-in">
                    <button className="flex items-center space-x-3 text-slate-700 hover:text-indigo-600 transition-all duration-200 bg-slate-100/60 hover:bg-slate-200/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/50">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span className="font-medium">Sign In</span>
                      </div>
                    </button>
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative">
                  <button onClick={toggleNotifications} className="relative flex items-center bg-slate-100/60 hover:bg-slate-200/80 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/50 transition-all duration-200">
                    <NotificationIcon className="w-5 h-5 text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Enhanced Notification Popup */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 top-12 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl z-50">
                      <div className="p-5 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-slate-100/50">
                        <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
                        <p className="text-xs text-slate-600 mt-1">Stay updated with the latest deals</p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500">
                            <div className="text-4xl mb-3">🔔</div>
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-slate-100/50 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 cursor-pointer ${!notification.isRead ? 'bg-gradient-to-r from-amber-50/50 to-orange-50/50' : ''
                                }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'
                                    }`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-slate-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full ml-2 mt-1"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && unreadCount > 0 && (
                        <div className="p-4 border-t border-slate-200/50 bg-slate-50/50">
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                          >
                            Mark all as read
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="flex items-center justify-between py-5">
              <nav className="flex items-center space-x-4 ml-8">
                <Link to="/" className={`text-slate-700 hover:text-indigo-600 font-medium transition-all duration-200 px-4 py-2.5 rounded-xl hover:bg-slate-100/60 ${location.pathname === '/' ? 'text-indigo-600 bg-slate-100/60' : ''}`}>
                  Home
                </Link>
                <Link to="/hotdeals" className={`text-slate-700 hover:text-indigo-600 font-medium transition-all duration-200 px-4 py-2.5 rounded-xl hover:bg-slate-100/60 relative ${location.pathname === '/hotdeals' ? 'text-indigo-600 bg-slate-100/60' : ''}`}>
                  Hot Deals
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">🔥</span>
                </Link>
                <Link to="/stores" className={`text-slate-700 hover:text-indigo-600 font-medium transition-all duration-200 px-4 py-2.5 rounded-xl hover:bg-slate-100/60 ${location.pathname === '/stores' ? 'text-indigo-600 bg-slate-100/60' : ''}`}>
                  Stores
                </Link>
                <Link to="/requestservice" className={`text-slate-700 hover:text-indigo-600 font-medium transition-all duration-200 px-4 py-2.5 rounded-xl hover:bg-slate-100/60 ${location.pathname === '/requestservice' ? 'text-indigo-600 bg-slate-100/60' : ''}`}>
                  Request Service
                </Link>
                <Link to="/chat" className={`text-slate-700 hover:text-indigo-600 font-medium transition-all duration-200 px-4 py-2.5 rounded-xl hover:bg-slate-100/60 relative ${location.pathname === '/chat' ? 'text-indigo-600 bg-slate-100/60' : ''}`}>
                  Chat
                  {unreadChatCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg">
                      {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </span>
                  )}
                </Link>
              </nav>

              {/* Desktop Search Bar - Updated with RealTimeSearch */}
              <div className="flex-1 max-w-3xl mx-8">
                <RealTimeSearch
                  placeholder="Search for deals, coupons & stores..."
                  onNavigate={handleSearchNavigate}
                  onStoreClick={handleStoreClick}
                  onOfferClick={handleOfferClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modern Promotional Banner - Moved Below Navbar Content */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-1.5 px-4">
          <div className="container mx-auto flex items-center justify-center text-center">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></div>
              <span className="text-xs font-medium tracking-wide">Get up to 90% OFF from your favourite service providers</span>
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/50 shadow-xl z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link
            to="/"
            className={`flex flex-col items-center space-y-1 px-3 py-3 rounded-xl transition-all duration-200 ${location.pathname === '/'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>

          <Link
            to="/hotdeals"
            className={`flex flex-col items-center space-y-1 px-3 py-3 rounded-xl transition-all duration-200 relative ${location.pathname === '/hotdeals'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
          >
            <FireIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Deals</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </Link>

          <Link
            to="/stores"
            className={`flex flex-col items-center space-y-1 px-3 py-3 rounded-xl transition-all duration-200 ${location.pathname === '/stores'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
          >
            <StoreIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Stores</span>
          </Link>

          <Link
            to="/chat"
            className={`flex flex-col items-center space-y-1 px-3 py-3 rounded-xl transition-all duration-200 relative ${location.pathname === '/chat'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
          >
            <div className="relative">
              <ChatIcon className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
                  {unreadChatCount > 9 ? '9+' : unreadChatCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Chat</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;