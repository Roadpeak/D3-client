// components/Navbar.jsx - Updated with Dark Mode Support
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import authService from '../services/authService';
import RealTimeSearch from './RealTimeSearch';
import NotificationButton from './NotificationButton';
import { useLocation } from '../contexts/LocationContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import chatService from '../services/chatService';

// Import Lucide icons for desktop navigation
import {
  Search,
  MapPin,
  User,
  ChevronDown,
  Home,
  Flame,
  Store,
  FileText,
  MessageSquare,
  Building,
  Headphones,
  Video,
  Moon,
  Sun
} from 'lucide-react';

// For mobile view we keep the React icons
import { FaStore, FaFire } from "react-icons/fa6";
import { HiHome } from "react-icons/hi2";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { CiDiscount1 } from "react-icons/ci";

// Simple Reels Icon - Rounded square with play button (matching Instagram style)
const ReelsIcon = ({ className, isActive }) => (
  <div className={`relative w-6 h-6 ${isActive ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600' : 'border-2 border-current'} rounded-md flex items-center justify-center transition-all duration-300`}>
    <svg
      className={`w-3 h-3 ${isActive ? 'text-white' : 'text-current'}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  </div>
);

// Dark Mode Toggle Button Component
const DarkModeToggle = ({ isMobile = false }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  if (isMobile) {
    return (
      <button
        onClick={toggleDarkMode}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-all duration-200 shadow-md"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-300" />
        ) : (
          <Moon className="w-5 h-5 text-white" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center space-x-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <>
          <Sun className="w-3 h-3" />
          <span className="font-medium text-xs">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3 h-3" />
          <span className="font-medium text-xs">Dark</span>
        </>
      )}
    </button>
  );
};

const Navbar = () => {
  // Location hook with fallback
  const useSafeLocation = () => {
    try {
      return useLocation();
    } catch (error) {
      return {
        currentLocation: 'All Locations',
        isLocationLoading: false,
        availableLocations: [],
        changeLocation: async (location) => {
          // Fallback: changing location
        },
        getShortLocationName: () => 'All Locations',
        getCurrentLocationFromBrowser: async () => {
          // Fallback: getting current location
        }
      };
    }
  };

  const {
    currentLocation,
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

  // Chat count state
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Scroll state for collapsible navbar
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navigate = useNavigate();
  const location = useRouterLocation();

  // Check if we're on the request service page
  const isRequestServicePage = location.pathname === '/requestservice';

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle scroll behavior for collapsible navbar on request service page
  useEffect(() => {
    if (!isRequestServicePage) {
      setIsNavbarVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top or scrolling up, hide when scrolling down
      if (currentScrollY < 10) {
        setIsNavbarVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down - hide navbar
        setIsNavbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
        setIsNavbarVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isRequestServicePage, lastScrollY]);

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
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Load chat message counts
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

  // Search handlers
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
      // Error changing location
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      await getCurrentLocationFromBrowser();
      setIsLocationOpen(false);
    } catch (error) {
      // Error getting current location
    }
  };

  const currentLocationDisplay = getShortLocationName();

  // Memoize mobile navbar to prevent re-renders
  const mobileNavbar = useMemo(() => (
    <div className="lg:hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-b-3xl shadow-lg transition-opacity duration-200 opacity-100" style={{ willChange: 'opacity' }}>
      {/* Cyan-to-blue gradient section covering welcome and search - extends edge-to-edge */}
      <div className="pb-2 relative">
        {/* User Welcome Section */}
        <div className="flex items-center justify-between py-3 px-4">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm p-1.5 shadow-lg flex items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <span className="text-white font-bold text-lg leading-none tracking-tight">D3</span>
                <svg
                  className="w-6 h-2 text-yellow-400 mt-0.5"
                  viewBox="0 0 24 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M2 2 Q 12 8, 22 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side - Chat, Dark Mode, Notification Icon and Profile */}
          <div className="flex items-center space-x-3">
            {/* Chat Icon */}
            <Link
              to="/chat"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-all duration-200 relative shadow-md"
            >
              <IoChatbubbleEllipsesOutline className="w-5 h-5 text-white" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-blue-500 font-semibold shadow-lg animate-pulse">
                  {unreadChatCount > 9 ? '9+' : unreadChatCount}
                </span>
              )}
            </Link>

            {/* Dark Mode Toggle - Mobile */}
            <DarkModeToggle isMobile={true} />

            {/* Notification Icon */}
            {isAuthenticated ? (
              <NotificationButton
                isMobile={true}
                isAuthenticated={isAuthenticated}
              />
            ) : (
              <Link
                to="/accounts/sign-in"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-all duration-200 relative shadow-md"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
            )}

            {/* Profile Avatar */}
            {isAuthenticated && user ? (
              <Link to="/profile" className="flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20 shadow-md">
                    <span className="text-white text-sm font-semibold">
                      {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </Link>
            ) : (
              <Link to="/accounts/sign-in" className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Integrated Search Bar - uses RealTimeSearch component */}
        <div className="px-4">
          <RealTimeSearch
            placeholder="Search for Deals & Stores?"
            integratedMode={true}
            onNavigate={handleSearchNavigate}
            onStoreClick={handleStoreClick}
            onOfferClick={handleOfferClick}
            className="w-full"
          />
        </div>
      </div>
      {/* End of blue gradient section */}
    </div>
  ), [isAuthenticated, user, unreadChatCount, handleSearchNavigate, handleStoreClick, handleOfferClick]);

  return (
    <>
      <header className={`bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40 transition-transform duration-300 ${
        isRequestServicePage && !isNavbarVisible ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="container mx-auto lg:px-4">
          {/* Mobile Top Header */}
          {mobileNavbar}

          {/* Desktop Header */}
          <div className="hidden lg:block">
            {/* Top Header - White Background */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-900">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 p-1.5 shadow-lg flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-white font-bold text-lg leading-none tracking-tight">D3</span>
                      <svg
                        className="w-6 h-2 text-yellow-400 mt-0.5"
                        viewBox="0 0 24 8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M2 2 Q 12 8, 22 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-1 rounded-full font-medium">
                    DEALS
                  </div>
                </Link>

                {/* Desktop location dropdown */}
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 relative">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <button onClick={toggleLocation} className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <span className="font-medium text-xs">{currentLocationDisplay}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Desktop Location Dropdown */}
                  {isLocationOpen && availableLocations.length > 0 && (
                    <div className="absolute top-8 left-0 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-md z-50">
                      <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Choose Your Location</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Find the best deals near you</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {availableLocations.map((locationItem) => (
                          <button
                            key={locationItem.id}
                            className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100/50 dark:border-gray-700/50 last:border-b-0 transition-all duration-200"
                            onClick={() => handleLocationSelect(locationItem)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{locationItem.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{locationItem.area}</p>
                              </div>
                              <div className="text-right">
                                {locationItem.name === currentLocation && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mb-1"></div>
                                )}
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{locationItem.offers}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                        <button
                          onClick={handleUseCurrentLocation}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-2 transition-colors"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Use My Current Location</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {isLocationOpen && availableLocations.length === 0 && (
                    <div className="absolute top-8 left-0 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-md z-50">
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading locations...</p>
                        <button
                          onClick={handleUseCurrentLocation}
                          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-2 mx-auto transition-colors"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Use My Current Location</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <a
                  href="https://merchants.discoun3ree.com/accounts/sign-up"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                >
                  <Building className="w-3 h-3" />
                  <span className="font-medium text-xs">List Business</span>
                </a>
                <Link
                  to="/contact-us"
                  className="flex items-center space-x-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                >
                  <Headphones className="w-3 h-3" />
                  <span className="font-medium text-xs">Support</span>
                </Link>

                {/* Dark Mode Toggle - Desktop */}
                <DarkModeToggle isMobile={false} />

                {/* Authentication Section */}
                {isAuthenticated && user ? (
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-center space-x-1.5">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-5 h-5 rounded-md object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-xs">{user.firstName}</span>
                    </div>
                  </Link>
                ) : (
                  <Link to="/accounts/sign-in">
                    <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3 h-3" />
                        <span className="font-medium text-xs">Sign In</span>
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

          </div>
        </div>

        {/* Main Navigation - Blue Background - Full Width Edge to Edge */}
        <div className="hidden lg:block bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
          <div className="container mx-auto px-4 flex items-center justify-between py-2.5">
            <nav className="flex items-center space-x-1">
                  <Link to="/" className={`text-white hover:text-yellow-400 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center space-x-1.5 ${location.pathname === '/' ? 'text-yellow-400 bg-white/10' : ''}`}>
                    <Home className="w-3.5 h-3.5" />
                    <span>Home</span>
                  </Link>
                  <Link to="/hotdeals" className={`text-white hover:text-yellow-400 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/10 relative text-sm flex items-center space-x-1.5 ${location.pathname === '/hotdeals' ? 'text-yellow-400 bg-white/10' : ''}`}>
                    <Flame className="w-3.5 h-3.5" />
                    <span>Hot Deals</span>
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      <Flame className="w-2.5 h-2.5" />
                    </span>
                  </Link>
                  <Link to="/stores" className={`text-white hover:text-yellow-400 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center space-x-1.5 ${location.pathname === '/stores' ? 'text-yellow-400 bg-white/10' : ''}`}>
                    <Store className="w-3.5 h-3.5" />
                    <span>Stores</span>
                  </Link>
                  <Link to="/reels" className={`text-white hover:text-yellow-400 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center space-x-1.5 ${location.pathname === '/reels' ? 'text-yellow-400 bg-white/10' : ''}`}>
                    <Video className="w-3.5 h-3.5" />
                    <span>Reels</span>
                  </Link>
                  <Link to="/requestservice" className={`text-white hover:text-yellow-400 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center space-x-1.5 ${location.pathname === '/requestservice' ? 'text-yellow-400 bg-white/10' : ''}`}>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Request Service</span>
                  </Link>
                  <Link to="/chat" className={`text-white hover:text-yellow-400 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/10 relative text-sm flex items-center space-x-1.5 ${location.pathname === '/chat' ? 'text-yellow-400 bg-white/10' : ''}`}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                    {unreadChatCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-1 py-0.5 rounded-full">
                        {unreadChatCount > 9 ? '9+' : unreadChatCount}
                      </span>
                    )}
                  </Link>
            </nav>

            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-2xl mx-6">
              <RealTimeSearch
                placeholder="Search for deals, coupons & stores..."
                onNavigate={handleSearchNavigate}
                onStoreClick={handleStoreClick}
                onOfferClick={handleOfferClick}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Mobile Navigation - Enhanced with Instagram-style Reels icon */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 rounded-t-3xl shadow-2xl">
          {/* Reduced padding for more compact design */}
          <div className="grid grid-cols-5 gap-0 px-2 py-2">
            <Link
              to="/"
              className={`flex flex-col items-center justify-center space-y-1 px-2 py-1.5 rounded-2xl transition-all duration-300 active:scale-95 ${location.pathname === '/'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              <div className={`relative transition-transform duration-300 ${location.pathname === '/' ? 'scale-110' : ''}`}>
                <HiHome className="w-6 h-6" />
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${location.pathname === '/' ? 'font-semibold' : ''}`}>
                Home
              </span>
            </Link>

            <Link
              to="/hotdeals"
              className={`flex flex-col items-center justify-center space-y-1 px-2 py-1.5 rounded-2xl transition-all duration-300 active:scale-95 ${location.pathname === '/hotdeals'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              <div className={`relative transition-transform duration-300 ${location.pathname === '/hotdeals' ? 'scale-110' : ''}`}>
                <CiDiscount1 className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${location.pathname === '/hotdeals' ? 'font-semibold' : ''}`}>
                Deals
              </span>
            </Link>

            <Link
              to="/stores"
              className={`flex flex-col items-center justify-center space-y-1 px-2 py-1.5 rounded-2xl transition-all duration-300 active:scale-95 ${location.pathname === '/stores'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              <div className={`relative transition-transform duration-300 ${location.pathname === '/stores' ? 'scale-110' : ''}`}>
                <FaStore className="w-6 h-6" />
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${location.pathname === '/stores' ? 'font-semibold' : ''}`}>
                Stores
              </span>
            </Link>

            <Link
              to="/requestservice"
              className={`flex flex-col items-center justify-center space-y-1 px-2 py-1.5 rounded-2xl transition-all duration-300 active:scale-95 ${location.pathname === '/requestservice'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              <div className={`relative transition-transform duration-300 ${location.pathname === '/requestservice' ? 'scale-110' : ''}`}>
                <FaFire className="w-6 h-6" />
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${location.pathname === '/requestservice' ? 'font-semibold' : ''}`}>
                SR
              </span>
            </Link>

            <Link
              to="/reels"
              className={`flex flex-col items-center justify-center space-y-1 px-2 py-1.5 rounded-2xl transition-all duration-300 active:scale-95 ${location.pathname === '/reels'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              <div className={`relative transition-transform duration-300 ${location.pathname === '/reels' ? 'scale-110' : ''}`}>
                <ReelsIcon className="w-6 h-6" isActive={location.pathname === '/reels'} />
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${location.pathname === '/reels' ? 'font-semibold' : ''}`}>
                Reels
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;