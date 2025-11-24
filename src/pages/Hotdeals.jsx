import { useState, useEffect, useCallback } from 'react';
import { Heart, Grid, List, ChevronLeft, ChevronRight, X, Loader2, AlertCircle, RefreshCw, Filter, MapPin, Clock, Star, Search } from 'lucide-react';
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
  containerClassName = "w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm transition-colors duration-200"
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!logoUrl);

  useEffect(() => {
    if (logoUrl && logoUrl !== '/api/placeholder/20/20') {
      setHasError(false);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [logoUrl]);

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

  const showFallback = !logoUrl || hasError || logoUrl === '/api/placeholder/20/20';

  return (
    <div className={containerClassName}>
      {showFallback ? (
        <div className="w-full h-full flex items-center justify-center bg-blue-500 dark:bg-blue-600 rounded-full">
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
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});

  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [limit] = useState(12);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { currentLocation, getShortLocationName } = useLocation();

  const navigate = useNavigate();

  const {
    error: favoritesError,
    toggleFavorite,
    isFavorite,
    clearError: clearFavoritesError,
    initialized: favoritesInitialized
  } = useFavorites();

  const isOfferExpired = useCallback((expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  }, []);

  const calculateCategoryCounts = useCallback((offers) => {
    const counts = {};
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

      if (currentLocation && currentLocation !== 'All Locations') {
        params.location = currentLocation;
      }

      const response = await offerAPI.getOffers(params);

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

      const activeOffers = transformedOffers.filter(offer => !isOfferExpired(offer.expiration_date));

      setOffers(activeOffers);
      setPagination(response.pagination || {});
      setRetryCount(0);

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

      if (retryCount < 3 && (err.code === 'NETWORK_ERROR' || err.code === 'ECONNABORTED')) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, sortBy, selectedCategory, retryCount, calculateCategoryCounts, isOfferExpired, currentLocation]);

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
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.totalPages]);

  const handleOfferClick = useCallback((offer) => {
    const storeId = offer.store_info?.id || offer.store?.id;

    if (storeId) {
      navigate(`/store/${storeId}/offer/${offer.id}`);
    } else {
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

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPage(1);
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Skeleton Components
  const OfferCardSkeleton = ({ isListView = false }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse ${isListView ? 'flex flex-col sm:flex-row' : ''}`}>
      <div className={`relative ${isListView ? 'sm:w-1/3' : ''}`}>
        <div className={`w-full bg-gray-200 dark:bg-gray-700 ${isListView ? 'h-48 sm:h-full' : 'h-40 md:h-48'}`} />
        {/* Discount badge placeholder */}
        <div className="absolute top-2 right-2 w-16 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />
        {/* Favorite button placeholder */}
        <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
      </div>
      <div className={`p-3 md:p-4 flex flex-col ${isListView ? 'sm:flex-1' : ''}`}>
        {/* Title */}
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        {/* Store info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {/* Category badge */}
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
        {/* Price */}
        <div className="mt-auto pt-2">
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );

  const SidebarSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {/* Categories skeleton */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      {/* Sort skeleton */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );

  const PageSkeleton = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Breadcrumb skeleton */}
      <div className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar skeleton - desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <SidebarSkeleton />
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Controls skeleton */}
            <div className="mb-6 flex items-center justify-between gap-2 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-md" />
                  <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-md" />
                </div>
                <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
              <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <OfferCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && offers.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation */}
      <div className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <a href='/' className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 text-sm transition-colors">
                Home
              </a>
              <span className="text-sm text-gray-400 dark:text-gray-600">/</span>
              <span className="text-blue-500 dark:text-blue-400 font-medium text-sm">
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500 dark:text-red-400" />
              <div>
                <span className="block text-gray-700 dark:text-gray-300">{error}</span>
                {retryCount > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">Retry attempt {retryCount}/3</span>
                )}
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 text-red-500 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm"
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
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-3 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400" />
              <span className="text-gray-700 dark:text-gray-300">{favoritesError}</span>
            </div>
            <button
              onClick={clearFavoritesError}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 relative">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="space-y-6">
              {/* Location Info */}
              {currentLocation && currentLocation !== 'All Locations' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 transition-colors duration-200">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                    <MapPin size={16} />
                    <h3 className="font-medium text-sm">Current Location</h3>
                  </div>
                  <p className="text-blue-800 dark:text-blue-300 font-medium">{getShortLocationName()}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    Showing deals in your selected area
                  </p>
                </div>
              )}

              {/* Categories */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 transition-colors duration-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                    Categories
                  </h3>
                  {(selectedCategory || sortBy !== 'latest') && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Reset All
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {/* All Categories Option */}
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                      !selectedCategory
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="font-medium">All Categories</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      !selectedCategory
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {offers.length}
                    </span>
                  </button>

                  {/* Category List */}
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryChange(category.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                        selectedCategory === category.name
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                          : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="font-medium truncate">{category.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        selectedCategory === category.name
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  ))}

                  {categories.length === 0 && !loading && (
                    <div className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-3">
                      No categories available
                    </div>
                  )}
                </div>
              </div>

              {/* Sort By Options */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 transition-colors duration-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  Sort By
                </h3>
                <div className="space-y-1.5">
                  {[
                    { id: 'latest', label: 'Latest Deals' },
                    { id: 'discount', label: 'Highest Discount' },
                    { id: 'price_low_high', label: 'Price: Low to High' },
                    { id: 'price_high_low', label: 'Price: High to Low' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleSortChange(option.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        sortBy === option.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25'
                          : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promo Card */}
              <div className="mt-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg p-5 text-white shadow-sm">
                  <h3 className="text-lg font-medium mb-2">Special Offers</h3>
                  <p className="text-sm text-blue-100 dark:text-blue-200 mb-3">Exclusive deals just for you</p>
                  <div className="bg-white/20 dark:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg text-center mb-3">
                    <p className="font-medium">Up to 90% Off</p>
                  </div>
                  <button className="w-full bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 font-medium rounded-lg py-2 text-sm hover:bg-blue-50 dark:hover:bg-white transition-colors">
                    Browse More
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Modal */}
          {isFilterModalOpen && (
            <>
              <div
                className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsFilterModalOpen(false)}
              />

              <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto transition-colors duration-200">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex justify-between items-center rounded-t-3xl">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Filters</h2>
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-4 space-y-6">
                  {currentLocation && currentLocation !== 'All Locations' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                        <MapPin size={16} />
                        <h3 className="font-medium text-sm">Current Location</h3>
                      </div>
                      <p className="text-blue-800 dark:text-blue-300 font-medium">{getShortLocationName()}</p>
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                        Showing deals in your selected area
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                        Categories
                      </h3>
                      {selectedCategory && (
                        <button
                          onClick={() => setSelectedCategory('')}
                          className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
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
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                          !selectedCategory
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <span className="font-medium">All Categories</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          !selectedCategory
                            ? 'bg-white/20 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}>
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
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                            selectedCategory === category.name
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                              : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <span className="font-medium">{category.name}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            selectedCategory === category.name
                              ? 'bg-white/20 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                          }`}>
                            {category.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="w-full bg-blue-500 dark:bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="mb-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    aria-label="List view"
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    aria-label="Grid view"
                  >
                    <Grid size={18} />
                  </button>
                </div>

                <select
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="discount">Highest Discount</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                </select>
              </div>

              <button
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors font-medium"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

            {pagination.totalItems > 0 && (
              <div className="hidden md:block mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {Math.min((currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)} - {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} deals
                </span>
              </div>
            )}

            {loading && offers.length > 0 && (
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin text-blue-500 dark:text-blue-400" size={20} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Loading</span>
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
                      bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300 cursor-pointer group
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

                      <div className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                        {offer.discount}
                      </div>

                      <button
                        className={`
                          absolute top-2 left-2 p-1.5 md:p-2 rounded-full transition-all duration-200 shadow-lg
                          ${isOfferFavorited
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400'}
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
                    </div>

                    <div className={`p-3 md:p-4 flex flex-col ${viewMode === 'list' ? 'sm:flex-1' : ''}`}>
                      <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {offer.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-2">
                        <StoreLogo
                          logoUrl={offer.store?.googleLogo}
                          storeName={offer.store?.name || 'Store'}
                          className="w-4 h-4"
                          containerClassName="w-6 h-6 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {offer.store?.name || 'Store name'}
                        </span>
                      </div>

                      {(viewMode === 'list' || !timeLeft) && (
                        <div className="mb-2">
                          <span className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">
                            {offer.category}
                          </span>
                        </div>
                      )}

                      {viewMode === 'grid' && timeLeft && timeLeft !== 'Expired' && (
                        <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 text-xs mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{timeLeft}</span>
                        </div>
                      )}

                      {viewMode === 'list' && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{offer.description}</p>
                      )}

                      <div className="flex flex-col mt-auto pt-2">
                        {offer.originalPrice > 0 && (
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-blue-600 dark:text-blue-400 text-base md:text-lg">
                                KSH {offer.discountedPrice}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500 line-through text-xs">
                                KSH {offer.originalPrice}
                              </span>
                            </div>
                          </div>
                        )}

                        {viewMode === 'list' && (
                          <button
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 hover:from-blue-600 hover:to-cyan-600 dark:hover:from-blue-700 dark:hover:to-cyan-700 text-white font-semibold py-2 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
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
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-300 dark:text-gray-600 mb-4">
                    <Search size={40} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No deals found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
                        className="text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Clear filters
                      </button>
                    )}

                    {currentLocation && currentLocation !== 'All Locations' && (
                      <button
                        className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
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
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent transition-colors"
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
                            ? 'bg-blue-500 dark:bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
                        <span className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-gray-500">
                          ...
                        </span>
                        <button
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {pagination.totalItems > 0 && (
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Page {currentPage} of {pagination.totalPages}
                  </p>
                )}
              </nav>
            )}

            {/* Location Stats */}
            {!loading && (
              <div className="mt-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                <div className="flex flex-wrap items-center justify-between gap-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500 dark:text-blue-400" />
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
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 py-12 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center">
            <div className="mb-6">
              <h2 className="text-2xl font-medium text-white mb-2">
                Discover Amazing Deals
              </h2>
              <p className="text-blue-100 dark:text-blue-200">
                Save up to 90% with thousands of exclusive offers
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <a href="https://merchants.discoun3ree.com/accounts/sign-up"
                className="flex-1 bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-white transition-colors text-center">
                Add a Listing
              </a>
              <a href="/search"
                className="flex-1 bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium border border-blue-400 dark:border-blue-500 hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors text-center">
                Search Deals
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}