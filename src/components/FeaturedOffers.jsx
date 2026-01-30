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

        // Fetch featured offers
        const data = await offerAPI.getFeaturedOffers(12);

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

        setFeaturedOffers(transformedOffers);
      } catch (err) {
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">FEATURED OFFERS</h2>
        </div>
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg animate-pulse border border-gray-200 dark:border-gray-700">
          <div className="h-96 bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && featuredOffers.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">FEATURED OFFERS</h2>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">Unable to load featured offers: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">FEATURED OFFERS</h2>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">No featured offers available at the moment.</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Check back later for exciting deals!</p>
        </div>
      </section>
    );
  }

  const currentOffer = featuredOffers[currentIndex];

  return (
    <section className="container mx-auto px-4 py-8 sm:py-12">
      {/* Header with auto-play indicator */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
            Hot Deals
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Limited time offers • Auto-rotating
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-200 dark:border-red-800">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-red-600 dark:text-red-400">LIVE</span>
        </div>
      </div>

      {/* Main Offer Display */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
          onClick={() => handleOfferClick(currentOffer)}
        >
          {/* Background Image */}
          <div
            className="h-96 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${currentOffer.backgroundImage})`
            }}
          >
            {/* Gradient Overlay - Enhanced for dark mode */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent dark:from-black/80 dark:via-black/40"></div>

            {/* Discount Badge - TOP LEFT */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-5 py-2.5 rounded-full text-lg font-bold shadow-2xl animate-pulse z-10">
              {currentOffer.discount}
            </div>

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

                  {/* Valid Until */}
                  {currentOffer.validUntil && (
                    <p className="text-white/80 text-sm mt-2">
                      Valid until: {new Date(currentOffer.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* View Details Button */}
                <div className="hidden md:block">
                  <button
                    className="bg-white dark:bg-gray-100 text-gray-800 dark:text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-white transition-colors shadow-lg"
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
                    ? 'w-8 h-3 bg-gray-800 dark:bg-gray-300'
                    : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                aria-label={`Go to offer ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Auto-play indicator */}
        {!isPaused && featuredOffers.length > 1 && (
          <div className="absolute top-4 right-4">
            <div className="bg-black/50 dark:bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-2 backdrop-blur-sm">
              <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
              <span>Auto-playing</span>
            </div>
          </div>
        )}
      </div>

      {/* Offer Counter */}
      <div className="text-center mt-4 text-gray-600 dark:text-gray-400 text-sm transition-colors duration-200">
        {currentIndex + 1} of {featuredOffers.length} Featured Offers
      </div>
    </section>
  );
};

export default FeaturedOffers;