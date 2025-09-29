import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Tag, Star, Clock, ChevronDown, Grid, List, X, ArrowLeft } from 'lucide-react';
import { offerAPI, storeAPI } from '../services/api'; // Your existing API imports
import RealTimeSearch from './RealTimeSearch'; // Your existing search component
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get query parameters from URL
  const query = searchParams.get('q') || '';
  const locationParam = searchParams.get('location') || 'All Locations';
  
  // State management
  const [results, setResults] = useState({ stores: [], offers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'stores', 'offers'
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    location: locationParam
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  // Helper function to render initials fallback
  const renderInitials = (name, className, isOffer = false) => {
    const initials = getInitials(name);
    return (
      <div className={`${className} bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold`}>
        <span className={`${isOffer ? 'text-lg' : 'text-sm'}`}>
          {initials}
        </span>
      </div>
    );
  };

  // Image component with fallback to initials
  const ImageWithFallback = ({ src, name, className, isOffer = false }) => {
    const [imageError, setImageError] = useState(false);
    
    if (imageError || !src) {
      return renderInitials(name, className, isOffer);
    }

    return (
      <img
        src={src}
        alt={name}
        className={className}
        onError={() => setImageError(true)}
      />
    );
  };
  
  // Helper function to check if offer is expired
  const isOfferExpired = useCallback((expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  }, []);

  // Load search results when component mounts or parameters change
  useEffect(() => {
    if (query.trim()) {
      loadSearchResults();
    } else {
      setResults({ stores: [], offers: [] });
      setIsLoading(false);
    }
  }, [query, locationParam, sortBy]);
  
  const loadSearchResults = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Loading search results for: "${query}" in location: ${locationParam}`);
      
      const searchParams = {
        search: query,
        location: locationParam !== 'All Locations' ? locationParam : undefined,
        sortBy: sortBy,
        limit: 50 // Load more results for the dedicated page
      };
      
      // Use your existing APIs
      const [storesResponse, offersResponse] = await Promise.all([
        storeAPI.getStores(searchParams),
        offerAPI.getOffers(searchParams)
      ]);
      
      // Transform and filter offers to exclude expired ones (similar to hotdeals page)
      const transformedOffers = (offersResponse.offers || []).map(offer => ({
        id: offer.id,
        title: offer.title || offer.service?.name || 'Special Offer',
        description: offer.description || offer.service?.description || 'Great deal available',
        discount: offer.discount ? `${offer.discount}% OFF` : 'Special Price',
        store: { 
          name: offer.store?.name || offer.service?.store?.name || 'Store',
          location: offer.store?.location || offer.service?.store?.location || 'Location'
        },
        location: offer.store?.location || offer.service?.store?.location || 'Location',
        category: offer.category || offer.service?.category || 'General',
        image: offer.image || offer.service?.image_url || '/images/default-offer.png',
        isHot: offer.featured || false,
        expiration_date: offer.expiration_date,
        service: offer.service,
        store_info: offer.store
      }));

      // Filter out expired offers for customer-facing search results
      const activeOffers = transformedOffers.filter(offer => !isOfferExpired(offer.expiration_date));
      
      setResults({
        stores: storesResponse.stores || [],
        offers: activeOffers
      });
      
      console.log(`Found ${storesResponse.stores?.length || 0} stores and ${offersResponse.offers?.length || 0} offers`);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to load search results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle navigation from search component
  const handleSearchNavigate = (path) => {
    navigate(path);
  };
  
  const handleStoreClick = (storeId) => {
    navigate(`/Store/${storeId}`);
  };
  
  const handleOfferClick = (offerId) => {
    navigate(`/offer/${offerId}`);
  };
  
  // Filter and sort results
  const getFilteredResults = () => {
    let stores = [...results.stores];
    let offers = [...results.offers];
    
    // Apply category filter
    if (filters.category) {
      stores = stores.filter(store => store.category === filters.category);
      offers = offers.filter(offer => offer.category === filters.category);
    }
    
    // Apply sorting
    const sortFunctions = {
      relevance: (a, b) => 0, // Keep original order
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
      discount: (a, b) => {
        const getDiscountValue = (item) => {
          if (item.discount || item.cashback) {
            const text = item.discount || item.cashback;
            const match = text.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
          }
          return 0;
        };
        return getDiscountValue(b) - getDiscountValue(a);
      },
      newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    };
    
    if (sortFunctions[sortBy]) {
      stores.sort(sortFunctions[sortBy]);
      offers.sort(sortFunctions[sortBy]);
    }
    
    return { stores, offers };
  };
  
  const filteredResults = getFilteredResults();
  const totalResults = filteredResults.stores.length + filteredResults.offers.length;
  
  // Get unique categories for filter
  const categories = [...new Set([
    ...results.stores.map(store => store.category),
    ...results.offers.map(offer => offer.category)
  ])].filter(Boolean);
  
  // Render store card
  const renderStoreCard = (store, index) => (
    <div
      key={store.id}
      className={`group cursor-pointer transition-all duration-300 ${
        viewMode === 'grid'
          ? 'bg-white rounded-2xl shadow-lg hover:shadow-xl border border-slate-200/50'
          : 'bg-white rounded-xl shadow-md hover:shadow-lg border border-slate-200/50 flex items-center'
      }`}
      onClick={() => handleStoreClick(store.id)}
    >
      {viewMode === 'grid' ? (
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <ImageWithFallback
              src={store.logo || store.logo_url}
              name={store.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200"
            />
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {store.cashback || store.discount || 'Available'}
            </div>
          </div>
          
          <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
            {store.name}
          </h3>
          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{store.description || `${store.category} store`}</p>
          
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium">{store.rating || '4.0'}</span>
              <span className="text-slate-500">({store.reviews || '0'})</span>
            </div>
            <div className="flex items-center text-slate-500">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-xs">{store.location}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
              {store.category}
            </span>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View Store →
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-4 p-4 w-full">
          <ImageWithFallback
            src={store.logo || store.logo_url}
            name={store.name}
            className="w-20 h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">
                {store.name}
              </h3>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium ml-4">
                {store.cashback || store.discount || 'Available'}
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-2 line-clamp-1">{store.description || `${store.category} store`}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium text-sm">{store.rating || '4.0'}</span>
                  <span className="text-slate-500 text-sm">({store.reviews || '0'})</span>
                </div>
                <div className="flex items-center text-slate-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{store.location}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {store.category}
                </span>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  View Store →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Render offer card
  const renderOfferCard = (offer, index) => (
    <div
      key={offer.id}
      className={`group cursor-pointer transition-all duration-300 ${
        viewMode === 'grid'
          ? 'bg-white rounded-2xl shadow-lg hover:shadow-xl border border-slate-200/50 overflow-hidden'
          : 'bg-white rounded-xl shadow-md hover:shadow-lg border border-slate-200/50 flex overflow-hidden'
      }`}
      onClick={() => handleOfferClick(offer.id)}
    >
      {viewMode === 'grid' ? (
        <>
          <div className="relative">
            <ImageWithFallback
              src={offer.image || offer.service?.image_url}
              name={offer.title || offer.service?.name}
              className="w-full h-48 object-cover"
              isOffer={true}
            />
            <div className="absolute top-3 left-3">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
                {offer.discount ? `${offer.discount}% OFF` : 'Special Price'}
              </div>
            </div>
            {offer.isHot && (
              <div className="absolute top-3 right-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                  🔥 HOT
                </div>
              </div>
            )}
          </div>
          
          <div className="p-5">
            <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {offer.title || offer.service?.name || 'Special Offer'}
            </h3>
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {offer.description || offer.service?.description || 'Great deal available'}
            </p>
            
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center text-slate-600">
                <span className="font-medium">{offer.store?.name || offer.service?.store?.name || 'Store'}</span>
              </div>
              <div className="flex items-center text-slate-500">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{offer.store?.location || offer.service?.store?.location || 'Location'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {offer.category || offer.service?.category || 'General'}
              </span>
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View Offer →
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-32 h-32 flex-shrink-0 relative">
            <ImageWithFallback
              src={offer.image || offer.service?.image_url}
              name={offer.title || offer.service?.name}
              className="w-full h-full object-cover"
              isOffer={true}
            />
            <div className="absolute top-2 left-2">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                {offer.discount ? `${offer.discount}% OFF` : 'Special'}
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors flex-1">
                {offer.title || offer.service?.name || 'Special Offer'}
              </h3>
              {offer.isHot && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold ml-2">
                  🔥 HOT
                </div>
              )}
            </div>
            
            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
              {offer.description || offer.service?.description || 'Great deal available'}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-700">
                  {offer.store?.name || offer.service?.store?.name || 'Store'}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {offer.category || offer.service?.category || 'General'}
                </span>
              </div>
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View Offer →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
  
  // Get results to display based on active tab
  const getDisplayResults = () => {
    switch (activeTab) {
      case 'stores':
        return { stores: filteredResults.stores, offers: [] };
      case 'offers':
        return { stores: [], offers: filteredResults.offers };
      default:
        return filteredResults;
    }
  };
  
  const displayResults = getDisplayResults();
  
  if (!query.trim()) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <Search className="w-24 h-24 text-slate-300 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-slate-700 mb-2">D3 Search</h1>
              <p className="text-slate-500 mb-6">Find Discounted services and stores!</p>
              
              <div className="max-w-2xl mx-auto">
                <RealTimeSearch
                  placeholder="Search for deals, coupons & stores..."
                  onNavigate={handleSearchNavigate}
                  onStoreClick={handleStoreClick}
                  onOfferClick={handleOfferClick}
                  currentLocation={locationParam}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
        <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="text-sm text-slate-500">
              {locationParam !== 'All Locations' && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Searching in {locationParam}
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mb-4">
            <RealTimeSearch
              placeholder={`Search for deals, coupons & stores...${locationParam !== 'All Locations' ? ` in ${locationParam}` : ''}`}
              onNavigate={handleSearchNavigate}
              onStoreClick={handleStoreClick}
              onOfferClick={handleOfferClick}
              currentLocation={locationParam}
              className="w-full"
            />
          </div>
          
          {/* Search Results Info */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Search Results for "{query}"
              </h1>
              <p className="text-slate-600">
                {isLoading ? 'Searching...' : `${totalResults} results found`}
                {locationParam !== 'All Locations' && ` in ${locationParam}`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tabs and Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              All ({totalResults})
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'stores'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Stores ({filteredResults.stores.length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'offers'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Offers ({filteredResults.offers.length})
            </button>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="rating">Sort by Rating</option>
                <option value="discount">Sort by Discount</option>
                <option value="newest">Sort by Newest</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm hover:border-slate-400 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters Panel */}
        {isFilterOpen && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Any Price</option>
                  <option value="under-1000">Under KSh 1,000</option>
                  <option value="1000-5000">KSh 1,000 - 5,000</option>
                  <option value="5000-10000">KSh 5,000 - 10,000</option>
                  <option value="over-10000">Over KSh 10,000</option>
                </select>
              </div>
              
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setFilters({ category: '', priceRange: '', location: locationParam })}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Searching for the best deals...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={loadSearchResults}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* No Results */}
        {!isLoading && !error && totalResults === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No results found</h3>
            <p className="text-slate-500 mb-6">
              We couldn't find any results for "{query}"
              {locationParam !== 'All Locations' && ` in ${locationParam}`}
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Checking your spelling</li>
                <li>Using more general terms</li>
                <li>Searching in a different location</li>
                <li>Browsing our categories</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Results Display */}
        {!isLoading && !error && totalResults > 0 && (
          <div className="space-y-8">
            {/* Stores Section */}
            {displayResults.stores.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                  Stores ({displayResults.stores.length})
                </h2>
                <div className={`${
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }`}>
                  {displayResults.stores.map((store, index) => renderStoreCard(store, index))}
                </div>
              </div>
            )}
            
            {/* Offers Section */}
            {displayResults.offers.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-red-600" />
                  Offers ({displayResults.offers.length})
                </h2>
                <div className={`${
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }`}>
                  {displayResults.offers.map((offer, index) => renderOfferCard(offer, index))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchResultsPage;