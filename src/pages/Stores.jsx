import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Star, Grid3X3, List, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import ApiService from '../services/storeService';
import VerificationBadge from '../components/VerificationBadge';

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

  // Store Logo Component with Dark Mode and Verification Badge
  const StoreLogo = ({ store, className, showBadge = true }) => {
    const [imageError, setImageError] = useState(false);

    const storeInitials = store.name?.charAt(0)?.toUpperCase() || 'S';

    const hasValidLogo = (store.logo && store.logo.trim() !== '') ||
      (store.logo_url && store.logo_url.trim() !== '');

    const isVerified = store.is_verified || store.verified;

    if (!hasValidLogo || imageError) {
      return (
        <div className="relative">
          <div
            className={`rounded-full bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-all duration-300 shadow-sm hover:scale-110 hover:rotate-6 ${className}`}
          >
            <span className="text-white font-bold text-sm">
              {storeInitials}
            </span>
          </div>
          {isVerified && showBadge && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <VerificationBadge size="sm" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        <img
          src={store.logo || store.logo_url}
          alt={`${store.name} logo`}
          className={`${className} transition-all duration-300 hover:scale-110 hover:rotate-6`}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {isVerified && showBadge && (
          <div className="absolute -bottom-0.5 -right-0.5">
            <VerificationBadge size="sm" />
          </div>
        )}
      </div>
    );
  };

  // Store Card Component with Dark Mode
  const StoreCard = React.memo(({ store, isListView = false }) => {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300 cursor-pointer group hover:-translate-y-2 hover:scale-105 ${isListView ? 'p-4' : 'p-4 md:p-6'}`}
        onClick={() => handleStoreClick(store)}
      >
        {isListView ? (
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <StoreLogo
                  store={store}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors duration-300 shadow-sm"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-base transition-colors duration-200">
                  {store.name}
                </h3>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{store.rating || 0}</span>
                </div>
                {store.location && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {store.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <StoreLogo
                    store={store}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors duration-300 shadow-sm"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base leading-tight truncate transition-colors duration-200">
                    {store.name}
                  </h3>
                  {store.location && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {store.location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{store.rating || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
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

  // Skeleton Components
  const StoreCardSkeleton = ({ isListView = false }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 animate-pulse ${isListView ? 'p-4' : 'p-4 md:p-6'}`}>
      {isListView ? (
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      )}
    </div>
  );

  const PageSkeleton = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls Skeleton */}
        <div className="flex items-center justify-between mb-6 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
          <div className="w-28 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        {/* Category Tabs Skeleton */}
        <div className="flex space-x-2 mb-8 overflow-x-auto py-1 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && stores.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Sort and View Controls */}
        <div className="flex items-center justify-between mb-6">
          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${viewMode === 'grid'
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${viewMode === 'list'
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span className="text-gray-700 dark:text-gray-300 text-sm hidden sm:inline">Sort by {sortBy}</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm sm:hidden">Sort</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 z-10 overflow-hidden animate-fadeIn">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange('sort', option)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 first:rounded-t-lg last:rounded-b-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1"
                  >
                    Sort by {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto py-1 scrollbar-hide">
          {categories.map((category, index) => (
            <button
              key={`category-${index}-${category}`}
              onClick={() => handleFilterChange('category', category)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 ${selectedCategory === category
                  ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-gray-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 animate-fadeIn">
            {error}
          </div>
        )}

        {/* Loading indicator for filter changes */}
        {loading && stores.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin">
              <Loader2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Updating</span>
          </div>
        )}

        {/* Stores Grid/List */}
        {!loading && stores.length > 0 && (
          <>
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {stores.map((store, index) => (
                  <StoreCard key={store.id || index} store={store} isListView={true} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stores.map((store, index) => (
                  <StoreCard key={store.id || index} store={store} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* No results message */}
        {!loading && stores.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              {currentLocation && currentLocation !== 'All Locations'
                ? `No stores found in ${shortLocationName} for the selected filters.`
                : 'No stores found for the selected filters.'
              }
            </div>
            <button
              onClick={clearFilters}
              className="px-5 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95"
            >
              Clear Filters
            </button>
            {currentLocation && currentLocation !== 'All Locations' && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Try changing location in the navbar to see more stores
              </p>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Stores;