import { useState, useEffect, useCallback } from 'react';
import { Heart, Grid, List, ChevronLeft, ChevronRight, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
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
  containerClassName = "w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200"
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
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
          <span className="text-white text-sm font-bold">
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

  // Favorites hook - only destructure what we use
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
        console.log('HOTDEALS - Adding location filter:', currentLocation);
      } else {
        console.log('HOTDEALS - No location filter (showing all)');
      }

      console.log('HOTDEALS - Fetching with params:', params);

      const response = await offerAPI.getOffers(params);
      
      console.log('HOTDEALS - API Response:', {
        offersReceived: response.offers?.length || 0,
        totalItems: response.pagination?.totalItems || 0,
        appliedLocation: params.location || 'All Locations'
      });
      
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
          googleLogo: offer.store?.logo_url || null // Don't set placeholder here
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
      
      console.log(`HOTDEALS - Total offers: ${transformedOffers.length}, Active: ${activeOffers.length}, Location: ${currentLocation}`);

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
      console.error('HOTDEALS - Error fetching offers:', err);
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

  const handleOfferClick = useCallback((offerId) => {
    navigate(`/offer/${offerId}`);
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
    const handleLocationChange = (event) => {
      console.log('HOTDEALS - Received location change event:', event.detail);
      setCurrentPage(1); // Reset pagination when location changes
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, []);

  // Debug location changes
  useEffect(() => {
    console.log('HOTDEALS - Location changed:', {
      currentLocation,
      shortName: getShortLocationName()
    });
  }, [currentLocation, getShortLocationName]);

  // Fetch data effect
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && offers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading offers...</span>
            {retryCount > 0 && (
              <span className="text-sm text-gray-500">(Retry {retryCount}/3)</span>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              <a href='/' className="text-gray-600 hover:text-red-500">Home</a>
              <span className="text-red-500 font-medium">
                {currentLocation && currentLocation !== 'All Locations' 
                  ? `Hot Deals - ${getShortLocationName()}` 
                  : 'Hot Deals - All Locations'
                }
              </span>
            </div>
            
            {/* Mobile Filter Button */}
            <button 
              className="md:hidden bg-red-500 text-white px-3 py-1 rounded text-sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              Filters
            </button>
          </div>
        </div>
      </nav>

      {/* Main Error */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <div>
                <span className="block">{error}</span>
                {retryCount > 0 && (
                  <span className="text-sm">Retry attempt {retryCount}/3</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleRetry} 
                className="ml-4 flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Favorites Error */}
      {favoritesError && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{favoritesError}</span>
            </div>
            <button 
              onClick={clearFavoritesError} 
              className="ml-4 text-yellow-800 hover:text-yellow-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 relative">
          {/* Sidebar - keeping original structure */}
          <div className={`${
            isSidebarOpen ? 'block' : 'hidden'
          } md:block w-full md:w-80 flex-shrink-0 ${
            isSidebarOpen ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : ''
          }`}>
            {/* Mobile Close Button */}
            {isSidebarOpen && (
              <div className="md:hidden flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X size={24} />
                </button>
              </div>
            )}

            <div className="p-4 md:p-0 space-y-6">
              {/* Location Info */}
              {currentLocation && currentLocation !== 'All Locations' && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-800 text-sm mb-2">CURRENT LOCATION</h3>
                  <p className="text-indigo-600 font-medium">{getShortLocationName()}</p>
                  <p className="text-xs text-indigo-500 mt-1">
                    Showing deals available in your area
                  </p>
                </div>
              )}

              {/* Categories */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 border-b border-yellow-400 pb-2">
                    CATEGORIES
                  </h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`text-sm ${!selectedCategory ? 'text-red-500 font-medium' : 'text-gray-600 hover:text-red-500'}`}
                    >
                      All Categories
                    </button>
                    <span className="text-xs text-gray-400">
                      ({offers.length})
                    </span>
                  </li>
                  {categories.length > 0 ? (
                    categories.map((category, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <button
                          onClick={() => handleCategoryChange(category.name)}
                          className={`text-sm ${selectedCategory === category.name ? 'text-red-500 font-medium' : 'text-gray-600 hover:text-red-500'}`}
                        >
                          {category.name}
                        </button>
                        <span className="text-xs text-gray-400">({category.count})</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 italic">
                      {loading ? 'Loading categories...' : 'No categories available'}
                    </li>
                  )}
                </ul>
                {(selectedCategory || sortBy !== 'latest') && (
                  <button 
                    onClick={clearFilters}
                    className="mt-4 text-xs text-blue-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Promo Ad */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 text-white text-center">
                <h3 className="text-xl font-bold mb-2">Special Deals</h3>
                <div className="bg-yellow-400 text-purple-800 px-4 py-2 rounded-lg font-bold text-lg mb-3">
                  SALE
                  <div className="text-sm">Get 20% Off</div>
                </div>
                <p className="text-sm mb-2">Limited Time Offers</p>
                <p className="text-lg font-bold">Amazing Savings</p>
                {currentLocation && currentLocation !== 'All Locations' && (
                  <p className="text-xs mt-2 text-purple-100">
                    Available in {getShortLocationName()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls - keeping original structure */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  <Grid size={16} />
                </button>
                {pagination.totalItems > 0 && (
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    Showing {Math.min((currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)} - {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
                    {currentLocation && currentLocation !== 'All Locations' && (
                      <span className="ml-1">in {getShortLocationName()}</span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 hidden sm:inline">Sort By:</span>
                <select 
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
            </div>

            {/* Loading indicator for pagination */}
            {loading && offers.length > 0 && (
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              </div>
            )}

            {/* Deals Grid - UPDATED WITH NEW STORE LOGO COMPONENT */}
            <div className={`grid gap-4 sm:gap-6 mb-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {offers.map((offer) => {
                const isOfferFavorited = favoritesInitialized && isFavorite(offer.id);
                
                return (
                  <div 
                    key={offer.id} 
                    className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                      viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                    }`}
                    onClick={() => handleOfferClick(offer.id)}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'sm:w-1/3' : ''}`}>
                      <img 
                        src={offer.image} 
                        alt={offer.title}
                        className={`w-full object-cover ${
                          viewMode === 'list' ? 'h-48 sm:h-full' : 'h-48'
                        }`}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/300/200';
                        }}
                      />
                      
                      <button 
                        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg ${
                          isOfferFavorited
                            ? 'bg-red-500 text-white shadow-red-200' 
                            : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                        } ${
                          !isAuthenticated || !favoritesInitialized
                            ? 'cursor-not-allowed opacity-50' 
                            : 'cursor-pointer'
                        }`}
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
                          className={isOfferFavorited ? 'fill-current' : ''} 
                        />
                      </button>

                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                          offer.featured ? 'bg-red-500' : 'bg-blue-500'
                        }`}>
                          {offer.category}
                        </span>
                      </div>
                      {offer.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                            FEATURED
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`p-4 ${viewMode === 'list' ? 'sm:flex-1' : ''}`}>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {/* UPDATED: Using the new StoreLogo component */}
                        <StoreLogo 
                          logoUrl={offer.store?.googleLogo}
                          storeName={offer.store?.name || 'Store'}
                        />
                        
                        <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-blue-400">
                          <span>{offer.store?.name || 'Store name'}</span>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{offer.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>
                      
                      {offer.originalPrice > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-lg font-bold text-green-600">
                            KSH{offer.discountedPrice}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            KSH{offer.originalPrice}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700">
                          {offer.discount}
                        </span>
                        
                        <button 
                          className={`px-8 py-4 rounded text-sm font-medium transition-colors ${
                            offer.featured ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOfferClick(offer.id);
                          }}
                        >
                          Get Offer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rest of the component remains the same - No offers message, Pagination, etc. */}
            {!loading && offers.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <Grid size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active offers found</h3>
                  <p className="text-gray-500 mb-4">
                    {currentLocation && currentLocation !== 'All Locations' ? (
                      selectedCategory 
                        ? `No active offers found in "${selectedCategory}" category for ${getShortLocationName()}.`
                        : `No active offers are currently available in ${getShortLocationName()}.`
                    ) : (
                      selectedCategory 
                        ? `No active offers found in "${selectedCategory}" category.`
                        : 'No active offers are currently available.'
                    )}
                  </p>
                  {(selectedCategory || sortBy !== 'latest') && (
                    <button 
                      onClick={clearFilters}
                      className="text-red-500 hover:underline mb-2"
                    >
                      Clear all filters
                    </button>
                  )}
                  {currentLocation && currentLocation !== 'All Locations' && (
                    <p className="text-sm text-gray-400">
                      Try selecting "All Locations" from the navbar dropdown for more deals
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                  <button 
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex space-x-2">
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
                          className={`px-3 py-2 rounded transition-colors ${
                            currentPage === page 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                      <>
                        <span className="px-3 py-2 hidden sm:inline">...</span>
                        <button 
                          className="px-3 py-2 rounded bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hidden sm:inline-block"
                          onClick={() => handlePageChange(pagination.totalPages)}
                        >
                          {pagination.totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  <button 
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                {pagination.totalItems > 0 && (
                  <p className="text-center text-sm text-gray-500">
                    Page {currentPage} of {pagination.totalPages} • {pagination.totalItems} total results
                    {currentLocation && currentLocation !== 'All Locations' && (
                      <span className="ml-1">in {getShortLocationName()}</span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Location Stats */}
            {!loading && (
              <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {offers.length > 0 ? (
                      currentLocation && currentLocation !== 'All Locations' 
                        ? `${offers.length} hot deals found in ${getShortLocationName()}`
                        : `${offers.length} hot deals available`
                    ) : (
                      currentLocation && currentLocation !== 'All Locations'
                        ? `No hot deals in ${getShortLocationName()}`
                        : 'No hot deals found'
                    )}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs">
                      Location: {currentLocation || 'Loading...'}
                    </span>
                    <button 
                      onClick={() => window.location.reload()}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 mb-4 space-y-4 sm:space-y-0">
            <div className="bg-white p-3 rounded-lg">
              🛒
            </div>
            <div className="text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Over <span className="text-yellow-300">1,51,000</span> Lists Worldwide
              </h2>
              <p className="text-lg sm:text-xl font-bold mb-2">
                Get <span className="text-yellow-300">$95,00,000</span> worth Coupons Savings
              </p>
              <p className="text-blue-100 text-sm sm:text-base">The Coolest Library of Verified Lists</p>
              {currentLocation && currentLocation !== 'All Locations' && (
                <p className="text-blue-100 text-xs mt-2">
                  Now available in {getShortLocationName()}
                </p>
              )}
            </div>
            <div className="bg-white p-3 rounded-lg">
              🎁
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-4 sm:space-y-0">
            <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 w-full sm:w-auto transition-colors">
              Add a Listing
            </button>
            <button className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 w-full sm:w-auto transition-colors">
              Search for a Coupon
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}