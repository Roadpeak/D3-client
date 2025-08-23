import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { offerAPI } from '../services/api'; // Import the proper API service

const Star = ({ className }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

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
  const [favorites, setFavorites] = useState(new Set());
  
  const navigate = useNavigate();

  // ADDED: Function to check if offer is expired
  const isOfferExpired = useCallback((expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  }, []);

  // Fetch deals with highest discounts from backend
  useEffect(() => {
    const fetchTopDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch offers sorted by discount (highest first) with limit of 12 to account for potential expired offers
        const response = await offerAPI.getOffers({
          limit: 12, // Fetch more to account for expired ones
          sortBy: 'discount',
          sortOrder: 'desc',
          status: 'active' // Only get active offers
        });
        
        console.log('API Response:', response);
        
        if (response.success) {
          // Transform the API response to match the expected deal structure
          const transformedDeals = (response.offers || response.data || []).map(offer => {
            // Calculate savings and prices
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
              tag: offer.featured ? 'Featured' : 
                   offer.discount >= 50 ? 'Hot Deal' : 
                   offer.discount >= 30 ? 'Bestseller' : 
                   'Limited Time',
              discount: `${offer.discount || 0}%`,
              originalPrice: `KES ${originalPrice.toFixed(2)}`,
              salePrice: `KES ${salePrice.toFixed(2)}`,
              rating: '4.5', // You might want to add this to your API
              reviews: Math.floor(Math.random() * 200) + 10, // Placeholder
              timeLeft: offer.expiration_date ? 
                       calculateTimeLeft(offer.expiration_date) : 
                       null,
              storeId: offer.store?.id || offer.service?.store?.id,
              serviceId: offer.service?.id,
              offer_type: offer.offer_type,
              status: offer.status,
              expiration_date: offer.expiration_date // ADDED: Include expiration date
            };
          });
          
          // ADDED: Filter out expired offers for customer-facing page
          const activeDeals = transformedDeals.filter(deal => !isOfferExpired(deal.expiration_date));
          
          // Take only 8 active deals for display
          const displayDeals = activeDeals.slice(0, 8);
          
          console.log(`📋 Total deals received: ${transformedDeals.length}, Active deals: ${activeDeals.length}, Displaying: ${displayDeals.length}`);
          
          setDeals(displayDeals);
        } else {
          setError(response.message || 'Failed to fetch deals');
        }
      } catch (err) {
        console.error('Error fetching deals:', err);
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

  // Handle deal click - navigate to deal details using the same pattern as hotdeals
  const handleDealClick = useCallback((dealId) => {
    navigate(`/offer/${dealId}`);
  }, [navigate]);

  // Handle view all deals - navigate to hotdeals page
  const handleViewAllDeals = useCallback(() => {
    navigate('/hotdeals');
  }, [navigate]);

  // Toggle favorite
  const toggleFavorite = async (dealId, event) => {
    event.stopPropagation(); // Prevent deal click when clicking heart
    
    try {
      // Here you would typically call the favorites API
      // const result = await favoritesAPI.toggleFavorite(dealId);
      
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(dealId)) {
          newFavorites.delete(dealId);
        } else {
          newFavorites.add(dealId);
        }
        return newFavorites;
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Get deal tag color based on discount percentage
  const getTagColor = (tag, discount) => {
    const discountValue = parseInt(discount?.replace('%', '') || '0');
    
    if (discountValue >= 50) return 'bg-red-500'; // Hot Deal
    if (discountValue >= 30) return 'bg-green-500'; // Bestseller
    if (tag?.toLowerCase() === 'featured') return 'bg-blue-500';
    if (tag?.toLowerCase() === 'premium') return 'bg-purple-500';
    return 'bg-orange-500'; // Limited Time
  };

  const renderDealCard = (deal) => {
    // REMOVED: isExpired check since we already filter expired offers
    
    return (
      <div 
        key={deal.id} 
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        onClick={() => handleDealClick(deal.id)}
      >
        <div className="relative">
          <img 
            src={deal.image} 
            alt={deal.title} 
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = '/images/placeholder-deal.png';
            }}
          />
          {deal.tag && (
            <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white ${getTagColor(deal.tag, deal.discount)}`}>
              {deal.tag}
            </div>
          )}
          <button 
            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
            onClick={(e) => toggleFavorite(deal.id, e)}
          >
            <Heart 
              className={`w-4 h-4 ${favorites.has(deal.id) ? 'text-red-500' : 'text-gray-400'}`}
              filled={favorites.has(deal.id)}
            />
          </button>
          <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-bold text-red-600">
            {deal.discount} OFF
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-2 text-sm line-clamp-2 hover:text-red-600 transition-colors">
            {deal.title}
          </h3>
          <p className="text-xs text-gray-600 mb-2">{deal.location}</p>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{deal.rating}</span>
              <span className="text-xs text-gray-500">({deal.reviews})</span>
            </div>
            {deal.timeLeft && deal.timeLeft !== 'Expired' && (
              <div className="flex items-center space-x-1 text-orange-600 text-xs">
                <Clock className="w-3 h-3" />
                <span>{deal.timeLeft}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-red-600 text-lg">{deal.salePrice}</span>
              {deal.originalPrice && (
                <span className="text-gray-400 line-through text-sm">{deal.originalPrice}</span>
              )}
            </div>
            <button 
              className="px-3 py-1 rounded text-sm font-semibold transition-colors bg-red-500 text-white hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                handleDealClick(deal.id);
              }}
            >
              Get Deal
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">TOP DEALS - HIGHEST DISCOUNTS</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-80 animate-pulse">
              <div className="h-48 bg-gray-300 rounded-t-lg"></div>
              <div className="p-4 space-y-2">
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
        <h2 className="text-2xl font-bold mb-6">TOP DEALS - HIGHEST DISCOUNTS</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading deals: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
        <h2 className="text-2xl font-bold mb-6">TOP DEALS - HIGHEST DISCOUNTS</h2>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No active deals available at the moment.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            Refresh
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">TOP DEALS - HIGHEST DISCOUNTS</h2>
          <p className="text-sm text-gray-600 mt-1">Save big with our best discount offers</p>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">{deals.length} active deals available</span>
          <p className="text-xs text-green-600 font-medium">Sorted by highest discount</p>
        </div>
      </div>

      {/* First row of deals */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {deals.slice(0, 4).map((deal) => renderDealCard(deal))}
      </div>

      {/* Second row of deals (if more than 4 deals) */}
      {deals.length > 4 && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {deals.slice(4, 8).map((deal) => renderDealCard(deal))}
        </div>
      )}

      {/* View All Button */}
      <div className="flex justify-center mt-8">
        <button 
          onClick={handleViewAllDeals}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          View All Active Deals
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default PopularListings;