import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { offerAPI } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import authService from '../services/authService';

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const Heart = ({ className, filled = false }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const PopularListings = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

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

  // Fetch deals with highest discounts from backend
  useEffect(() => {
    const fetchTopDeals = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await offerAPI.getOffers({
          limit: 12,
          sortBy: 'discount',
          sortOrder: 'desc',
          status: 'active'
        });

        if (response.success) {
          const transformedDeals = (response.offers || response.data || []).map(offer => {
            const originalPrice = offer.service?.price || 100;
            const discountAmount = (originalPrice * (offer.discount || 0)) / 100;
            const salePrice = originalPrice - discountAmount;

            return {
              id: offer.id,
              title: offer.title || offer.service?.name || 'Special Offer',
              location: offer.store?.location || offer.service?.store?.location || 'Nairobi',
              image: offer.service?.image_url ||
                (offer.service?.images && offer.service.images[0]) ||
                '/images/placeholder-deal.png',
              discount: `${offer.discount || 0}%`,
              originalPrice: `KES ${originalPrice.toFixed(2)}`,
              salePrice: `KES ${salePrice.toFixed(2)}`,
              timeLeft: offer.expiration_date ?
                calculateTimeLeft(offer.expiration_date) :
                null,
              storeId: offer.store?.id || offer.service?.store?.id,
              serviceId: offer.service?.id,
              offer_type: offer.offer_type,
              status: offer.status,
              expiration_date: offer.expiration_date,
              service: offer.service,
              store_info: offer.store
            };
          });

          const activeDeals = transformedDeals.filter(deal => !isOfferExpired(deal.expiration_date));
          const displayDeals = activeDeals.slice(0, 8);

          setDeals(displayDeals);
        } else {
          setError(response.message || 'Failed to fetch deals');
        }
      } catch (err) {
        setError(err.message || 'Network error occurred while fetching deals');
      } finally {
        setLoading(false);
      }
    };

    fetchTopDeals();
  }, [isOfferExpired]);

  // Calculate time left for offer expiration
  const calculateTimeLeft = (expirationDate) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const timeDiff = expiry - now;

    if (timeDiff <= 0) return 'Expired';

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  // Handle deal click
  const handleDealClick = useCallback((dealId) => {
    navigate(`/offer/${dealId}`);
  }, [navigate]);

  // Handle view all deals
  const handleViewAllDeals = useCallback(() => {
    navigate('/hotdeals');
  }, [navigate]);

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
      description: offer.description || "Get exclusive offers with these amazing deals",
      service: offer.service,
      store: offer.store_info
    };

    await toggleFavorite(offer.id, offerData);
  }, [isAuthenticated, favoritesInitialized, favoritesError, navigate, clearFavoritesError, toggleFavorite]);

  const renderDealCard = (deal) => {
    const isOfferFavorited = favoritesInitialized && isFavorite(deal.id);

    return (
      <div
        key={deal.id}
        className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
        onClick={() => handleDealClick(deal.id)}
      >
        <div className="relative">
          <img
            src={deal.image}
            alt={deal.title}
            className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/images/placeholder-deal.png';
            }}
          />

          {/* Favorite Button */}
          <button
            className={`absolute top-2 right-2 p-1.5 md:p-2 rounded-full transition-all duration-200 shadow-lg ${isOfferFavorited
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-blue-500'
              } ${!isAuthenticated || !favoritesInitialized
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
              }`}
            onClick={(e) => handleFavoriteClick(e, deal)}
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
              className="w-3.5 h-3.5 md:w-4 md:h-4"
              filled={isOfferFavorited}
            />
          </button>

          {/* Discount Badge - Keep red for urgency */}
          <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
            {deal.discount} OFF
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4">
          {/* Title */}
          <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors">
            {deal.title}
          </h3>

          {/* Location */}
          <p className="text-xs text-gray-500 mb-2">{deal.location}</p>

          {/* Time Left (if available) - Keep orange for urgency */}
          {deal.timeLeft && deal.timeLeft !== 'Expired' && (
            <div className="flex items-center space-x-1 text-orange-600 text-xs mb-3">
              <Clock className="w-3 h-3" />
              <span>{deal.timeLeft}</span>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col">
              <span className="font-bold text-blue-600 text-base md:text-lg">{deal.salePrice}</span>
              {deal.originalPrice && (
                <span className="text-gray-400 line-through text-xs">{deal.originalPrice}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">TOP DEALS - HIGHEST DISCOUNTS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 md:h-48 bg-gray-300"></div>
              <div className="p-3 md:p-4 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">TOP DEALS - HIGHEST DISCOUNTS</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
          <p>Error loading deals: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (deals.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">TOP DEALS - HIGHEST DISCOUNTS</h2>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No active deals available at the moment.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            Refresh
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">TOP DEALS</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Highest Discounts Available</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-sm text-gray-500">{deals.length} active deals</span>
        </div>
      </div>

      {/* Favorites Error */}
      {favoritesError && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-xl flex items-center justify-between text-sm">
          <span>{favoritesError}</span>
          <button
            onClick={clearFavoritesError}
            className="ml-4 text-yellow-800 hover:text-yellow-900 text-lg"
          >
            ×
          </button>
        </div>
      )}

      {/* Deals Grid - 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {deals.map((deal) => renderDealCard(deal))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center md:justify-end">
        <button
          onClick={handleViewAllDeals}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
        >
          View All Deals
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default PopularListings;