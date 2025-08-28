import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Star, Grid3X3, List, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from '../contexts/LocationContext';
import ApiService from '../services/storeService';

const Stores = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // FIXED: Only get currentLocation, don't use the unstable getShortLocationName function
  const { currentLocation } = useLocation();

  // FIXED: Create short location name directly in component with useMemo
  const shortLocationName = useMemo(() => {
    if (!currentLocation || currentLocation === 'All Locations') {
      return 'all locations';
    }
    return currentLocation.split(',')[0];
  }, [currentLocation]);

  // API state
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortOptions = ['Popular', 'Highest Discount', 'Lowest Discount', 'A-Z', 'Z-A'];

  // FIXED: Simple logo component that prevents onError loops
  const StoreLogo = ({ store, className }) => {
    const [imageError, setImageError] = useState(false);
    
    // Get store initials for fallback
    const storeInitials = store.name?.charAt(0)?.toUpperCase() || 'S';
    
    // Check if store actually has a logo URL in the database
    const hasValidLogo = (store.logo && store.logo.trim() !== '') || 
                        (store.logo_url && store.logo_url.trim() !== '');

    // If no logo in database OR image failed, show initials (no img tag = no onError)
    if (!hasValidLogo || imageError) {
      return (
        <div className={`rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg ${className}`}>
          <span className="text-white font-bold text-sm">
            {storeInitials}
          </span>
        </div>
      );
    }

    // Only render img tag if we confirmed the store has a logo URL
    return (
      <img
        src={store.logo || store.logo_url}
        alt={`${store.name} logo`}
        className={className}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  };

  // FIXED: StoreCard with proper logo handling
  const StoreCard = React.memo(({ store, isListView = false }) => {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group ${isListView ? 'p-4' : 'p-4 md:p-6'}`}
        onClick={() => handleStoreClick(store)}
      >
        {isListView ? (
          // List view layout
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <StoreLogo 
                  store={store}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">{store.name}</h3>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600 font-medium">{store.rating || 0}</span>
                </div>
                {store.location && (
                  <div className="text-xs text-gray-500 mt-1">{store.location}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-red-500 font-bold text-lg">{store.cashback || 'N/A'}</div>
              <div className="text-gray-500 text-sm font-medium">Discount</div>
              {store.wasRate && (
                <div className="text-gray-400 text-sm mt-1">{store.wasRate}</div>
              )}
            </div>
          </div>
        ) : (
          // Grid view layout
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <StoreLogo 
                    store={store}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-tight truncate">{store.name}</h3>
                  {store.location && (
                    <div className="text-xs text-gray-500 mt-1 truncate">{store.location}</div>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-red-500 font-bold text-lg md:text-xl">{store.cashback || 'N/A'}</div>
                <div className="text-gray-500 text-xs md:text-sm font-medium">Discount</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600 font-medium">{store.rating || 0}</span>
              </div>
              {store.wasRate && (
                <div className="text-gray-400 text-xs">{store.wasRate}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  });

  // Memoized handlers to prevent unnecessary re-renders
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

  // Fetch categories - runs only once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await ApiService.getCategories();
        console.log('Raw categories data:', categoriesData);
        
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
        
        console.log('Final categories being set:', finalCategories);
        setCategories(finalCategories);
        
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories(['All', 'Electronics', 'Fashion', 'Food & Dining', 'Beauty', 'Health', 'Home & Garden']);
      }
    };

    fetchCategories();
  }, []);

  // FIXED: Main fetch effect with only stable dependencies
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
          console.log('STORES PAGE - Adding location filter:', currentLocation);
        } else {
          console.log('STORES PAGE - No location filter (showing all)');
        }

        console.log('STORES PAGE - Fetching with filters:', filters);

        const response = await ApiService.getStores(filters);
        
        console.log('STORES PAGE - API Response:', {
          storesCount: response.stores?.length || 0,
          totalItems: response.pagination?.totalItems || 0,
          currentLocation: currentLocation,
          appliedLocationFilter: filters.location || 'None'
        });
        
        setStores(response.stores || []);
        setPagination(response.pagination || null);
        setError(null);
      } catch (err) {
        console.error('STORES PAGE - Error fetching stores:', err);
        setError('Failed to load stores');
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [currentLocation, selectedCategory, sortBy, currentPage]);

  // Handle location change events
  const handleLocationChange = useCallback((event) => {
    console.log('STORES PAGE - Received location change event:', event.detail);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, [handleLocationChange]);

  if (loading && stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <span className="ml-2 text-gray-600">Loading stores...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Stores</h1>
            <p className="text-gray-600 mt-1">
              {currentLocation && currentLocation !== 'All Locations' 
                ? `Showing stores in ${shortLocationName}`
                : 'Showing stores from all locations'
              }
            </p>
            {pagination && pagination.totalItems > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {pagination.totalItems} stores found
              </p>
            )}
          </div>

          {/* Sort and View Controls */}
          <div className="flex items-center space-x-4">
            {/* Mobile View Toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700 hidden sm:inline">Sort by {sortBy}</span>
                <span className="text-gray-700 sm:hidden">Sort</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterChange('sort', option)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      Sort by {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <button
              key={`category-${index}-${category}`}
              onClick={() => handleFilterChange('category', category)}
              className={`px-6 py-3 rounded-full whitespace-nowrap font-medium transition-all duration-300 ${selectedCategory === category
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading indicator for filter changes */}
        {loading && stores.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <span className="ml-2 text-gray-600">Updating results...</span>
          </div>
        )}

        {/* Stores Grid/List */}
        {!loading && stores.length > 0 && (
          <>
            {viewMode === 'list' ? (
              <div className="space-y-4 md:hidden">
                {stores.map((store, index) => (
                  <StoreCard key={store.id || index} store={store} isListView={true} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* No results message */}
        {!loading && stores.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {currentLocation && currentLocation !== 'All Locations' 
                ? `No stores found in ${shortLocationName} for the selected filters.`
                : 'No stores found for the selected filters.'
              }
            </div>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear Filters
            </button>
            {currentLocation && currentLocation !== 'All Locations' && (
              <p className="text-sm text-gray-400 mt-2">
                Try changing location in the navbar to see more stores
              </p>
            )}
          </div>
        )}

        {/* Location Stats */}
        {!loading && (
          <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {stores.length > 0 ? (
                  currentLocation && currentLocation !== 'All Locations' 
                    ? `${stores.length} stores found in ${shortLocationName}`
                    : `${stores.length} stores found`
                ) : (
                  currentLocation && currentLocation !== 'All Locations'
                    ? `No stores in ${shortLocationName}`
                    : 'No stores found'
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
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Stores;