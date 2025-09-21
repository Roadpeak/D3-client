import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { offerAPI } from '../services/offerService';

const ChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

const FeaturedOffers = () => {
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  // Configuration
  const offersPerPage = 4;
  const totalPages = Math.ceil(featuredOffers.length / offersPerPage);

  // Fetch featured offers on component mount
  useEffect(() => {
    const fetchFeaturedOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching featured offers...');
        
        // Fetch featured offers with a reasonable limit
        const data = await offerAPI.getFeaturedOffers(12); // Get more for pagination
        
        // Check if the response has the expected structure
        console.log('API Response:', data);
        
        // Handle different response structures
        const offersArray = data.offers || data || [];
        
        if (!Array.isArray(offersArray)) {
          throw new Error('API response is not in expected format');
        }

        // Transform API data to match component expectations
        const transformedOffers = offersArray.map(offer => ({
          id: offer.id,
          storeName: offer.store?.name || offer.service?.store?.name || 'Unknown Store',
          offerName: offer.title || offer.service?.name || offer.description || 'Special Offer',
          discount: offer.discount ? `${offer.discount}% Off` : 'Special Offer',
          backgroundImage: offer.service?.image_url || 
                          (offer.service?.images && offer.service.images[0]) ||
                          offer.service?.store?.logo_url ||
                          `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop`,
          logoColor: getLogoColor(offer.store?.name || offer.service?.store?.name || offer.service?.category),
          logoText: getLogoText(offer.store?.name || offer.service?.store?.name || 'Store'),
          category: offer.service?.category,
          validUntil: offer.expiration_date,
          store: offer.store || offer.service?.store,
          offerType: offer.offer_type,
          featured: offer.featured
        }));
        
        console.log('Transformed offers:', transformedOffers);
        setFeaturedOffers(transformedOffers);
      } catch (err) {
        console.error('Error fetching featured offers:', err);
        setError(err.message || 'Failed to load featured offers');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedOffers();
  }, []);

  // Helper function to generate logo colors based on store name or category
  const getLogoColor = (name) => {
    const colors = [
      'bg-purple-600', 'bg-blue-500', 'bg-pink-600', 'bg-orange-600',
      'bg-green-500', 'bg-red-500', 'bg-indigo-600', 'bg-yellow-500',
      'bg-teal-500', 'bg-gray-600'
    ];
    
    if (!name) return colors[0];
    
    // Simple hash function to consistently assign colors
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Helper function to generate logo text from store name
  const getLogoText = (storeName) => {
    if (!storeName) return 'S';
    
    const words = storeName.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return storeName.substring(0, 2).toUpperCase();
  };

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentPage(prev => prev > 0 ? prev - 1 : totalPages - 1);
  };

  const handleNext = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  // Get current page offers
  const getCurrentPageOffers = () => {
    const startIndex = currentPage * offersPerPage;
    return featuredOffers.slice(startIndex, startIndex + offersPerPage);
  };

  // Handle offer click - navigate to offer detail page
  const handleOfferClick = (offer) => {
    try {
      // Navigate to the offer detail page using the route pattern from your routes
      navigate(`/offer/${offer.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: try direct window navigation
      window.location.href = `/offer/${offer.id}`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">FEATURED OFFERS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-40 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error && featuredOffers.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">FEATURED OFFERS</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Unable to load featured offers: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // No offers state
  if (!loading && featuredOffers.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">FEATURED OFFERS</h2>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">No featured offers available at the moment.</p>
          <p className="text-gray-500 text-sm mt-2">Check back later for exciting deals!</p>
        </div>
      </section>
    );
  }

  const currentOffers = getCurrentPageOffers();

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">FEATURED OFFERS</h2>
        {featuredOffers.length > offersPerPage && (
          <div className="flex space-x-2">
            <button 
              onClick={handlePrevious}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
              aria-label="Previous offers"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              onClick={handleNext}
              className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors"
              aria-label="Next offers"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentOffers.map((offer) => (
          <div 
            key={offer.id} 
            className="group cursor-pointer transform hover:scale-105 transition-all duration-200"
            onClick={() => handleOfferClick(offer)}
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              {/* Background Image */}
              <div 
                className="h-40 bg-cover bg-center relative"
                style={{
                  backgroundImage: `url(${offer.backgroundImage})`
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-200"></div>
                
                {/* Store Logo */}
                <div className="absolute bottom-3 left-3">
                  <div className={`${offer.logoColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {offer.logoText}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-gray-800 mb-1 text-sm truncate">
                  {offer.storeName}
                </h3>
                <p className="text-gray-600 text-xs mb-1 truncate">
                  {offer.offerName}
                </p>
                <p className="text-red-500 font-bold text-sm">
                  {offer.discount}
                </p>
                {offer.validUntil && (
                  <p className="text-xs text-gray-400 mt-1">
                    Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination indicators */}
      {featuredOffers.length > offersPerPage && (
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentPage === index ? 'bg-gray-800' : 'bg-gray-300'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedOffers;