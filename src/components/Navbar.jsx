import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Custom SVG Icons
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

// Additional icons for mobile navigation
const HomeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const FireIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.5 2C13.3 2.8 15 4.3 15 7c0 1.1-.9 2-2 2s-2-.9-2-2c0 .6-.4 2-1 3-1.6 2.6-1 5.4 2 7 0-1.3.7-2.7 2-3 1.3-.3 2.3-1.3 2.3-2.7 0-.7-.2-1.4-.6-2C17.1 8.8 18 7.4 18 6c0-3.3-2.7-6-6-6z" />
  </svg>
);

const StoreIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21V9a2 2 0 012-2h4a2 2 0 012 2v12" />
  </svg>
);

const ServiceIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const toggleLocation = () => {
    setIsLocationOpen(!isLocationOpen);
  };

  // Sample notification data
  const notifications = [
    {
      id: 1,
      title: "New Deal Available!",
      message: "50% off at Pizza Palace - Limited time offer",
      time: "2 hours ago",
      isRead: false
    },
    {
      id: 2,
      title: "Order Confirmed",
      message: "Your order #12345 has been confirmed",
      time: "1 day ago",
      isRead: true
    },
    {
      id: 3,
      title: "Welcome to D3!",
      message: "Discover amazing deals in your area",
      time: "3 days ago",
      isRead: true
    }
  ];

  // Categories/Services data
  const categories = [
    { id: 1, name: "Restaurants & Food", icon: "🍽️" },
    { id: 2, name: "Beauty & Spa", icon: "💅" },
    { id: 3, name: "Health & Fitness", icon: "💪" },
    { id: 4, name: "Entertainment", icon: "🎬" },
    { id: 5, name: "Shopping", icon: "🛍️" },
    { id: 6, name: "Travel & Hotels", icon: "✈️" },
    { id: 7, name: "Automotive", icon: "🚗" },
    { id: 8, name: "Home Services", icon: "🏠" },
    { id: 9, name: "Education", icon: "📚" },
    { id: 10, name: "Professional Services", icon: "💼" }
  ];

  // Locations data
  const locations = [
    { id: 1, name: "Westlands, Nairobi", area: "Current Location" },
    { id: 2, name: "CBD, Nairobi", area: "Central Business District" },
    { id: 3, name: "Karen, Nairobi", area: "Residential Area" },
    { id: 4, name: "Kilimani, Nairobi", area: "Shopping & Dining" },
    { id: 5, name: "Upperhill, Nairobi", area: "Business District" },
    { id: 6, name: "Kileleshwa, Nairobi", area: "Residential" },
    { id: 7, name: "Lavington, Nairobi", area: "Upmarket Area" },
    { id: 8, name: "Gigiri, Nairobi", area: "Diplomatic Area" },
    { id: 9, name: "Runda, Nairobi", area: "Residential Estate" },
    { id: 10, name: "Muthaiga, Nairobi", area: "Exclusive Suburb" }
  ];

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <header className="static bg-white shadow-sm border-b-2 border-gray-100 mb-4" style={{ position: 'static' }}>
      <div className="container mx-auto px-4">
        {/* Top Header */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center space-x-6">
            <div className="text-2xl font-bold text-red-500">D3</div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 relative">
              <MapPin className="w-4 h-4" />
              <button onClick={toggleLocation} className="flex items-center space-x-1 hover:text-red-600">
                <span>Westlands, Nairobi,Kenya</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Location Dropdown */}
              {isLocationOpen && (
                <div className="absolute top-8 left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800">Select Location</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {locations.map((location) => (
                      <button 
                        key={location.id} 
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setIsLocationOpen(false);
                          // Handle location selection here
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{location.name}</p>
                            <p className="text-xs text-gray-500">{location.area}</p>
                          </div>
                          {location.area === "Current Location" && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                      Use Current Location
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <button className="flex items-center space-x-1 text-black hover:text-red-600">
              <span>List on D3</span>
            </button>
            <button className="flex items-center space-x-1 text-black hover:text-red-600">
              <span>Customer Care</span>
            </button>
            <button className="flex items-center space-x-1 text-black hover:text-red-600">
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <div className="relative">
              <button onClick={toggleNotifications} className="relative">
                <NotificationIcon className="w-5 h-5 text-gray-600 hover:text-red-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              </button>
              
              {/* Notification Popup */}
              {isNotificationOpen && (
                <div className="absolute right-0 top-8 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
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
                              <div className="w-2 h-2 bg-red-500 rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">
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
          <nav className="hidden lg:flex items-center space-x-8">
            <div className="relative">
              <button onClick={toggleCategories} className="flex items-center space-x-1 text-gray-700 hover:text-red-600">
                <MenuIcon className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Categories Dropdown */}
              {isCategoriesOpen && (
                <div className="absolute top-8 left-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">All Categories</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {categories.map((category) => (
                      <button 
                        key={category.id} 
                        className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setIsCategoriesOpen(false);
                          // Handle category selection here
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{category.icon}</span>
                          <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                      View All Services
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link to="/" className="text-gray-700 hover:text-red-600">Home</Link>
            <Link to="/hotdeals" className="text-gray-700 hover:text-red-600">Hot Deals</Link>
            <Link to="/stores" className="text-gray-700 hover:text-red-600">Stores</Link>
            <Link to="/requestservice" className="text-gray-700 hover:text-red-600">Request Service</Link>
            <Link to="/chat" className="text-gray-700 hover:text-red-600">Chat</Link>
          </nav>
          
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for deals, services, offers..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-4 py-2 rounded-md">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button onClick={toggleMobileMenu} className="lg:hidden">
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <div className="relative">
                <button onClick={toggleCategories} className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 text-left w-full">
                  <MenuIcon className="w-4 h-4" />
                  <span>All Categories</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {/* Mobile Categories Dropdown */}
                {isCategoriesOpen && (
                  <div className="mt-2 mx-4 bg-gray-50 rounded-lg">
                    {categories.map((category) => (
                      <button 
                        key={category.id} 
                        className="w-full p-3 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => {
                          setIsCategoriesOpen(false);
                          setIsMobileMenuOpen(false);
                          // Handle category selection here
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="text-sm text-gray-900">{category.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/" className="text-gray-700 hover:text-red-600 px-4 py-2 block flex items-center space-x-2">
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link to="/hotdeals" className="text-gray-700 hover:text-red-600 px-4 py-2 block flex items-center space-x-2">
                <FireIcon className="w-4 h-4" />
                <span>Hot Deals</span>
              </Link>
              <Link to="/stores" className="text-gray-700 hover:text-red-600 px-4 py-2 block flex items-center space-x-2">
                <StoreIcon className="w-4 h-4" />
                <span>Stores</span>
              </Link>
              <Link to="/requestservice" className="text-gray-700 hover:text-red-600 px-4 py-2 block flex items-center space-x-2">
                <ServiceIcon className="w-4 h-4" />
                <span>Request Service</span>
              </Link>
              <Link to="/chat" className="text-gray-700 hover:text-red-600 px-4 py-2 block flex items-center space-x-2">
                <ChatIcon className="w-4 h-4" />
                <span>Chat</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;