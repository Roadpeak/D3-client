import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdCategory } from 'react-icons/md';
import authService from '../services/authService';
import api from '../config/api';

// Custom SVG Icons (keeping your existing ones)
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
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const FireIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
  </svg>
);

const StoreIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/>
  </svg>
);

const ServiceIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
  </svg>
);

const TagIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const Navbar = () => {
  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Westlands, Nairobi');
  
  // User and authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
    loadNotifications();
    loadCategories();
    loadLocations();
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
          title: "🔥 Flash Sale Alert!",
          message: "Up to 70% off Electronics - Only 2 hours left!",
          time: "2 hours ago",
          isRead: false
        },
        {
          id: 2,
          title: "✅ Coupon Applied",
          message: "Your 25% off coupon was successfully applied",
          time: "1 day ago",
          isRead: true
        },
        {
          id: 3,
          title: "🎉 Welcome Bonus!",
          message: "Get 50% off your first purchase with code WELCOME50",
          time: "3 days ago",
          isRead: true
        }
      ]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadCategories = async () => {
    try {
      // You can implement API call to get categories
      // const response = await api.get('/categories');
      // setCategories(response.data.categories);
      
      // For now, use sample data
      setCategories([
        { id: 1, name: "Food & Restaurants", icon: "🍕", discount: "Up to 50% off" },
        { id: 2, name: "Beauty & Wellness", icon: "💄", discount: "Up to 40% off" },
        { id: 3, name: "Health & Fitness", icon: "💪", discount: "Up to 60% off" },
        { id: 4, name: "Entertainment", icon: "🎬", discount: "Up to 35% off" },
        { id: 5, name: "Fashion & Shopping", icon: "👕", discount: "Up to 70% off" },
        { id: 6, name: "Travel & Hotels", icon: "✈️", discount: "Up to 45% off" },
        { id: 7, name: "Automotive", icon: "🚗", discount: "Up to 30% off" },
        { id: 8, name: "Home & Garden", icon: "🏠", discount: "Up to 55% off" },
        { id: 9, name: "Education", icon: "📚", discount: "Up to 40% off" },
        { id: 10, name: "Tech & Electronics", icon: "📱", discount: "Up to 65% off" }
      ]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadLocations = async () => {
    try {
      // You can implement API call to get locations
      // const response = await api.get('/locations');
      // setLocations(response.data.locations);
      
      // For now, use sample data
      setLocations([
        { id: 1, name: "Westlands, Nairobi", area: "Current Location", offers: "120 deals" },
        { id: 2, name: "CBD, Nairobi", area: "Central Business District", offers: "95 deals" },
        { id: 3, name: "Karen, Nairobi", area: "Residential Area", offers: "85 deals" },
        { id: 4, name: "Kilimani, Nairobi", area: "Shopping & Dining", offers: "110 deals" },
        { id: 5, name: "Upperhill, Nairobi", area: "Business District", offers: "75 deals" },
        { id: 6, name: "Kileleshwa, Nairobi", area: "Residential", offers: "60 deals" },
        { id: 7, name: "Lavington, Nairobi", area: "Upmarket Area", offers: "90 deals" },
        { id: 8, name: "Gigiri, Nairobi", area: "Diplomatic Area", offers: "45 deals" },
        { id: 9, name: "Runda, Nairobi", area: "Residential Estate", offers: "55 deals" },
        { id: 10, name: "Muthaiga, Nairobi", area: "Exclusive Suburb", offers: "40 deals" }
      ]);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  // Event handlers
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);
  const toggleCategories = () => setIsCategoriesOpen(!isCategoriesOpen);
  const toggleLocation = () => setIsLocationOpen(!isLocationOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    setCurrentLocation(selectedLocation.name);
    setIsLocationOpen(false);
    // You can implement location change logic here
  };

  const handleCategorySelect = (category) => {
    setIsCategoriesOpen(false);
    navigate(`/categories/${category.id}`);
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
  const currentLocationShort = currentLocation.split(',')[0];

  if (loading) {
    return (
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">D3</span>
                <TagIcon className="w-6 h-6 text-red-500 inline ml-1" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="animate-pulse bg-gray-200 rounded-lg w-20 h-8"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white py-2 px-4">
        <div className="container mx-auto flex items-center justify-center text-center">
          <div className="flex items-center space-x-2 animate-pulse">
            <span className="text-sm font-medium">Get upto 90%OFF from your favourite service providers</span>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Mobile Top Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">D3</span>
                <TagIcon className="w-5 h-5 text-red-500 inline ml-1" />
              </div>
              <div className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold animate-bounce">
                DEALS
              </div>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center space-x-2">
              {/* Location Icon Only */}
              <div className="relative">
                <button onClick={toggleLocation} className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors">
                  <MapPin className="w-5 h-5 text-red-500" />
                </button>
                
                {/* Location Dropdown */}
                {isLocationOpen && (
                  <div className="absolute top-10 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <h3 className="text-sm font-semibold text-gray-800">Choose Your Location</h3>
                      <p className="text-xs text-gray-600 mt-1">Find the best deals near you</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {locations.map((location) => (
                        <button 
                          key={location.id} 
                          className="w-full p-3 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          onClick={() => handleLocationSelect(location)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{location.name}</p>
                              <p className="text-xs text-gray-500">{location.area}</p>
                            </div>
                            <div className="text-right">
                              {location.area === "Current Location" && (
                                <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                              )}
                              <p className="text-xs text-red-600 font-medium">{location.offers}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-2">
                        <span>📍</span>
                        <span>Use My Current Location</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Categories Icon */}
              <button onClick={toggleCategories} className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 transition-colors">
                <MdCategory className="w-5 h-5 text-red-500" />
              </button>

              {/* Profile Button - Updated to navigate directly */}
              {isAuthenticated && user ? (
                <Link 
                  to="/profile"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </Link>
              ) : (
                <Link 
                  to="/accounts/sign-in"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </Link>
              )}

              {/* Notifications */}
              <div className="relative">
                <button onClick={toggleNotifications} className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-colors">
                  <NotificationIcon className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Enhanced Notification Popup */}
                {isNotificationOpen && (
                  <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                      <p className="text-xs text-gray-600 mt-1">Stay updated with the latest deals</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="text-4xl mb-2">🔔</div>
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-colors cursor-pointer ${
                              !notification.isRead ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium ${
                                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ml-2 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && unreadCount > 0 && (
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button 
                          onClick={markAllNotificationsAsRead}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
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

          {/* Mobile Search Bar */}
          <div className="pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Search for deals, coupons & stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Mobile Navigation */}
          <div className="pb-3">
            <div className="grid grid-cols-5 gap-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-2">
              <Link to="/" className={`flex flex-col items-center space-y-1 text-gray-700 hover:text-red-600 px-1 py-2 rounded-lg hover:bg-white transition-colors ${location.pathname === '/' ? 'text-red-600 bg-white' : ''}`}>
                <HomeIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Home</span>
              </Link>
              <Link to="/hotdeals" className={`flex flex-col items-center space-y-1 text-gray-700 hover:text-red-600 px-1 py-2 rounded-lg hover:bg-white transition-colors relative ${location.pathname === '/hotdeals' ? 'text-red-600 bg-white' : ''}`}>
                <FireIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Deals</span>
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-1.5 h-1.5 rounded-full"></span>
              </Link>
              <Link to="/stores" className={`flex flex-col items-center space-y-1 text-gray-700 hover:text-red-600 px-1 py-2 rounded-lg hover:bg-white transition-colors ${location.pathname === '/stores' ? 'text-red-600 bg-white' : ''}`}>
                <StoreIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Stores</span>
              </Link>
              <Link to="/requestservice" className={`flex flex-col items-center space-y-1 text-gray-700 hover:text-red-600 px-1 py-2 rounded-lg hover:bg-white transition-colors ${location.pathname === '/requestservice' ? 'text-red-600 bg-white' : ''}`}>
                <ServiceIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Services</span>
              </Link>
              <Link to="/chat" className={`flex flex-col items-center space-y-1 text-gray-700 hover:text-red-600 px-1 py-2 rounded-lg hover:bg-white transition-colors ${location.pathname === '/chat' ? 'text-red-600 bg-white' : ''}`}>
                <ChatIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Chat</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Header - Updated Profile Section */}
        <div className="hidden lg:block">
          {/* Top Header */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="text-3xl font-bold">
                    <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">D3</span>
                    <TagIcon className="w-6 h-6 text-red-500 inline ml-1" />
                  </div>
                  <div className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold animate-bounce">
                    DEALS
                  </div>
                </Link>
              </div>
              
              {/* Desktop location dropdown */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 relative">
                <MapPin className="w-4 h-4 text-red-500" />
                <button onClick={toggleLocation} className="flex items-center space-x-1 hover:text-red-600 transition-colors">
                  <span className="font-medium">{currentLocation}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {/* Location Dropdown */}
                {isLocationOpen && (
                  <div className="absolute top-8 left-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <h3 className="text-sm font-semibold text-gray-800">Choose Your Location</h3>
                      <p className="text-xs text-gray-600 mt-1">Find the best deals near you</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {locations.map((location) => (
                        <button 
                          key={location.id} 
                          className="w-full p-3 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          onClick={() => handleLocationSelect(location)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{location.name}</p>
                              <p className="text-xs text-gray-500">{location.area}</p>
                            </div>
                            <div className="text-right">
                              {location.area === "Current Location" && (
                                <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                              )}
                              <p className="text-xs text-red-600 font-medium">{location.offers}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-2">
                        <span>📍</span>
                        <span>Use My Current Location</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-lg">
                <span>🏪</span>
                <span className="font-medium">List Your Business</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg">
                <span>🎧</span>
                <span className="font-medium">24/7 Support</span>
              </button>
              
              {/* Authentication Section - Updated to navigate directly */}
              {isAuthenticated && user ? (
                <Link 
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
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
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span className="font-medium">Sign In</span>
                    </div>
                  </button>
                </Link>
              )}
              
              {/* Notifications */}
              <div className="relative">
                <button onClick={toggleNotifications} className="relative flex items-center bg-gradient-to-r from-yellow-50 to-orange-50 p-2 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors">
                  <NotificationIcon className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Enhanced Notification Popup */}
                {isNotificationOpen && (
                  <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                      <p className="text-xs text-gray-600 mt-1">Stay updated with the latest deals</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="text-4xl mb-2">🔔</div>
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-colors cursor-pointer ${
                              !notification.isRead ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium ${
                                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ml-2 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && unreadCount > 0 && (
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button 
                          onClick={markAllNotificationsAsRead}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
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
          <div className="flex items-center justify-between py-4">
            <nav className="flex items-center space-x-6">
              <div className="relative">
                <button onClick={toggleCategories} className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors bg-gradient-to-r from-red-50 to-pink-50 px-4 py-2 rounded-lg">
                  <MdCategory className="w-5 h-5" />
                  <span className="font-medium">All Categories</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <Link to="/" className={`text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 ${location.pathname === '/' ? 'text-red-600 bg-red-50' : ''}`}>
                Home
              </Link>
              <Link to="/hotdeals" className={`text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 relative ${location.pathname === '/hotdeals' ? 'text-red-600 bg-red-50' : ''}`}>
                Hot Deals
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">🔥</span>
              </Link>
              <Link to="/stores" className={`text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 ${location.pathname === '/stores' ? 'text-red-600 bg-red-50' : ''}`}>
                Stores
              </Link>
              <Link to="/requestservice" className={`text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 ${location.pathname === '/requestservice' ? 'text-red-600 bg-red-50' : ''}`}>
                Request Service
              </Link>
              <Link to="/chat" className={`text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 ${location.pathname === '/chat' ? 'text-red-600 bg-red-50' : ''}`}>
                Chat
              </Link>
            </nav>
            
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  placeholder="Search for deals, coupons & stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Popup Modal */}
      {isCategoriesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">All Categories</h3>
                <p className="text-sm text-gray-600 mt-1">Discover amazing deals across all categories</p>
              </div>
              <button 
                onClick={toggleCategories}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-white"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <button 
                    key={category.id} 
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 border border-gray-200 hover:border-red-200 transition-all duration-200 group"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{category.icon}</span>
                      <div className="text-left">
                        <span className="text-sm font-medium text-gray-900 block">{category.name}</span>
                        <span className="text-xs text-red-600 font-medium">{category.discount}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button 
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                onClick={() => {
                  setIsCategoriesOpen(false);
                  navigate('/hotdeals');
                }}
              >
                🔥 Explore All Hot Deals
              </button>
            </div> 
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;