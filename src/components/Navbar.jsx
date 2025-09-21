// components/Navbar.jsx - Complete updated navbar with extracted notification component
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import authService from '../services/authService';
import RealTimeSearch from './RealTimeSearch';
import NotificationButton from './NotificationButton';
import { useLocation } from '../contexts/LocationContext';
import chatService from '../services/chatService';

// SVG Icons
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

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const StoreIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
    <path d="M2 7h20"></path>
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"></path>
    <path d="M18 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"></path>
    <path d="M10 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"></path>
    <path d="M6 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"></path>
  </svg>
);

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

const TagIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
  </svg>
);

const ServiceIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Heart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const Navbar = () => {
  // Location hook with fallback
  const useSafeLocation = () => {
    try {
      return useLocation();
    } catch (error) {
      console.warn('LocationProvider not found, using minimal fallback');
      return {
        currentLocation: 'All Locations',
        isLocationLoading: false,
        availableLocations: [],
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

  const {
    currentLocation,
    isLocationLoading,
    availableLocations,
    changeLocation,
    getShortLocationName,
    getCurrentLocationFromBrowser
  } = useSafeLocation();

  // State management
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // User and authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chat count state (for mobile navigation badge)
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const navigate = useNavigate();
  const location = useRouterLocation();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
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

  // Load chat message counts (for mobile navigation badge)
  const loadUnreadChatMessages = async () => {
    try {
      if (!authService.isAuthenticated()) {
        setUnreadChatCount(0);
        return;
      }

      const chatToken = chatService.getAuthToken();
      if (!chatToken) {
        setUnreadChatCount(0);
        return;
      }

      const response = await chatService.getConversations('customer');

      if (response.success && response.data) {
        const totalUnreadCount = response.data.reduce((total, chat) => {
          return total + (chat.unreadCount || 0);
        }, 0);

        setUnreadChatCount(totalUnreadCount);
      } else {
        setUnreadChatCount(0);
      }
    } catch (error) {
      console.error('Error loading unread chat messages:', error);
      setUnreadChatCount(0);
    }
  };

  // Load chat data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadChatMessages();
    }
  }, [isAuthenticated]);

  // Refresh chat counts periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadUnreadChatMessages();
    }, 30000);

    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        loadUnreadChatMessages();
      }
    };

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
  const toggleLocation = () => setIsLocationOpen(!isLocationOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

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

  // Location handlers
  const handleLocationSelect = async (selectedLocation) => {
    try {
      await changeLocation(selectedLocation.name);
      setIsLocationOpen(false);

      const locationChangeEvent = new CustomEvent('locationChanged', {
        detail: {
          location: selectedLocation.name,
          source: 'navbar',
          timestamp: Date.now()
        }
      });

      window.dispatchEvent(locationChangeEvent);
    } catch (error) {
      console.error('Navbar: Error changing location:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      await getCurrentLocationFromBrowser();
      setIsLocationOpen(false);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const currentLocationDisplay = getShortLocationName();

  // Show loading state
  if (loading || isLocationLoading) {
    return (
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-400 bg-clip-text text-transparent">
                  D3
                </span>
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
                  <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-400 bg-clip-text text-transparent">
                    D3
                  </span>
                  <TagIcon className="w-5 h-5 text-indigo-600 inline ml-1" />
                </div>
                <div className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
                  DEALS
                </div>
              </Link>

              {/* Right Icons */}
              <div className="flex items-center space-x-3">
                {/* Search Toggle Button */}
                <button 
                  onClick={toggleSearch}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 backdrop-blur-sm transition-all duration-200 border border-slate-200/50"
                >
                  <Search className="w-5 h-5 text-slate-600" />
                </button>

                {/* Location Icon */}
                <div className="relative">
                  <button onClick={toggleLocation} className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 backdrop-blur-sm transition-all duration-200 border border-slate-200/50">
                    <MapPin className="w-5 h-5 text-slate-600" />
                  </button>

                  {/* Location Dropdown */}
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

                {/* Mobile Notifications */}
                <NotificationButton 
                  isMobile={true} 
                  isAuthenticated={isAuthenticated}
                />

                {/* Profile Button */}
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

            {/* Collapsible Mobile Search Bar */}
            <div className={`transition-all duration-300 ease-in-out ${
              isSearchOpen ? 'pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0 overflow-hidden'
            }`}>
              <div className="px-2">
                <RealTimeSearch
                  placeholder="Search for deals, coupons & stores..."
                  onNavigate={handleSearchNavigate}
                  onStoreClick={handleStoreClick}
                  onOfferClick={handleOfferClick}
                />
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            {/* Top Header */}
            <div className="flex items-center justify-between py-4 border-b border-slate-200/50">
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-4">
                  <Link to="/" className="flex items-center space-x-3">
                    <div className="text-3xl font-bold">
                      <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-400 bg-clip-text text-transparent">
                        D3
                      </span>
                      <TagIcon className="w-6 h-6 text-indigo-600 inline ml-1" />
                    </div>
                    <div className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
                      DEALS
                    </div>
                  </Link>
                </div>

                {/* Desktop location dropdown */}
                <div className="flex items-center space-x-3 text-sm text-slate-600 relative">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <button onClick={toggleLocation} className="flex items-center space-x-2 hover:text-indigo-600 transition-colors">
                    <span className="font-medium">{currentLocationDisplay}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Desktop Location Dropdown */}
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
                <a
                  href="https://merchants.discoun3ree.com/accounts/sign-up"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-slate-700 hover:text-indigo-600 transition-all duration-200 bg-slate-100/60 hover:bg-slate-200/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/50"
                >
                  <span>🏪</span>
                  <span className="font-medium">List Your Business</span>
                </a>
                <Link
                  to="/contact-us"
                  className="flex items-center space-x-2 text-slate-700 hover:text-indigo-600 transition-all duration-200 bg-slate-100/60 hover:bg-slate-200/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/50"
                >
                  <span>🎧</span>
                  <span className="font-medium">24/7 Support</span>
                </Link>

                {/* Authentication Section */}
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

                {/* Desktop Notifications */}
                <NotificationButton 
                  isMobile={false} 
                  isAuthenticated={isAuthenticated}
                />
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

              {/* Desktop Search Bar */}
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

        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 text-white py-1.5 px-4">
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          <Link
            to="/"
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-300 ${
              location.pathname === '/'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs font-semibold">Home</span>
          </Link>

          <Link
            to="/hotdeals"
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-300 ${
              location.pathname === '/hotdeals'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <FireIcon className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-md"></div>
            </div>
            <span className="text-xs font-semibold">Deals</span>
          </Link>

          <Link
            to="/stores"
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-300 ${
              location.pathname === '/stores'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <StoreIcon className="w-5 h-5" />
            <span className="text-xs font-semibold">Stores</span>
          </Link>

          <Link
            to="/requestservice"
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-300 ${
              location.pathname === '/requestservice'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <ServiceIcon className="w-5 h-5" />
            <span className="text-xs font-semibold">Service</span>
          </Link>

          <Link
            to="/chat"
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-300 ${
              location.pathname === '/chat'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <ChatIcon className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-lg border-2 border-white font-bold">
                  {unreadChatCount > 9 ? '9+' : unreadChatCount}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold">Chat</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;