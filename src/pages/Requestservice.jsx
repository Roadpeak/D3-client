import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import io from 'socket.io-client';
import userServiceRequestService from '../services/userServiceRequestService';
import authService from '../services/authService';
import storeService from '../services/storeService';
import { getTokenFromCookie } from '../config/api';

// SVG Icons
const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Store = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const Star = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const Navigation = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const Phone = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const DollarSign = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const defaultCenter = {
  lat: -1.286389,
  lng: 36.817223
};

export default function UserServiceRequestPage() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const mapRef = useRef(null);

  // User authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Map state
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [directions, setDirections] = useState(null);

  // View mode state
  const [viewMode, setViewMode] = useState(() => {
    // ✅ Auto-redirect to map view if there's an active request
    const savedRequest = localStorage.getItem('activeServiceRequest');
    if (savedRequest) {
      try {
        const parsed = JSON.parse(savedRequest);
        const requestTime = new Date(parsed.createdAt).getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - requestTime) / (1000 * 60 * 60);
        if (hoursDiff < 24) {
          return 'map'; // Start in map view if there's an active request
        }
      } catch (e) {
        console.error('Failed to check saved request:', e);
      }
    }
    return 'landing';
  });

  // Request state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [serviceCategories, setServiceCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Form selection state
  const [selectedLocation, setSelectedLocation] = useState('');
  const [availableLocations, setAvailableLocations] = useState([]);
  const [urgency, setUrgency] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Active request and offers
  const [activeRequest, setActiveRequest] = useState(() => {
    // ✅ Load from localStorage on mount
    const savedRequest = localStorage.getItem('activeServiceRequest');
    if (savedRequest) {
      try {
        const parsed = JSON.parse(savedRequest);
        // Check if request is still recent (within 24 hours)
        const requestTime = new Date(parsed.createdAt).getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - requestTime) / (1000 * 60 * 60);
        if (hoursDiff < 24) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to load saved request:', e);
      }
    }
    return null;
  });
  const [liveOffers, setLiveOffers] = useState([]);
  const [storeOffers, setStoreOffers] = useState({}); // Maps storeId to offer
  const [acceptedOffer, setAcceptedOffer] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);

  // ✅ Save activeRequest to localStorage whenever it changes
  useEffect(() => {
    if (activeRequest) {
      localStorage.setItem('activeServiceRequest', JSON.stringify(activeRequest));
      console.log('💾 Active request saved to localStorage');
    } else {
      localStorage.removeItem('activeServiceRequest');
      console.log('🗑️ Active request cleared from localStorage');
    }
  }, [activeRequest]);

  // ✅ NEW: Play beep sound for incoming offers
  const playOfferSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Pleasant beep frequency
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      console.log('🔊 Offer notification sound played');
    } catch (error) {
      console.error('❌ Failed to play offer sound:', error);
    }
  };

  // Get user's location and reverse geocode
  const handleGetUserLocation = async () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const userPos = { lat, lng };

          setUserLocation(userPos);
          setMapCenter(userPos);

          // Reverse geocode to get location name
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();

            if (data.results && data.results[0]) {
              // Extract city/area name
              const addressComponents = data.results[0].address_components;
              const locality = addressComponents.find(comp =>
                comp.types.includes('locality') || comp.types.includes('sublocality')
              );
              const area = addressComponents.find(comp =>
                comp.types.includes('administrative_area_level_2')
              );

              const locationName = locality?.long_name || area?.long_name || 'Current Location';
              setSelectedLocation(locationName);
            } else {
              setSelectedLocation('Current Location');
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            setSelectedLocation('Current Location');
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check your browser permissions.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle store selection and show directions
  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setMapCenter({ lat: store.lat, lng: store.lng });

    if (userLocation && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: { lat: store.lat, lng: store.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
          } else {
            console.error('Directions request failed:', status);
          }
        }
      );
    }
  };

  // Handle search with form selections
  const handleSearchStores = async () => {
    // ✅ BLOCK: Prevent new requests if there's an active one
    if (activeRequest && activeRequest.status === 'open') {
      alert('You already have an active service request. Please complete or cancel it before creating a new one.');
      setViewMode('map'); // Redirect to existing request
      return;
    }

    if (!selectedCategory) {
      alert('Please select a service category');
      return;
    }

    const filters = { category: selectedCategory };
    if (selectedLocation && selectedLocation !== 'current') {
      filters.location = selectedLocation;
    }

    await fetchStoresByFilters(filters);
    setViewMode('map');

    if (isAuthenticated) {
      handlePostRequest();
    }
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && user.success) {
          setIsAuthenticated(true);
          setCurrentUser(user.data);
        }
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    checkAuth();
  }, []);

  // Fetch service categories and locations
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await userServiceRequestService.getServiceCategories();
        setServiceCategories(response.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await storeService.getLocations();
        if (response.success && response.locations) {
          setAvailableLocations(response.locations);
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    };

    fetchCategories();
    fetchLocations();
  }, []);

  // Fetch stores from database based on filters
  const fetchStoresByFilters = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await storeService.getStores(filters);

      if (response.success && response.stores) {
        const transformedStores = response.stores.map(store => ({
          id: store.id,
          name: store.name || store.storeName,
          lat: store.latitude || parseFloat(store.location?.split(',')[0]) || defaultCenter.lat,
          lng: store.longitude || parseFloat(store.location?.split(',')[1]) || defaultCenter.lng,
          rating: store.rating || store.averageRating || 0,
          category: store.category,
          totalReviews: store.totalReviews || 0,
          address: store.address || store.location
        }));

        setNearbyStores(transformedStores);

        if (transformedStores.length > 0 && transformedStores[0].lat && transformedStores[0].lng) {
          setMapCenter({ lat: transformedStores[0].lat, lng: transformedStores[0].lng });
        }
      } else {
        setNearbyStores([]);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      setNearbyStores([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch existing offers for active request
  const fetchOffersForRequest = async (requestId) => {
    try {
      const response = await userServiceRequestService.getRequestOffers(requestId);
      if (response.success && response.data.offers) {
        const offers = response.data.offers;
        console.log('📥 Fetched existing offers:', offers);

        setLiveOffers(offers);

        // Map offers to stores
        const offerMap = {};
        offers.forEach(offer => {
          // Use storeId to map offers to stores
          if (offer.storeId) {
            offerMap[offer.storeId] = {
              ...offer,
              price: offer.quotedPrice,
              message: offer.message,
              availability: offer.availability
            };
          }
        });

        setStoreOffers(offerMap);
        console.log('✅ Offers mapped to stores:', offerMap);
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    }
  };

  // ✅ Load existing offers when activeRequest is set or restored
  useEffect(() => {
    if (activeRequest && activeRequest.id) {
      console.log('🔍 Loading offers for active request:', activeRequest.id);
      fetchOffersForRequest(activeRequest.id);

      // ✅ Restore view mode and load stores when request is restored from localStorage
      if (viewMode === 'landing' && activeRequest.category) {
        console.log('📍 Restoring request state: loading stores for category', activeRequest.category);
        setSelectedCategory(activeRequest.category);
        setSelectedLocation(activeRequest.location || '');

        // Load stores for the request category
        fetchStoresByFilters({ category: activeRequest.category });
        setViewMode('map');
      }
    }
  }, [activeRequest?.id]);

  // Socket.IO connection for realtime offers
  useEffect(() => {
    if (isAuthenticated && currentUser && activeRequest) {
      const wsUrl = process.env.REACT_APP_WS_URL || 'https://api.discoun3ree.com';
      const token = getTokenFromCookie();

      socketRef.current = io(wsUrl, {
        auth: { token, userId: currentUser.id, userType: 'customer' },
        transports: ['websocket', 'polling']
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected, joining request room:', activeRequest.id);
        // Join the correct room format: request:${requestId}
        socketRef.current.emit('join', `request:${activeRequest.id}`);
      });

      socketRef.current.on('offer:new', (offer) => {
        console.log('🔔 New offer received via Socket:', offer);

        // ✅ PLAY BEEP SOUND FOR NEW OFFER
        playOfferSound();

        setLiveOffers(prev => {
          if (prev.find(o => o.id === offer.id)) return prev;
          return [...prev, { ...offer, isNew: true }];
        });

        // ✅ FIXED: Map offer to store using storeId
        if (offer.storeId) {
          setStoreOffers(prev => ({
            ...prev,
            [offer.storeId]: {
              ...offer,
              price: offer.quotedPrice,
              message: offer.message,
              availability: offer.availability,
              isNew: true
            }
          }));
          console.log('✅ Offer mapped to store:', offer.storeId, 'Price:', offer.quotedPrice);
        } else {
          console.error('❌ Offer missing storeId:', offer);
        }
      });

      socketRef.current.on('offer:accepted', (data) => {
        console.log('Offer accepted:', data);
        if (data.acceptedOfferId) {
          const acceptedOffer = liveOffers.find(o => o.id === data.acceptedOfferId);
          if (acceptedOffer) {
            setAcceptedOffer(acceptedOffer);
          }
        }
      });

      return () => {
        if (socketRef.current) {
          console.log('Leaving request room:', activeRequest.id);
          socketRef.current.emit('leave', `request:${activeRequest.id}`);
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, currentUser, activeRequest]);

  const handlePostRequest = async () => {
    if (!isAuthenticated) {
      alert('Please login to post a service request');
      navigate('/login');
      return;
    }

    if (!selectedCategory) {
      alert('Please select a service category');
      return;
    }

    try {
      setLoading(true);
      const description = `${selectedCategory} service ${urgency === 'later' && scheduledDate ? `scheduled for ${new Date(scheduledDate).toLocaleString()}` : 'needed now'}`;

      const requestData = {
        title: `${selectedCategory} Service Request`,
        category: selectedCategory,
        description: description,
        urgency: urgency === 'now' ? 'IMMEDIATE' : 'SCHEDULED',
        scheduledDate: urgency === 'later' ? scheduledDate : null,
        timeline: urgency === 'now' ? 'IMMEDIATE' : 'SCHEDULED',
        budgetMin: priceRange.min ? parseFloat(priceRange.min) : 0,
        budgetMax: priceRange.max ? parseFloat(priceRange.max) : 0,
        location: selectedLocation === 'current' && userLocation
          ? `${userLocation.lat}, ${userLocation.lng}`
          : selectedLocation || 'Nairobi',
        userId: currentUser.id
      };

      const response = await userServiceRequestService.createServiceRequest(requestData);

      if (response.success) {
        setActiveRequest(response.data);
        setLiveOffers([]);
      }
    } catch (error) {
      console.error('Failed to create request:', error);
      alert(error.message || 'Failed to create service request');
    } finally {
      setLoading(false);
    }
  };

  // Accept an offer
  const handleAcceptOffer = async (store, offer) => {
    if (!activeRequest || !offer) {
      alert('No active request or offer found');
      return;
    }

    try {
      setLoading(true);
      const token = getTokenFromCookie();

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/request-service/${activeRequest.id}/accept-offer/${offer.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log('Offer accepted successfully');

        // Fetch full store details including phone number
        const storeResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/v1/stores/${store.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const storeData = await storeResponse.json();

        setAcceptedOffer({
          ...offer,
          storeDetails: storeData.success ? storeData.store : store
        });
      } else {
        alert(data.message || 'Failed to accept offer');
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Calculate container height for mobile bottom nav
  const isMobile = window.innerWidth < 768;
  const bottomNavHeight = isMobile ? 60 : 0;
  const containerHeight = `calc(100vh - 64px - ${bottomNavHeight}px)`;

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-gray-900" style={{ height: containerHeight }}>
      {/* Landing Page View - Flight Booking Style */}
      {viewMode === 'landing' && (
        <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="w-full max-w-md mx-auto">
              {/* White Card Form */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 mb-6">

                {/* Category Selection */}
                <div className="mb-5 relative">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Service Category</label>
                  <div className="relative">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3.5 border border-gray-200 dark:border-gray-600">
                      <Search className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Select service..."
                        className="flex-1 bg-transparent focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                        onFocus={() => setShowCategoryDropdown(true)}
                      />
                      {selectedCategory && (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">✓</span>
                      )}
                    </div>

                    {showCategoryDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-20">
                          {serviceCategories
                            .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                            .map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  setSelectedCategory(cat.name);
                                  setCategorySearch(cat.name);
                                  setShowCategoryDropdown(false);
                                }}
                                className={`w-full px-5 py-3.5 text-left text-sm transition-all first:rounded-t-2xl last:rounded-b-2xl ${
                                  selectedCategory === cat.name
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                {cat.name}
                              </button>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Location Selection with Swap */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Service Location</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleGetUserLocation}
                      className={`flex-1 flex items-center gap-2 px-4 py-3.5 rounded-xl border transition-all ${
                        selectedLocation === 'current'
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <MapPin className={`w-4 h-4 ${selectedLocation && selectedLocation !== '' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${selectedLocation && selectedLocation !== '' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                        {selectedLocation || 'Current Location'}
                      </span>
                    </button>
                  </div>
                  <select
                    value={selectedLocation === 'current' ? '' : selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full mt-3 px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm appearance-none focus:outline-none focus:border-blue-500 dark:focus:border-blue-600"
                  >
                    <option value="">Or select a location...</option>
                    {availableLocations.map((loc, idx) => (
                      <option key={idx} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Timeline Selection */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">When do you need it?</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setUrgency('now')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border transition-all ${
                        urgency === 'now'
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <Clock className={`w-4 h-4 ${urgency === 'now' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${urgency === 'now' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                        Now
                      </span>
                    </button>
                    <button
                      onClick={() => setUrgency('later')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border transition-all ${
                        urgency === 'later'
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <Clock className={`w-4 h-4 ${urgency === 'later' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${urgency === 'later' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                        Schedule
                      </span>
                    </button>
                  </div>
                  {urgency === 'later' && (
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full mt-3 px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-600"
                    />
                  )}
                </div>

                {/* Budget Range */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Budget Range (KSH)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-600"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearchStores}
                  disabled={!selectedCategory || loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-base rounded-xl disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Searching...' : "Find Service"}
                </button>

                {/* ✅ NEW: View My Requests Button */}
                {isAuthenticated && (
                  <button
                    onClick={() => navigate('/my-requests')}
                    className="w-full mt-3 py-3 bg-white dark:bg-gray-700 border-2 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    View My Requests & Offers
                  </button>
                )}
              </div>

              {/* Special Promotion Section - Optional */}
              {!selectedCategory && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Quick Tip</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select a service category to get started with your request. We'll match you with the best professionals in your area!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map View - Modern Layout */}
      {viewMode === 'map' && (
        <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* Map Container - Top 60% */}
          <div className="relative" style={{ height: '60%' }}>
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={14}
                onLoad={onMapLoad}
                options={{
                  fullscreenControl: false,
                  streetViewControl: false,
                  mapTypeControl: false,
                  zoomControl: true,
                  styles: [
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    }
                  ]
                }}
              >
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      polylineOptions: {
                        strokeColor: '#3B82F6',
                        strokeWeight: 5,
                      },
                    }}
                  />
                )}

                {!directions && userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      path: window.google?.maps?.SymbolPath?.CIRCLE,
                      fillColor: '#3B82F6',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 3,
                      scale: 10,
                    }}
                  />
                )}

                {!directions && nearbyStores.map((store) => (
                  <Marker
                    key={store.id}
                    position={{ lat: store.lat, lng: store.lng }}
                    onClick={() => handleStoreSelect(store)}
                    icon={{
                      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="20" cy="20" r="18" fill="${selectedStore?.id === store.id ? '#3B82F6' : '#9CA3AF'}" stroke="white" stroke-width="3"/>
                          <path d="M20 10L25 18H15L20 10Z M14 20H26V28H14V20Z" fill="white"/>
                        </svg>
                      `),
                      scaledSize: { width: 40, height: 40 },
                    }}
                  />
                ))}
              </GoogleMap>
            </LoadScript>

            {/* Back Button */}
            <button
              onClick={() => {
                setViewMode('landing');
                setDirections(null);
                setSelectedStore(null);
              }}
              className="absolute top-4 left-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 z-10"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* ✅ ENHANCED: Stores List - Scrollable over map with better height */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl -mt-6 z-20" style={{ height: '50%', minHeight: '300px', maxHeight: '70%' }}>
            {/* Drag Handle */}
            <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
              <div className="w-16 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full shadow-sm"></div>
            </div>

            <div className="px-5 pb-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {nearbyStores.length} Provider{nearbyStores.length !== 1 ? 's' : ''} Found
                </h3>
                <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{selectedCategory}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedLocation || 'All locations'}</p>
                {nearbyStores.length > 3 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 animate-bounce">⬇ Scroll for more</p>
                )}
              </div>
            </div>

            {/* ✅ ENHANCED: More prominent scrollable area with scroll indicator */}
            <div className="flex-1 overflow-y-auto px-6 py-2 scroll-smooth" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#3B82F6 #E5E7EB'
            }}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                </div>
              ) : nearbyStores.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No providers found</p>
                </div>
              ) : (
                <div className="space-y-3 pb-6">
                  {nearbyStores.map((store) => {
                    const storeOffer = storeOffers[store.id];
                    const isAccepted = acceptedOffer?.merchant?.id === store.id;

                    return (
                      <div
                        key={store.id}
                        className={`w-full p-4 rounded-3xl transition-all shadow-sm ${
                          selectedStore?.id === store.id
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-500 dark:border-blue-600 shadow-lg'
                            : 'bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600'
                        }`}
                      >
                        <button
                          onClick={() => handleStoreSelect(store)}
                          className="w-full flex items-start gap-4"
                        >
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                            selectedStore?.id === store.id
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700'
                          }`}>
                            <Store className={`w-8 h-8 ${
                              selectedStore?.id === store.id
                                ? 'text-white'
                                : 'text-gray-600 dark:text-gray-300'
                            }`} />
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <h4 className="font-bold text-base text-gray-900 dark:text-white mb-1.5 truncate">{store.name}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-gray-900 dark:text-white">{store.rating || 'N/A'}</span>
                              </div>
                              {store.totalReviews > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">({store.totalReviews} reviews)</span>
                              )}
                            </div>
                            {store.address && (
                              <div className="flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{store.address}</p>
                              </div>
                            )}
                          </div>

                          {selectedStore?.id === store.id && (
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center shadow-lg">
                                <Navigation className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Selected</span>
                            </div>
                          )}
                        </button>

                        {/* Offer Section */}
                        {activeRequest && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            {isAccepted ? (
                              /* Accepted Offer - Show Contact Info */
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span className="text-sm font-bold text-green-600 dark:text-green-400">Offer Accepted</span>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                      KSH {acceptedOffer.price}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{acceptedOffer.message}</p>
                                </div>

                                {/* Provider Contact Info */}
                                {acceptedOffer.storeDetails && acceptedOffer.storeDetails.phone_number && (
                                  <a
                                    href={`tel:${acceptedOffer.storeDetails.phone_number}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
                                  >
                                    <Phone className="w-5 h-5" />
                                    Call Now: {acceptedOffer.storeDetails.phone_number}
                                  </a>
                                )}

                                <button
                                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                                  onClick={() => alert('Booking feature coming soon!')}
                                >
                                  <Calendar className="w-5 h-5" />
                                  Book Service
                                </button>
                              </div>
                            ) : storeOffer ? (
                              /* Offer Received - Show Offer */
                              <div className="space-y-3">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        KSH {storeOffer.price}
                                      </span>
                                    </div>
                                    {storeOffer.isNew && (
                                      <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                                        New!
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{storeOffer.message}</p>
                                  {storeOffer.availability && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                      Available: {storeOffer.availability}
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleAcceptOffer(store, storeOffer)}
                                  disabled={loading}
                                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-all"
                                >
                                  {loading ? 'Accepting...' : 'Accept Offer'}
                                </button>
                              </div>
                            ) : (
                              /* Waiting for Offer */
                              <div className="flex items-center justify-center py-4">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Waiting for offer...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
