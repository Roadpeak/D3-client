import React, { useState, useEffect, useCallback } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  // Auto-slide configuration
  const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

  // Fetch featured offers on component mount
  useEffect(() => {
    const fetchFeaturedOffers = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching featured offers...');

        // Fetch featured offers
        const data = await offerAPI.getFeaturedOffers(12);

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
            `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop`,
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
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % featuredOffers.length);
  }, [featuredOffers.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => prev === 0 ? featuredOffers.length - 1 : prev - 1);
  }, [featuredOffers.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (!isPaused && featuredOffers.length > 1) {
      const interval = setInterval(goToNext, AUTO_SLIDE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isPaused, featuredOffers.length, goToNext]);

  // Handle offer click - navigate to offer detail page
  const handleOfferClick = (offer) => {
    try {
      navigate(`/offer/${offer.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
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
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
          <div className="h-96 bg-gray-300"></div>
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

  const currentOffer = featuredOffers[currentIndex];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">FEATURED OFFERS</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            aria-label="Previous offer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={goToNext}
            className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors"
            aria-label="Next offer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Offer Display */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="relative bg-white rounded-3xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
          onClick={() => handleOfferClick(currentOffer)}
        >
          {/* Background Image */}
          <div
            className="h-96 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${currentOffer.backgroundImage})`
            }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  {/* Store Logo */}
                  <div className={`${currentOffer.logoColor} w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl mb-4`}>
                    {currentOffer.logoText}
                  </div>

                  {/* Store Name */}
                  <h3 className="text-white text-3xl font-bold mb-2">
                    {currentOffer.storeName}
                  </h3>

                  {/* Offer Name */}
                  <p className="text-white/90 text-lg mb-3">
                    {currentOffer.offerName}
                  </p>

                  {/* Discount Badge */}
                  <div className="inline-block bg-red-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                    {currentOffer.discount}
                  </div>

                  {/* Valid Until */}
                  {currentOffer.validUntil && (
                    <p className="text-white/80 text-sm mt-3">
                      Valid until: {new Date(currentOffer.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* View Details Button */}
                <div className="hidden md:block">
                  <button
                    className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOfferClick(currentOffer);
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        {featuredOffers.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {featuredOffers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${currentIndex === index
                    ? 'w-8 h-3 bg-gray-800'
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                aria-label={`Go to offer ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Auto-play indicator */}
        {!isPaused && featuredOffers.length > 1 && (
          <div className="absolute top-4 right-4">
            <div className="bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Auto-playing</span>
            </div>
          </div>
        )}
      </div>

      {/* Offer Counter */}
      <div className="text-center mt-4 text-gray-600 text-sm">
        {currentIndex + 1} of {featuredOffers.length} Featured Offers
      </div>
    </section>
  );
};

export default FeaturedOffers;