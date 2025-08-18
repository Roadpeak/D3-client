import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Star, Grid3X3, List, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ApiService from '../services/storeService';

const Stores = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // API state
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [locations, setLocations] = useState(['All Locations']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortOptions = ['Popular', 'Highest Discount', 'Lowest Discount', 'A-Z', 'Z-A'];

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [categoriesData, locationsData] = await Promise.all([
          ApiService.getCategories(),
          ApiService.getLocations()
        ]);

        setCategories(categoriesData.categories || ['All']);
        setLocations(locationsData.locations || ['All Locations']);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load filter options');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch stores when filters change
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const filters = {
          category: selectedCategory,
          location: selectedLocation,
          sortBy: sortBy,
          page: currentPage,
          limit: 20
        };

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
  }, [selectedCategory, selectedLocation, sortBy, currentPage]);

  const handleStoreClick = (store) => {
    navigate(`/Store/${store.id}`)
  };

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1); // Reset to first page when filter changes

    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'location':
        setSelectedLocation(value);
        setShowLocationDropdown(false);
        break;
      case 'sort':
        setSortBy(value);
        setShowSortDropdown(false);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedLocation('All Locations');
    setSortBy('Popular');
    setCurrentPage(1);
  };

  const StoreCard = ({ store, isListView = false }) => (
    <div
      className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group ${isListView ? 'p-4' : 'p-4 md:p-6'
        }`}
      onClick={() => handleStoreClick(store)}
    >
      {isListView ? (
        // List view layout
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={store.logo || store.logo_url || '/images/default-store.png'}
                alt={`${store.name} logo`}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg"
                onError={(e) => {
                  e.target.src = '/images/default-store.png';
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{store.name}</h3>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600 font-medium">{store.rating || 0}</span>
              </div>
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
                <img
                  src={store.logo || store.logo_url || '/images/default-store.png'}
                  alt={`${store.name} logo`}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg"
                  onError={(e) => {
                    e.target.src = '/images/default-store.png';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-tight truncate">{store.name}</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">All stores</h1>

          {/* Sort and Location Filters */}
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

            {/* Location Filter */}
            <div className="relative">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 hidden sm:inline">{selectedLocation}</span>
                <span className="text-gray-700 sm:hidden">Location</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showLocationDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleFilterChange('location', location)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
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
          {categories.map((category) => (
            <button
              key={category}
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
            <div className="text-gray-500 text-lg">No stores found for the selected filters.</div>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Stores;