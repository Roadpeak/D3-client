import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Grid, List, ChevronLeft, ChevronRight, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import { offerAPI } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import authService from '../services/authService';

// Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, y: -20 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
  exit: {
    x: -300,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

const filterItemVariants = {
  hidden: { x: -10, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 150
    }
  }
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: { scale: 0.95 }
};

const heartVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.2,
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 0.4
    }
  },
  tap: { scale: 0.9 },
  favorited: {
    scale: [1, 1.3, 1],
    rotate: [0, -15, 15, 0],
    transition: {
      duration: 0.5
    }
  }
};

// Smart Image Component with auto-crop for portrait images
const SmartImage = ({ src, alt, className, onError }) => {
  const [imageDimensions, setImageDimensions] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!src || src === '/api/placeholder/300/200') {
      setImageError(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      setImageDimensions({
        width: img.width,
        height: img.height,
        aspectRatio,
        isPortrait: aspectRatio < 1,
        isSquare: aspectRatio >= 0.9 && aspectRatio <= 1.1
      });
    };
    img.onerror = () => {
      setImageError(true);
      if (onError) onError();
    };
    img.src = src;
  }, [src, onError]);

  const handleError = (e) => {
    setImageError(true);
    if (onError) {
      onError(e);
    }
  };

  // Determine object-fit based on image dimensions
  const getObjectFit = () => {
    if (!imageDimensions) return 'object-cover';

    if (imageDimensions.isPortrait) {
      // For portrait images, use cover to crop and fill landscape container
      return 'object-cover';
    } else if (imageDimensions.isSquare) {
      // For square images, cover works well
      return 'object-cover';
    } else {
      // For landscape images, cover maintains aspect ratio
      return 'object-cover';
    }
  };

  // Add specific positioning for portrait images
  const getObjectPosition = () => {
    if (!imageDimensions) return 'object-center';

    if (imageDimensions.isPortrait) {
      // Center portrait images to show the most important part
      return 'object-center';
    }
    return 'object-center';
  };

  if (imageError) {
    return (
      <img
        src="/api/placeholder/300/200"
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${getObjectFit()} ${getObjectPosition()}`}
      onError={handleError}
      loading="lazy"
      style={{
        // Ensure consistent aspect ratio container
        aspectRatio: '3/2'
      }}
    />
  );
};

// Store Logo Component with fallback to initials
const StoreLogo = ({
  logoUrl,
  storeName,
  className = "w-5 h-5",
  containerClassName = "w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200"
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
    <motion.div
      className={containerClassName}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {showFallback ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-400 rounded-full">
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
    </motion.div>
  );
};

export default function Hotdeals() {
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      console.error('Error fetching offers:', err);
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
    setSelectedCategory(selectedCategory === category ? '' : category);
    setCurrentPage(1);
  }, [selectedCategory]);

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
      console.warn('No store ID found for offer:', offer.id);
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
    const handleLocationChange = (event) => {
      setCurrentPage(1);
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && offers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-[400px]"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 size={24} />
            </motion.div>
            <span>Loading offers...</span>
            {retryCount > 0 && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-gray-500"
              >
                (Retry {retryCount}/3)
              </motion.span>
            )}
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gray-50"
    >
      <Navbar />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-b border-gray-100"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              <a href='/' className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Home</a>
              <span className="text-gray-900 font-medium text-sm">
                {currentLocation && currentLocation !== 'All Locations'
                  ? `Hot Deals - ${getShortLocationName()}`
                  : 'Hot Deals - All Locations'
                }
              </span>
            </div>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="md:hidden bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              Filters
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Main Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto px-4 py-4"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
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
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleRetry}
                  className="ml-4 flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 text-sm font-medium"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Retry
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites Error */}
      <AnimatePresence>
        {favoritesError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto px-4 py-2"
          >
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">{favoritesError}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearFavoritesError}
                className="ml-4 text-amber-800 hover:text-amber-900"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 relative">
          {/* Sidebar */}
          <AnimatePresence>
            {(isSidebarOpen || true) && (
              <motion.div
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`${isSidebarOpen ? 'block' : 'hidden'
                  } md:block w-full md:w-80 flex-shrink-0 ${isSidebarOpen ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : ''
                  }`}
              >
                {isSidebarOpen && (
                  <div className="md:hidden flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <X size={24} />
                    </motion.button>
                  </div>
                )}

                <div className="p-4 md:p-0 space-y-6">
                  {/* Location Info */}
                  {currentLocation && currentLocation !== 'All Locations' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">CURRENT LOCATION</h3>
                      <p className="text-gray-700 font-medium">{getShortLocationName()}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Showing deals available in your area
                      </p>
                    </motion.div>
                  )}

                  {/* Categories */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 text-sm border-b-2 border-gray-900 pb-2">
                        CATEGORIES
                      </h3>
                    </div>
                    <motion.ul
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-2"
                    >
                      <motion.li
                        variants={filterItemVariants}
                        className="flex items-center justify-between"
                      >
                        <motion.button
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCategoryChange('')}
                          className={`text-sm ${!selectedCategory ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                          All Categories
                        </motion.button>
                        <span className="text-xs text-gray-400">
                          ({offers.length})
                        </span>
                      </motion.li>
                      {categories.length > 0 ? (
                        categories.map((category, index) => (
                          <motion.li
                            key={index}
                            variants={filterItemVariants}
                            className="flex items-center justify-between"
                          >
                            <motion.button
                              whileHover={{ x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleCategoryChange(category.name)}
                              className={`text-sm ${selectedCategory === category.name ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                              {category.name}
                            </motion.button>
                            <span className="text-xs text-gray-400">({category.count})</span>
                          </motion.li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500 italic">
                          {loading ? 'Loading categories...' : 'No categories available'}
                        </li>
                      )}
                    </motion.ul>
                    {(selectedCategory || sortBy !== 'latest') && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearFilters}
                        className="mt-4 text-xs text-gray-600 hover:text-gray-900 underline"
                      >
                        Clear all filters
                      </motion.button>
                    )}
                  </motion.div>

                  {/* Promo Ad */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-900 rounded-lg p-6 text-white text-center"
                  >
                    <h3 className="text-xl font-bold mb-2">Special Deals</h3>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-lg mb-3"
                    >
                      BOOK NOW
                      <div className="text-sm">Get upto 90% Off</div>
                    </motion.div>
                    <p className="text-sm mb-2 text-gray-300">Limited Time Offers</p>
                    <p className="text-lg font-bold">Amazing Savings</p>
                    {currentLocation && currentLocation !== 'All Locations' && (
                      <p className="text-xs mt-2 text-gray-400">
                        Available in {getShortLocationName()}
                      </p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-6 flex-wrap gap-4"
            >
              <div className="flex items-center space-x-4">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  <List size={16} />
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  <Grid size={16} />
                </motion.button>
                {pagination.totalItems > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600 hidden sm:inline"
                  >
                    Showing {Math.min((currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)} - {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
                    {currentLocation && currentLocation !== 'All Locations' && (
                      <span className="ml-1">in {getShortLocationName()}</span>
                    )}
                  </motion.span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 hidden sm:inline">Sort By:</span>
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="discount">Discount</option>
                </motion.select>
              </div>
            </motion.div>

            {/* Loading indicator for pagination */}
            <AnimatePresence>
              {loading && offers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2 size={20} />
                    </motion.div>
                    <span className="text-sm text-gray-600">Loading...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Deals Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-4 sm:gap-6 mb-8 ${viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
                }`}
            >
              <AnimatePresence mode="popLayout">
                {offers.map((offer) => {
                  const isOfferFavorited = favoritesInitialized && isFavorite(offer.id);

                  return (
                    <motion.div
                      key={offer.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover="hover"
                      layout
                      className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                        }`}
                      onClick={() => handleOfferClick(offer)}
                    >
                      <div className={`relative ${viewMode === 'list' ? 'sm:w-1/3' : ''}`}>
                        <SmartImage
                          src={offer.image}
                          alt={offer.title}
                          className={`w-full ${viewMode === 'list' ? 'h-48 sm:h-full' : 'h-48'
                            }`}
                          onError={(e) => {
                            e.target.src = '/api/placeholder/300/200';
                          }}
                        />

                        <motion.button
                          variants={heartVariants}
                          initial="rest"
                          whileHover="hover"
                          whileTap="tap"
                          animate={isOfferFavorited ? "favorited" : "rest"}
                          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 shadow-lg ${isOfferFavorited
                              ? 'bg-red-500 text-white shadow-red-200'
                              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                            } ${!isAuthenticated || !favoritesInitialized
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
                        </motion.button>

                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="absolute bottom-3 left-3"
                        >
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${offer.featured ? 'bg-red-500' : 'bg-blue-500'
                            }`}>
                            {offer.category}
                          </span>
                        </motion.div>
                        {offer.featured && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="absolute top-3 left-3"
                          >
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                              FEATURED
                            </span>
                          </motion.div>
                        )}
                      </div>
                      <div className={`p-4 ${viewMode === 'list' ? 'sm:flex-1' : ''}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <StoreLogo
                            logoUrl={offer.store?.googleLogo}
                            storeName={offer.store?.name || 'Store'}
                          />

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center bg-gradient-to-r from-blue-900 to-blue-400 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-blue-400"
                          >
                            <span>{offer.store?.name || 'Store name'}</span>
                          </motion.div>
                        </div>

                        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{offer.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>

                        {offer.originalPrice > 0 && (
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-lg font-bold text-blue-500">
                              KSH{offer.discountedPrice}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              KSH{offer.originalPrice}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700"
                          >
                            {offer.discount}
                          </motion.span>

                          <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className={`px-8 py-4 rounded text-sm font-medium transition-colors ${offer.featured ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOfferClick(offer);
                            }}
                          >
                            Get Offer
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* No offers message */}
            {!loading && offers.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-12"
              >
                <div className="max-w-md mx-auto">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="text-gray-400 mb-4"
                  >
                    <Grid size={48} className="mx-auto" />
                  </motion.div>
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
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={clearFilters}
                      className="text-red-500 hover:underline mb-2"
                    >
                      Clear all filters
                    </motion.button>
                  )}
                  {currentLocation && currentLocation !== 'All Locations' && (
                    <p className="text-sm text-gray-400">
                      Try selecting "All Locations" from the navbar dropdown for more deals
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
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
                        <motion.button
                          key={page}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded transition-colors ${currentPage === page
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                        >
                          {page}
                        </motion.button>
                      );
                    })}
                    {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                      <>
                        <span className="px-3 py-2 hidden sm:inline">...</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 rounded bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hidden sm:inline-block"
                          onClick={() => handlePageChange(pagination.totalPages)}
                        >
                          {pagination.totalPages}
                        </motion.button>
                      </>
                    )}
                  </div>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                </div>

                {pagination.totalItems > 0 && (
                  <p className="text-center text-sm text-gray-500">
                    Page {currentPage} of {pagination.totalPages} • {pagination.totalItems} total results
                    {currentLocation && currentLocation !== 'All Locations' && (
                      <span className="ml-1">in {getShortLocationName()}</span>
                    )}
                  </p>
                )}
              </motion.div>
            )}

            {/* Location Stats */}
            {!loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-4 bg-white rounded-lg border border-gray-200"
              >
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
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => window.location.reload()}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Refresh
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-400 to-blue-600 py-8 sm:py-12"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 mb-4 space-y-4 sm:space-y-0">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="bg-white p-3 rounded-lg"
            >
              🛒
            </motion.div>
            <div className="text-white">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl sm:text-2xl font-bold mb-2"
              >
                Over <span className="text-yellow-300">50,000</span> Deals Listings
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-lg sm:text-xl font-bold mb-2"
              >
                Save <span className="text-yellow-300">upto</span> 90% of your money
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-blue-100 text-sm sm:text-base"
              >
                Kenya's discount booking hub
              </motion.p>
              {currentLocation && currentLocation !== 'All Locations' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="text-blue-100 text-xs mt-2"
                >
                  Now available in {getShortLocationName()}
                </motion.p>
              )}
            </div>
            <motion.div
              animate={{
                rotate: [0, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="bg-white p-3 rounded-lg"
            >
              🎁
            </motion.div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-4 sm:space-y-0">
            <motion.a
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              href="https://merchants.discoun3ree.com/accounts/sign-up"
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 w-full sm:w-auto transition-colors text-center block"
            >
              Add a Listing
            </motion.a>
            <motion.a
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              href="/search"
              className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 w-full sm:w-auto transition-colors text-center block"
            >
              Search for a Deal
            </motion.a>
          </div>
        </div>
      </motion.div>

      <Footer />
    </motion.div>
  );
}