import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, MapPin, Tag, X, ChevronDown, Navigation, Check } from 'lucide-react';
import { offerAPI, storeAPI } from '../services/api';
import { useLocation } from '../contexts/LocationContext';

// Debounce utility function (moved outside component)
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

const RealTimeSearch = ({
  placeholder = "Search for Deals & Stores?",
  className = "",
  integratedMode = false,
  onNavigate,
  onStoreClick,
  onOfferClick
}) => {
  // Use location context
  const {
    currentLocation,
    availableLocations,
    changeLocation,
    getShortLocationName,
    getCurrentLocationFromBrowser
  } = useLocation();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({ stores: [], offers: [] });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const locationRef = useRef(null);
  const navigate = useNavigate();

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
        <span className={`${isOffer ? 'text-sm' : 'text-xs'}`}>
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

  // Function to check if offer is expired
  const isOfferExpired = useCallback((expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  }, []);

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

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isLocationOpen && locationRef.current) {
      const rect = locationRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
  }, [isLocationOpen]);

  // Filter locations based on search
  const filteredLocations = locationSearch.trim()
    ? availableLocations.filter(loc =>
      loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      loc.area?.toLowerCase().includes(locationSearch.toLowerCase())
    )
    : availableLocations;

  // Search stores using API with location support
  const searchStores = async (searchQuery) => {
    try {
      const searchParams = {
        search: searchQuery,
        limit: 5
      };

      if (currentLocation && currentLocation !== 'All Locations') {
        searchParams.location = currentLocation;
      }

      const response = await storeAPI.getStores(searchParams);

      return (response.stores || []).map(store => ({
        id: store.id,
        name: store.name,
        category: store.category || 'Store',
        location: store.location,
        logo: store.logo || store.logo_url || null,
        cashback: store.cashback || store.discount || 'Available'
      }));
    } catch (error) {
      console.error('Error searching stores:', error);
      return [];
    }
  };

  // Search offers using API with location support
  const searchOffers = async (searchQuery) => {
    try {
      const searchParams = {
        search: searchQuery,
        limit: 5,
        status: 'active'
      };

      if (currentLocation && currentLocation !== 'All Locations') {
        searchParams.location = currentLocation;
      }

      const response = await offerAPI.getOffers(searchParams);

      const transformedOffers = (response.offers || []).map(offer => ({
        id: offer.id,
        title: offer.title || offer.service?.name || 'Special Offer',
        description: offer.description || offer.service?.description || 'Great deal available',
        discount: offer.discount ? `${offer.discount}% OFF` : 'Special Price',
        store: offer.store?.name || offer.service?.store?.name || 'Store',
        location: offer.store?.location || offer.service?.store?.location || 'Location',
        category: offer.category || offer.service?.category || 'General',
        image: offer.image || offer.service?.image_url || null,
        expiration_date: offer.expiration_date
      }));

      const activeOffers = transformedOffers.filter(offer => !isOfferExpired(offer.expiration_date));

      return activeOffers;
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
    [currentLocation, isOfferExpired]
  );

  // Re-search when location changes
  useEffect(() => {
    if (query.trim() && isOpen) {
      setIsLoading(true);
      debouncedSearch(query);
    }
  }, [currentLocation, debouncedSearch]);

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
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(term => term !== searchQuery)
      ].slice(0, 5);

      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

      const searchParams = new URLSearchParams();
      searchParams.append('q', searchQuery);
      if (currentLocation && currentLocation !== 'All Locations') {
        searchParams.append('location', currentLocation);
      }

      navigate(`/search?${searchParams.toString()}`);
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

    if (activeIndex < recentSearches.length) {
      return { type: 'recent', item: recentSearches[activeIndex] };
    }
    currentIndex += recentSearches.length;

    if (activeIndex < currentIndex + results.stores.length) {
      return { type: 'store', item: results.stores[activeIndex - currentIndex] };
    }
    currentIndex += results.stores.length;

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
        setIsLoading(true);
        debouncedSearch(result.item);
        break;
      case 'store':
        if (onStoreClick) {
          onStoreClick(result.item.id);
        } else {
          navigate(`/Store/${result.item.id}`);
        }
        setIsOpen(false);
        setQuery('');
        break;
      case 'offer':
        if (onOfferClick) {
          onOfferClick(result.item.id);
        } else {
          navigate(`/offer/${result.item.id}`);
        }
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  // Handle location select
  const handleLocationSelect = async (locationItem) => {
    try {
      await changeLocation(locationItem.name);
      setIsLocationOpen(false);
      setLocationSearch('');
    } catch (error) {
      console.error('Error changing location:', error);
    }
  };

  // Handle use current location
  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      await getCurrentLocationFromBrowser();
      setIsLocationOpen(false);
      setLocationSearch('');
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside search results
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }

      // Check if click is outside location dropdown
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        const dropdownElement = document.getElementById('location-dropdown');
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          setIsLocationOpen(false);
          setLocationSearch('');
        } else if (!dropdownElement) {
          setIsLocationOpen(false);
          setLocationSearch('');
        }
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
  const currentLocationDisplay = getShortLocationName();

  // Debug: Log available locations
  useEffect(() => {
    console.log('RealTimeSearch - Available Locations:', availableLocations);
    console.log('RealTimeSearch - Current Location:', currentLocation);
  }, [availableLocations, currentLocation]);

  // Integrated mode for navbar
  if (integratedMode) {
    return (
      <div ref={searchRef} className={`relative ${className}`}>
        {/* Integrated Search Bar */}
        <div className="relative">
          <div className="flex items-center bg-white rounded-full shadow-lg h-12">
            {/* Location Selector */}
            <div ref={locationRef} className="relative flex-shrink-0 border-r border-gray-200 rounded-l-full">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsLocationOpen(!isLocationOpen);
                }}
                className="flex items-center space-x-1.5 px-3 h-12 hover:bg-gray-50 transition-colors cursor-pointer relative z-10 rounded-l-full"
              >
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 max-w-[70px] truncate">
                  {currentLocationDisplay}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isLocationOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Search Input - FIXED: Added fontSize 16px to prevent mobile zoom */}
            <form onSubmit={handleSearch} className="flex-1 min-w-0 flex items-center">
              <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                className="w-full h-12 px-4 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
                style={{ fontSize: '16px' }}
              />
            </form>

            {/* Search Button */}
            <button
              type="submit"
              onClick={handleSearch}
              className="flex items-center justify-center w-14 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 transition-all duration-200 flex-shrink-0 rounded-r-full shadow-md"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Modern Location Dropdown */}
        {isLocationOpen && (
          <div
            id="location-dropdown"
            className="fixed w-96 bg-white border border-gray-200/80 rounded-2xl shadow-2xl z-[9999] overflow-hidden backdrop-blur-xl"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 p-5 border-b border-gray-200/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Choose Location
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">Find amazing deals near you</p>
                </div>
                <button
                  onClick={() => {
                    setIsLocationOpen(false);
                    setLocationSearch('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white/60 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search locations */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            {/* Current Location Button - Prominent */}
            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 border-b border-blue-600">
              <button
                onClick={handleUseCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center justify-between p-4 bg-white/95 hover:bg-white rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl group-hover:scale-110 transition-transform">
                    {isGettingLocation ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Use Current Location</p>
                    <p className="text-xs text-gray-600">Automatically detect your area</p>
                  </div>
                </div>
                <ChevronDown className="-rotate-90 w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>

            {/* Locations List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredLocations.length > 0 ? (
                <>
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {locationSearch ? 'Search Results' : 'Popular Locations'}
                    </p>
                  </div>
                  <div className="px-3 pb-3 space-y-1">
                    {filteredLocations.map((locationItem) => {
                      const isSelected = locationItem.name === currentLocation;
                      return (
                        <button
                          key={locationItem.id}
                          className={`w-full p-3.5 text-left rounded-xl transition-all duration-200 group ${isSelected
                            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-sm'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLocationSelect(locationItem);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Location Icon */}
                              <div className={`p-2 rounded-lg flex-shrink-0 transition-all ${isSelected
                                ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                                : 'bg-gray-100 group-hover:bg-blue-100'
                                }`}>
                                <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`} />
                              </div>

                              {/* Location Info */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                  {locationItem.name}
                                </p>
                                <p className="text-xs text-gray-600 truncate">{locationItem.area}</p>
                              </div>
                            </div>

                            {/* Right Side Info */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {/* Offers Count */}
                              <div className="text-right">
                                <div className={`text-xs font-bold px-2 py-1 rounded-full ${isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                                  }`}>
                                  {locationItem.offers}
                                </div>
                              </div>

                              {/* Selected Indicator */}
                              {isSelected && (
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">No locations found</p>
                  <p className="text-xs text-gray-500">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredLocations.length > 0 && (
              <div className="p-4 bg-gray-50/50 border-t border-gray-200/50">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} available
                  </span>
                  <span className="text-blue-600 font-medium">Live deals updated</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Results Dropdown - Enhanced with live results */}
        {isOpen && (
          <div
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-3xl shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {/* Loading State */}
            {isLoading && query.trim() && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
                    className={`flex items-center justify-between w-full p-2 rounded-2xl hover:bg-gray-50 transition-colors ${activeIndex === index ? 'bg-cyan-50 border border-cyan-200' : ''
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
                          className={`flex items-center space-x-3 w-full p-3 rounded-2xl hover:bg-gray-50 transition-colors ${activeIndex === globalIndex ? 'bg-cyan-50 border border-cyan-200' : ''
                            }`}
                        >
                          <ImageWithFallback
                            src={store.logo}
                            name={store.name}
                            className="w-10 h-10 rounded-2xl object-cover border border-gray-200"
                          />
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{store.name}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{store.category}</span>
                              {store.location && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>{store.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-blue-600 font-medium text-sm">
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
                          className={`flex items-center space-x-3 w-full p-3 rounded-2xl hover:bg-gray-50 transition-colors ${activeIndex === globalIndex ? 'bg-cyan-50 border border-cyan-200' : ''
                            }`}
                        >
                          <ImageWithFallback
                            src={offer.image}
                            name={offer.title}
                            className="w-12 h-12 rounded-2xl object-cover border border-gray-200"
                            isOffer={true}
                          />
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900 truncate">{offer.title}</p>
                            <p className="text-sm text-gray-500 truncate">{offer.description}</p>
                            <div className="flex items-center text-xs text-blue-600">
                              <span>{offer.store}</span>
                              {offer.location && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>{offer.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-blue-600 font-medium text-sm">
                            {offer.discount}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* View All Results */}
                {query.trim() && (
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={handleSearch}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-colors font-medium shadow-md"
                    >
                      View All Results for "{query}"
                    </button>
                  </div>
                )}
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
  }

  // Original mode (non-integrated)
  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Original Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder={`${placeholder}${currentLocation && currentLocation !== 'All Locations' ? ` in ${getShortLocationName()}` : ''}`}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-3xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
          style={{ fontSize: '16px' }}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-colors shadow-md"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Search results dropdown */}
      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-3xl shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          {isLoading && query.trim() && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

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

export default RealTimeSearch;