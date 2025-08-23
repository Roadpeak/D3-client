import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, MapPin, Tag, X } from 'lucide-react';
import { offerAPI, storeAPI } from '../services/api';

const RealTimeSearch = ({ placeholder = "Search for deals, coupons & stores...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({ stores: [], offers: [] });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);

  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Search stores using your API
  const searchStores = async (searchQuery) => {
    try {
      const response = await storeAPI.getStores({
        search: searchQuery,
        limit: 5
      });
      
      // Transform store data to match component expectations
      return (response.stores || []).map(store => ({
        id: store.id,
        name: store.name,
        category: store.category,
        logo: store.logo || store.logo_url || '/images/default-store.png',
        cashback: store.cashback || store.discount || 'Available'
      }));
    } catch (error) {
      console.error('Error searching stores:', error);
      return [];
    }
  };

  // Search offers using your API
  const searchOffers = async (searchQuery) => {
    try {
      const response = await offerAPI.getOffers({
        search: searchQuery,
        limit: 5
      });
      
      // Transform offer data to match component expectations
      return (response.offers || []).map(offer => ({
        id: offer.id,
        title: offer.title || offer.service?.name || 'Special Offer',
        description: offer.description || offer.service?.description || 'Great deal available',
        discount: offer.discount ? `${offer.discount}% OFF` : 'Special Price',
        store: offer.store?.name || offer.store_info?.name || 'Store',
        category: offer.category || offer.service?.category || 'General',
        image: offer.image || offer.service?.image_url || '/images/default-offer.png'
      }));
    } catch (error) {
      console.error('Error searching offers:', error);
      return [];
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults({ stores: [], offers: [] });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [stores, offers] = await Promise.all([
          searchStores(searchQuery),
          searchOffers(searchQuery)
        ]);

        setResults({ 
          stores: stores.slice(0, 5), 
          offers: offers.slice(0, 5) 
        });
      } catch (error) {
        console.error('Search error:', error);
        setResults({ stores: [], offers: [] });
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);
    
    if (value.trim()) {
      setIsOpen(true);
      setIsLoading(true);
      debouncedSearch(value);
    } else {
      setIsOpen(false);
      setResults({ stores: [], offers: [] });
    }
  };

  // Handle search submission
  const handleSearch = (e, searchTerm = null) => {
    e.preventDefault();
    const searchQuery = searchTerm || query.trim();
    
    if (searchQuery) {
      // Save to recent searches
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(term => term !== searchQuery)
      ].slice(0, 5);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const totalResults = results.stores.length + results.offers.length + recentSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < totalResults - 1 ? prev + 1 : -1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > -1 ? prev - 1 : totalResults - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleResultClick(getActiveResult());
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Get active result based on index
  const getActiveResult = () => {
    let currentIndex = 0;
    
    // Check recent searches first
    if (activeIndex < recentSearches.length) {
      return { type: 'recent', item: recentSearches[activeIndex] };
    }
    currentIndex += recentSearches.length;
    
    // Check stores
    if (activeIndex < currentIndex + results.stores.length) {
      return { type: 'store', item: results.stores[activeIndex - currentIndex] };
    }
    currentIndex += results.stores.length;
    
    // Check offers
    if (activeIndex < currentIndex + results.offers.length) {
      return { type: 'offer', item: results.offers[activeIndex - currentIndex] };
    }
    
    return null;
  };

  // Handle result click
  const handleResultClick = (result) => {
    if (!result) return;
    
    switch (result.type) {
      case 'recent':
        setQuery(result.item);
        debouncedSearch(result.item);
        break;
      case 'store':
        navigate(`/Store/${result.item.id}`);
        setIsOpen(false);
        setQuery('');
        break;
      case 'offer':
        navigate(`/offer/${result.item.id}`);
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear recent search
  const clearRecentSearch = (e, searchTerm) => {
    e.stopPropagation();
    const newRecentSearches = recentSearches.filter(term => term !== searchTerm);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  const hasResults = results.stores.length > 0 || results.offers.length > 0;
  const showRecentSearches = !query.trim() && recentSearches.length > 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          {/* Loading State */}
          {isLoading && query.trim() && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-red-500" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {/* Recent Searches */}
          {showRecentSearches && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Searches</h3>
              {recentSearches.map((searchTerm, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick({ type: 'recent', item: searchTerm })}
                  className={`flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    activeIndex === index ? 'bg-red-50 border border-red-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{searchTerm}</span>
                  </div>
                  <button
                    onClick={(e) => clearRecentSearch(e, searchTerm)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {!isLoading && hasResults && (
            <>
              {/* Stores Results */}
              {results.stores.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Stores ({results.stores.length})
                  </h3>
                  {results.stores.map((store, index) => {
                    const globalIndex = recentSearches.length + index;
                    return (
                      <button
                        key={store.id}
                        onClick={() => handleResultClick({ type: 'store', item: store })}
                        className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                          activeIndex === globalIndex ? 'bg-red-50 border border-red-200' : ''
                        }`}
                      >
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/images/default-store.png';
                          }}
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{store.name}</p>
                          <p className="text-sm text-gray-500">{store.category}</p>
                        </div>
                        <div className="text-red-500 font-medium text-sm">
                          {store.cashback}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Offers Results */}
              {results.offers.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    Offers ({results.offers.length})
                  </h3>
                  {results.offers.map((offer, index) => {
                    const globalIndex = recentSearches.length + results.stores.length + index;
                    return (
                      <button
                        key={offer.id}
                        onClick={() => handleResultClick({ type: 'offer', item: offer })}
                        className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                          activeIndex === globalIndex ? 'bg-red-50 border border-red-200' : ''
                        }`}
                      >
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/images/default-offer.png';
                          }}
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 truncate">{offer.title}</p>
                          <p className="text-sm text-gray-500 truncate">{offer.description}</p>
                          <p className="text-xs text-blue-600">{offer.store}</p>
                        </div>
                        <div className="text-red-500 font-medium text-sm">
                          {offer.discount}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* View All Results */}
              {/* <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-pink-600 transition-colors font-medium"
                >
                  View All Results for "{query}"
                </button>
              </div> */}
            </>
          )}

          {/* No Results */}
          {!isLoading && !hasResults && query.trim() && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No results found for "{query}"</p>
              <p className="text-sm text-gray-400">Try searching for stores, deals, or categories</p>
            </div>
          )}

          {/* No Recent Searches */}
          {!isLoading && !hasResults && !query.trim() && recentSearches.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Start typing to search</p>
              <p className="text-sm text-gray-400">Search for stores, deals, or categories</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default RealTimeSearch;