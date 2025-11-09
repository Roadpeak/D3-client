import { useState, useEffect, useCallback } from 'react';
import { Heart, Grid, List, ChevronLeft, ChevronRight, X, Loader2, AlertCircle, RefreshCw, Filter, MapPin, Clock, Star, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import { offerAPI } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import authService from '../services/authService';

// Store Logo Component with fallback to initials
const StoreLogo = ({
  logoUrl,
  storeName,
  className = "w-5 h-5",
  containerClassName = "w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!logoUrl);

  // Reset error state when logoUrl changes
  useEffect(() => {
    if (logoUrl && logoUrl !== '/api/placeholder/20/20') {
      setHasError(false);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [logoUrl]);

  // Get first letter of store name, fallback to 'S'
  const getInitial = (name) => {
    return name && name.trim() ? name.trim().charAt(0).toUpperCase() : 'S';
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Show fallback if no logoUrl, has error, or is placeholder URL
  const showFallback = !logoUrl || hasError || logoUrl === '/api/placeholder/20/20';

  return (
    <div className={containerClassName}>
      {showFallback ? (
        <div className="w-full h-full flex items-center justify-center bg-blue-500 rounded-full">
          <span className="text-white text-sm font-medium">
            {getInitial(storeName)}
          </span>
        </div>
      ) : (
        <img
          src={logoUrl}
          alt={`${storeName} logo`}
          className={className}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default function Hotdeals() {
  const [viewMode, setViewMode] = useState('grid'); // Default to grid
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Data states
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [limit] = useState(12);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Location Context
  const { currentLocation, getShortLocationName } = useLocation();

  const navigate = useNavigate();

  // Favorites hook
  const {
    error: favoritesError,
    toggleFavorite,
    isFavorite,
    clearError: clearFavoritesError,
    initialized: favoritesInitialized
  } = useFavorites();

  // Function to check if offer is expired
  const isOfferExpired = useCallback((expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  }, []);

  // Calculate category counts from current offers (excluding expired)
  const calculateCategoryCounts = useCallback((offers) => {
    const counts = {};

    // Only count non-expired offers
    offers.filter(offer => !isOfferExpired(offer.expiration_date)).forEach(offer => {
      const category = offer.category || offer.service?.category || 'General';
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }, [isOfferExpired]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: limit,
        sortBy: sortBy,
        status: 'active',
        ...(selectedCategory && { category: selectedCategory })
      };

      // Add location filter from context
      if (currentLocation && currentLocation !== 'All Locations') {
        params.location = currentLocation;
      }

      const response = await offerAPI.getOffers(params);

      // Transform offers to match frontend expectations
      const transformedOffers = response.offers?.map(offer => ({
        id: offer.id,
        title: offer.title || offer.service?.name || "Special Offer",
        description: offer.description || offer.service?.description || "Get exclusive offers with these amazing deals",
        discount: `${offer.discount}% OFF`,
        image: offer.service?.image_url || '/api/placeholder/300/200',
        category: offer.service?.category || 'General',
        featured: offer.featured || false,
        store: {
          name: offer.store?.name || 'Store',
          id: offer.store?.id,
          googleLogo: offer.store?.logo_url || null
        },
        originalPrice: offer.service?.price || 0,
        discountedPrice: offer.service?.price ? (offer.service.price * (1 - offer.discount / 100)).toFixed(2) : 0,
        status: offer.status,
        service: offer.service,
        store_info: offer.store,
        expiration_date: offer.expiration_date
      })) || [];

      // Filter out expired offers for customer-facing page
      const activeOffers = transformedOffers.filter(offer => !isOfferExpired(offer.expiration_date));

      setOffers(activeOffers);
      setPagination(response.pagination || {});
      setRetryCount(0);

      // Update categories based on active (non-expired) offers only
      const counts = calculateCategoryCounts(activeOffers);
      const offerCategories = [...new Set(activeOffers.map(offer =>
        offer.category || offer.service?.category || 'General'
      ))];

      const updatedCategories = offerCategories.map(categoryName => ({
        name: categoryName,
        count: counts[categoryName] || 0
      }));

      updatedCategories.sort((a, b) => {
        if (a.count > 0 && b.count === 0) return -1;
        if (a.count === 0 && b.count > 0) return 1;
        return a.name.localeCompare(b.name);
      });

      setCategories(updatedCategories);

    } catch (err) {
      setError(`Failed to fetch offers: ${err.message || 'Unknown error'}`);

      // Add retry logic for network errors
      if (retryCount < 3 && (err.code === 'NETWORK_ERROR' || err.code === 'ECONNABORTED')) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, sortBy, selectedCategory, retryCount, calculateCategoryCounts, isOfferExpired, currentLocation]);

  // Enhanced favorite handling
  const handleFavoriteClick = useCallback(async (e, offer) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      const shouldLogin = window.confirm('Please log in to add favorites. Would you like to log in now?');
      if (shouldLogin) {
        navigate('/accounts/sign-in', {
          state: { returnUrl: window.location.pathname }
        });
      }
      return;
    }

    if (!favoritesInitialized) {
      return;
    }

    if (favoritesError) {
      clearFavoritesError();
    }

    const offerData = {
      id: offer.id,
      title: offer.title,
      description: offer.description,
      service: offer.service,
      store: offer.store_info
    };

    await toggleFavorite(offer.id, offerData);
  }, [isAuthenticated, favoritesInitialized, favoritesError, navigate, clearFavoritesError, toggleFavorite]);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
    setCurrentPage(1);
  }, [selectedCategory]);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.totalPages]);

  // Handle offer click with store ID
  const handleOfferClick = useCallback((offer) => {
    // Use the new URL structure with store ID when available
    const storeId = offer.store_info?.id || offer.store?.id;

    if (storeId) {
      navigate(`/store/${storeId}/offer/${offer.id}`);
    } else {
      // Fallback to simple offer route if no store ID
      navigate(`/offer/${offer.id}`);
    }
  }, [navigate]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSortBy('latest');
    setCurrentPage(1);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = authService.isAuthenticated();
      setIsAuthenticated(authStatus);
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Listen for location changes from navbar
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPage(1);
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, []);

  // Fetch data effect
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && offers.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin text-blue-500" size={24} />
            <span className="text-gray-600">Loading offers</span>
            {retryCount > 0 && (
              <span className="text-sm text-gray-500">({retryCount}/3)</span>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Navigation - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <a href='/' className="text-gray-500 hover:text-blue-500 text-sm">
                Home
              </a>
              <span className="text-sm text-gray-400">/</span>
              <span className="text-blue-500 font-medium text-sm">
                {currentLocation && currentLocation !== 'All Locations'
                  ? `Deals in ${getShortLocationName()}`
                  : 'All Deals'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              <div>
                <span className="block text-gray-700">{error}</span>
                {retryCount > 0 && (
                  <span className="text-sm text-gray-500">Retry attempt {retryCount}/3</span>
                )}
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 bg-white border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Favorites Error */}
      {favoritesError && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="text-gray-700">{favoritesError}</span>
            </div>
            <button
              onClick={clearFavoritesError}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 relative">
          {/* Desktop Sidebar - Keep as is */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="space-y-6">
              {/* Location Info */}
              {currentLocation && currentLocation !== 'All Locations' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <MapPin size={16} />
                    <h3 className="font-medium text-sm">Current Location</h3>
                  </div>
                  <p className="text-blue-800 font-medium">{getShortLocationName()}</p>
                  <p className="text-xs text-blue-500 mt-1">
                    Showing deals in your selected area
                  </p>
                </div>
              )}

              {/* Categories */}
              <div className="bg-white rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-700 text-sm">
                    Categories
                  </h3>

                  {(selectedCategory || sortBy !== 'latest') && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`text-sm transition-colors ${!selectedCategory ? 'text-blue-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      All Categories
                    </button>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {offers.length}
                    </span>
                  </li>
                  {categories.map((category, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <button
                        onClick={() => handleCategoryChange(category.name)}
                        className={`text-sm transition-colors ${selectedCategory === category.name ? 'text-blue-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {category.name}
                      </button>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {category.count}
                      </span>
                    </li>
                  ))}
                  {categories.length === 0 && !loading && (
                    <li className="text-sm text-gray-400 italic">
                      No categories available
                    </li>
                  )}
                </ul>
              </div>

              {/* Sort By Options */}
              <div className="bg-white rounded-lg pt-4 border-t border-gray-100">
                <h3 className="font-medium text-gray-700 text-sm mb-4">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { id: 'latest', label: 'Latest Deals' },
                    { id: 'discount', label: 'Highest Discount' },
                    { id: 'price_low_high', label: 'Price: Low to High' },
                    { id: 'price_high_low', label: 'Price: High to Low' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleSortChange(option.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === option.id
                        ? 'bg-blue-50 text-blue-500'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promo Card */}
              <div className="mt-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-5 text-white shadow-sm">
                  <h3 className="text-lg font-medium mb-2">Special Offers</h3>
                  <p className="text-sm text-blue-100 mb-3">Exclusive deals just for you</p>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg text-center mb-3">
                    <p className="font-medium">Up to 90% Off</p>
                  </div>
                  <button className="w-full bg-white text-blue-600 font-medium rounded-lg py-2 text-sm hover:bg-blue-50 transition-colors">
                    Browse More
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Modal */}
          {isFilterModalOpen && (
            <>
              {/* Overlay */}
              <div
                className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsFilterModalOpen(false)}
              />

              {/* Modal */}
              <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center rounded-t-3xl">
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 space-y-6">
                  {/* Location Info */}
                  {currentLocation && currentLocation !== 'All Locations' && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <MapPin size={16} />
                        <h3 className="font-medium text-sm">Current Location</h3>
                      </div>
                      <p className="text-blue-800 font-medium">{getShortLocationName()}</p>
                      <p className="text-xs text-blue-500 mt-1">
                        Showing deals in your selected area
                      </p>
                    </div>
                  )}

                  {/* Categories */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">Categories</h3>
                      {selectedCategory && (
                        <button
                          onClick={() => setSelectedCategory('')}
                          className="text-sm text-blue-500 hover:text-blue-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleCategoryChange('');
                          setIsFilterModalOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${!selectedCategory
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <span>All Categories</span>
                        <span className="text-sm bg-white px-2 py-1 rounded-full">
                          {offers.length}
                        </span>
                      </button>
                      {categories.map((category, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleCategoryChange(category.name);
                            setIsFilterModalOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${selectedCategory === category.name
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <span>{category.name}</span>
                          <span className="text-sm bg-white px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls - Reorganized for Mobile */}
            <div className="mb-6 flex items-center justify-between gap-2">
              {/* Left: View Mode + Sort */}
              <div className="flex items-center gap-2">
                {/* View Mode Buttons */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                      ? 'bg-white text-blue-500 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                    aria-label="List view"
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                      ? 'bg-white text-blue-500 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                    aria-label="Grid view"
                  >
                    <Grid size={18} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="discount">Highest Discount</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                </select>
              </div>

              {/* Right: Filter Button */}
              <button
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

            {/* Desktop Item Count */}
            {pagination.totalItems > 0 && (
              <div className="hidden md:block mb-4">
                <span className="text-sm text-gray-500">
                  Showing {Math.min((currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)} - {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} deals
                </span>
              </div>
            )}

            {/* Loading indicator for pagination */}
            {loading && offers.length > 0 && (
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin text-blue-500" size={20} />
                  <span className="text-sm text-gray-500">Loading</span>
                </div>
              </div>
            )}

            {/* Deals Grid/List */}
            <div className={`
              grid gap-3 md:gap-6 mb-8 
              ${viewMode === 'grid'
                ? 'grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
              }
            `}>
              {offers.map((offer) => {
                const isOfferFavorited = favoritesInitialized && isFavorite(offer.id);

                // Calculate time left if expiration date exists
                const calculateTimeLeft = (expirationDate) => {
                  if (!expirationDate) return null;
                  const now = new Date();
                  const expiry = new Date(expirationDate);
                  const timeDiff = expiry - now;

                  if (timeDiff <= 0) return 'Expired';

                  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                  if (days > 0) return `${days}d left`;
                  if (hours > 0) return `${hours}h left`;
                  return 'Ending soon';
                };

                const timeLeft = calculateTimeLeft(offer.expiration_date);

                return (
                  <div
                    key={offer.id}
                    className={`
                      bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group
                      ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''}
                    `}
                    onClick={() => handleOfferClick(offer)}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'sm:w-1/3' : ''}`}>
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${viewMode === 'list' ? 'h-48 sm:h-full' : 'h-40 md:h-48'}`}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/300/200';
                        }}
                      />

                      {/* Favorite button */}
                      <button
                        className={`
                          absolute top-2 right-2 p-1.5 md:p-2 rounded-full transition-all duration-200 shadow-lg
                          ${isOfferFavorited
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            : 'bg-white/90 text-gray-600 hover:bg-white hover:text-blue-500'}
                          ${!isAuthenticated || !favoritesInitialized ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                        `}
                        onClick={(e) => handleFavoriteClick(e, offer)}
                        disabled={!isAuthenticated || !favoritesInitialized}
                        title={
                          !isAuthenticated
                            ? 'Login to add favorites'
                            : !favoritesInitialized
                              ? 'Loading favorites...'
                              : isOfferFavorited
                                ? 'Remove from favorites'
                                : 'Add to favorites'
                        }
                      >
                        <Heart
                          size={16}
                          className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isOfferFavorited ? 'fill-current' : ''}`}
                        />
                      </button>

                      {/* Discount Badge */}
                      <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                        {offer.discount}
                      </div>
                    </div>

                    <div className={`p-3 md:p-4 flex flex-col ${viewMode === 'list' ? 'sm:flex-1' : ''}`}>
                      {/* Title */}
                      <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                        {offer.title}
                      </h3>

                      {/* Store info */}
                      <div className="flex items-center gap-2 mb-2">
                        <StoreLogo
                          logoUrl={offer.store?.googleLogo}
                          storeName={offer.store?.name || 'Store'}
                          className="w-4 h-4"
                          containerClassName="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
                        />
                        <span className="text-xs text-gray-500">
                          {offer.store?.name || 'Store name'}
                        </span>
                      </div>

                      {/* Category Badge - Only show in list view or if no time left */}
                      {(viewMode === 'list' || !timeLeft) && (
                        <div className="mb-2">
                          <span className="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                            {offer.category}
                          </span>
                        </div>
                      )}

                      {/* Time Left - Show in grid view */}
                      {viewMode === 'grid' && timeLeft && timeLeft !== 'Expired' && (
                        <div className="flex items-center space-x-1 text-orange-600 text-xs mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{timeLeft}</span>
                        </div>
                      )}

                      {/* Description - Only in list view */}
                      {viewMode === 'list' && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{offer.description}</p>
                      )}

                      {/* Pricing */}
                      <div className="flex flex-col mt-auto pt-2">
                        {offer.originalPrice > 0 && (
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-blue-600 text-base md:text-lg">
                                KSH {offer.discountedPrice}
                              </span>
                              <span className="text-gray-400 line-through text-xs">
                                KSH {offer.originalPrice}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* CTA button - Only in list view */}
                        {viewMode === 'list' && (
                          <button
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOfferClick(offer);
                            }}
                          >
                            Get Offer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No offers message */}
            {!loading && offers.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-300 mb-4">
                    <Search size={40} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No deals found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {currentLocation && currentLocation !== 'All Locations' ? (
                      selectedCategory
                        ? `No active deals found in "${selectedCategory}" category for ${getShortLocationName()}.`
                        : `No deals available in ${getShortLocationName()} right now.`
                    ) : (
                      selectedCategory
                        ? `No deals found in "${selectedCategory}" category.`
                        : 'No deals available right now.'
                    )}
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {(selectedCategory || sortBy !== 'latest') && (
                      <button
                        onClick={clearFilters}
                        className="text-blue-500 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Clear filters
                      </button>
                    )}

                    {currentLocation && currentLocation !== 'All Locations' && (
                      <button
                        className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        View all locations
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <nav className="flex flex-col items-center space-y-3 mt-8">
                <div className="flex items-center justify-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let page;
                      if (pagination.totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        page = pagination.totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          aria-label={`Page ${page}`}
                          aria-current={currentPage === page ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                      <>
                        <span className="w-9 h-9 flex items-center justify-center text-gray-400">
                          ...
                        </span>
                        <button
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => handlePageChange(pagination.totalPages)}
                          aria-label={`Page ${pagination.totalPages}`}
                        >
                          {pagination.totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {pagination.totalItems > 0 && (
                  <p className="text-center text-xs text-gray-500">
                    Page {currentPage} of {pagination.totalPages}
                  </p>
                )}
              </nav>
            )}

            {/* Location Stats */}
            {!loading && (
              <div className="mt-8 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <div className="flex flex-wrap items-center justify-between gap-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" />
                    {offers.length > 0 ? (
                      currentLocation && currentLocation !== 'All Locations'
                        ? <span>{offers.length} deals in {getShortLocationName()}</span>
                        : <span>{offers.length} deals available</span>
                    ) : (
                      currentLocation && currentLocation !== 'All Locations'
                        ? <span>No deals in {getShortLocationName()}</span>
                        : <span>No deals available</span>
                    )}
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                  >
                    <RefreshCw size={14} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center">
            <div className="mb-6">
              <h2 className="text-2xl font-medium text-white mb-2">
                Discover Amazing Deals
              </h2>
              <p className="text-blue-100">
                Save up to 90% with thousands of exclusive offers
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <a href="https://merchants.discoun3ree.com/accounts/sign-up"
                className="flex-1 bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-center">
                Add a Listing
              </a>
              <a href="/search"
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium border border-blue-400 hover:bg-blue-400 transition-colors text-center">
                Search Deals
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}