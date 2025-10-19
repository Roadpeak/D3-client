import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, Grid3X3, List, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from '../contexts/LocationContext';
import ApiService from '../services/storeService';

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
      staggerChildren: 0.05,
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
    scale: 1.03,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const filterVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
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

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const Stores = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const { currentLocation } = useLocation();

  const shortLocationName = useMemo(() => {
    if (!currentLocation || currentLocation === 'All Locations') {
      return 'all locations';
    }
    return currentLocation.split(',')[0];
  }, [currentLocation]);

  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortOptions = ['Popular', 'Highest Discount', 'Lowest Discount', 'A-Z', 'Z-A'];

  // Store Logo Component
  const StoreLogo = ({ store, className }) => {
    const [imageError, setImageError] = useState(false);

    const storeInitials = store.name?.charAt(0)?.toUpperCase() || 'S';

    const hasValidLogo = (store.logo && store.logo.trim() !== '') ||
      (store.logo_url && store.logo_url.trim() !== '');

    if (!hasValidLogo || imageError) {
      return (
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-400 transition-colors duration-300 shadow-sm ${className}`}
        >
          <span className="text-white font-bold text-sm">
            {storeInitials}
          </span>
        </motion.div>
      );
    }

    return (
      <motion.img
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
        src={store.logo || store.logo_url}
        alt={`${store.name} logo`}
        className={className}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  };

  // Store Card Component
  const StoreCard = React.memo(({ store, isListView = false }) => {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        layout
        className={`bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer group ${isListView ? 'p-4' : 'p-4 md:p-6'}`}
        onClick={() => handleStoreClick(store)}
      >
        {isListView ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <StoreLogo
                  store={store}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-colors duration-300 shadow-sm"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-base">{store.name}</h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-1 mt-1"
                >
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600 font-medium">{store.rating || 0}</span>
                </motion.div>
                {store.location && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-gray-500 mt-1"
                  >
                    {store.location}
                  </motion.div>
                )}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-right"
            >
              <div className="text-blue-500 font-bold text-lg">{store.cashback || 'N/A'}</div>
              <div className="text-gray-500 text-sm font-medium">Discount</div>
              {store.wasRate && (
                <div className="text-gray-400 text-sm mt-1">{store.wasRate}</div>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <StoreLogo
                    store={store}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-colors duration-300 shadow-sm"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-sm md:text-base leading-tight truncate">{store.name}</h3>
                  {store.location && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-xs text-gray-500 mt-1 truncate"
                    >
                      {store.location}
                    </motion.div>
                  )}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-right flex-shrink-0 ml-2"
              >
                <div className="text-blue-500 font-bold text-lg md:text-xl">{store.cashback || 'N/A'}</div>
                <div className="text-gray-500 text-xs md:text-sm font-medium">Discount</div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between mt-auto"
            >
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600 font-medium">{store.rating || 0}</span>
              </div>
              {store.wasRate && (
                <div className="text-gray-400 text-xs">{store.wasRate}</div>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  });

  const handleStoreClick = useCallback((store) => {
    navigate(`/Store/${store.id}`);
  }, [navigate]);

  const handleFilterChange = useCallback((filterType, value) => {
    setCurrentPage(1);

    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'sort':
        setSortBy(value);
        setShowSortDropdown(false);
        break;
      default:
        break;
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory('All');
    setSortBy('Popular');
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await ApiService.getCategories();

        let apiCategories = [];

        if (categoriesData.categories && Array.isArray(categoriesData.categories)) {
          apiCategories = categoriesData.categories;
        } else if (Array.isArray(categoriesData)) {
          apiCategories = categoriesData;
        }

        const uniqueCategories = [...new Set(apiCategories.filter(cat =>
          cat && cat !== 'All' && cat.trim() !== ''
        ))];

        const finalCategories = ['All', ...uniqueCategories.sort()];

        setCategories(finalCategories);

      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories(['All', 'Electronics', 'Fashion', 'Food & Dining', 'Beauty', 'Health', 'Home & Garden']);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          sortBy: sortBy,
          page: currentPage,
          limit: 20
        };

        if (currentLocation && currentLocation !== 'All Locations') {
          filters.location = currentLocation;
        }

        const response = await ApiService.getStores(filters);

        setStores(response.stores || []);
        setPagination(response.pagination || null);
        setError(null);
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load stores');
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [currentLocation, selectedCategory, sortBy, currentPage]);

  const handleLocationChange = useCallback((event) => {
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, [handleLocationChange]);

  if (loading && stores.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-64"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-blue-500" />
          </motion.div>
          <span className="ml-2 text-gray-600">Loading stores</span>
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
      className="min-h-screen bg-white"
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Sort and View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700 text-sm hidden sm:inline">Sort by {sortBy}</span>
              <span className="text-gray-700 text-sm sm:hidden">Sort</span>
              <motion.div
                animate={{ rotate: showSortDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showSortDropdown && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md border border-gray-100 z-10 overflow-hidden"
                >
                  {sortOptions.map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: '#f9fafb', x: 5 }}
                      onClick={() => handleFilterChange('sort', option)}
                      className="block w-full text-left px-4 py-2 text-sm first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      Sort by {option}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex space-x-2 mb-8 overflow-x-auto py-1 scrollbar-hide"
        >
          {categories.map((category, index) => (
            <motion.button
              key={`category-${index}-${category}`}
              variants={filterVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterChange('category', category)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 ${selectedCategory === category
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-100 text-gray-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator for filter changes */}
        <AnimatePresence>
          {loading && stores.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5 text-blue-500" />
              </motion.div>
              <span className="ml-2 text-sm text-gray-600">Updating</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stores Grid/List */}
        {!loading && stores.length > 0 && (
          <>
            <AnimatePresence mode="wait">
              {viewMode === 'list' ? (
                <motion.div
                  key="list-view"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {stores.map((store, index) => (
                    <StoreCard key={store.id || index} store={store} isListView={true} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="grid-view"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {stores.map((store, index) => (
                    <StoreCard key={store.id || index} store={store} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center mt-8 space-x-2"
              >
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </motion.button>

                <span className="px-4 py-2 text-sm text-gray-600">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>

                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </motion.button>
              </motion.div>
            )}
          </>
        )}

        {/* No results message */}
        {!loading && stores.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12 bg-gray-50 rounded-lg"
          >
            <motion.div
              className="text-gray-500 mb-4"
            >
              {currentLocation && currentLocation !== 'All Locations'
                ? `No stores found in ${shortLocationName} for the selected filters.`
                : 'No stores found for the selected filters.'
              }
            </motion.div>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={clearFilters}
              className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Clear Filters
            </motion.button>
            {currentLocation && currentLocation !== 'All Locations' && (
              <p className="text-sm text-gray-400 mt-2">
                Try changing location in the navbar to see more stores
              </p>
            )}
          </motion.div>
        )}
      </div>

      <Footer />
    </motion.div>
  );
};

export default Stores;