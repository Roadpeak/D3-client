import React, { useState, useEffect } from 'react';
import { offerAPI } from '../services/offerService';
import ApiService from '../services/storeService';

const ChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
  </div>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const FireIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
  </svg>
);

const TimerIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function Hero() {
  const [topOffers, setTopOffers] = useState([]);
  const [sideOffers, setSideOffers] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform API offer data to match component structure
  const transformOfferData = async (offers) => {
    const transformedOffers = [];

    for (const offer of offers) {
      const originalPrice = offer.service?.price || 199.99;
      const discountedPrice = originalPrice * (1 - offer.discount / 100);
      const store = offer.store || offer.service?.store || {};

      // Calculate time left based on expiration date
      const getTimeLeft = (expirationDate) => {
        if (!expirationDate) return "Limited time";
        const now = new Date();
        const expiry = new Date(expirationDate);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return "Expired";
        if (diffDays === 1) return "1 day left";
        if (diffDays <= 7) return `${diffDays} days left`;
        return "Limited time";
      };

      // Fetch actual store rating from store API
      let storeRating = 0;
      if (store.id) {
        try {
          const storeResponse = await ApiService.getStoreById(store.id);
          if (storeResponse.success && storeResponse.store) {
            storeRating = parseFloat(storeResponse.store.rating) || 0;
          }
        } catch (error) {
          console.error('Error fetching store rating:', error);
        }
      }

      transformedOffers.push({
        id: offer.id,
        title: offer.title || offer.service?.name || "Special Offer",
        description: `Get ${offer.discount}% off ${offer.service?.name || 'this amazing service'}`,
        image: offer.service?.image_url || "/images/default-offer.jpg",
        discountPercentage: offer.discount,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        timeLeft: getTimeLeft(offer.expiration_date),
        store: store.name || "Premium Store",
        rating: storeRating,
        totalDeals: Math.floor(Math.random() * 2000) + 500,
        isHot: offer.discount >= 50,
        category: offer.service?.category || "Special Offers",
        featured: offer.featured || false,
        storeId: store.id,
        serviceId: offer.service?.id
      });
    }

    return transformedOffers;
  };

  // Fetch top discount offers from API
  useEffect(() => {
    const fetchTopDiscountOffers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch offers sorted by discount percentage
        const response = await offerAPI.getOffers({
          sortBy: 'discount',
          status: 'active',
          limit: 20
        });

        if (response.success && response.offers) {
          // Filter out expired offers
          const activeOffers = response.offers.filter(offer => {
            if (!offer.expiration_date) return true;
            return new Date(offer.expiration_date) > new Date();
          });

          // Sort by discount percentage and take top offers
          const sortedOffers = activeOffers.sort((a, b) => b.discount - a.discount);

          // Transform and split offers
          const transformedOffers = await transformOfferData(sortedOffers);

          // Top 2 for main carousel (highest discounts)
          const heroOffers = transformedOffers.slice(0, 2);

          // Next 2 for side offers
          const sideOffersList = transformedOffers.slice(2, 4);

          setTopOffers(heroOffers);
          setSideOffers(sideOffersList);

          console.log('Top discount offers loaded:', {
            total: transformedOffers.length,
            hero: heroOffers.length,
            side: sideOffersList.length,
            topDiscounts: heroOffers.map(o => `${o.title}: ${o.discountPercentage}%`)
          });

        } else {
          throw new Error('No offers data received');
        }

      } catch (err) {
        console.error('Error fetching top discount offers:', err);
        setError('Failed to load top offers');

        // Fallback data for development
        const fallbackOffers = [
          {
            id: 'fallback-1',
            title: "Premium Hair Treatment",
            description: "Get 75% off professional hair styling",
            image: "/images/hair-treatment.jpg",
            discountPercentage: 75,
            originalPrice: 200,
            discountedPrice: 50,
            timeLeft: "2 days left",
            store: "Beauty Plus",
            rating: 4.8,
            totalDeals: 1250,
            isHot: true,
            category: "Beauty & Wellness"
          },
          {
            id: 'fallback-2',
            title: "Spa Relaxation Package",
            description: "Get 60% off luxury spa experience",
            image: "/images/spa-package.jpg",
            discountPercentage: 60,
            originalPrice: 150,
            discountedPrice: 60,
            timeLeft: "3 days left",
            store: "Wellness Spa",
            rating: 4.9,
            totalDeals: 890,
            isHot: true,
            category: "Spa & Wellness"
          }
        ];

        setTopOffers(fallbackOffers.slice(0, 2));
        setSideOffers([fallbackOffers[0]]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDiscountOffers();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (topOffers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % topOffers.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [topOffers.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % topOffers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + topOffers.length) % topOffers.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleOfferClick = async (offer) => {
    try {
      // Use the correct routes based on your routing structure
      if (offer.id) {
        window.location.href = `/offer/${offer.id}`;
      } else {
        console.warn('No valid offer ID found');
      }
    } catch (err) {
      console.error('Error navigating to offer:', err);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </section>
    );
  }

  if (error && topOffers.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Hero Banner with Carousel */}
        <div className="lg:col-span-2 relative bg-white rounded-2xl overflow-hidden shadow-2xl">
          {topOffers.length > 0 && (
            <>
              {/* Carousel Container */}
              <div
                className="flex transition-transform duration-700 ease-in-out h-[480px]"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {topOffers.map((offer, index) => (
                  <div key={offer.id} className="w-full flex-shrink-0 relative">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/default-offer.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-8 py-6">
                      <div className="max-w-lg">
                        {/* Top Section - Business Identity */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-green-600 font-bold text-sm">
                              {offer.store?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-base">{offer.store}</span>
                            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                              <StarIcon className="w-3 h-3 text-yellow-400" />
                              <span className="text-white text-xs font-medium">{offer.rating?.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Section - Deal Details */}
                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
                          {offer.title}
                        </h2>

                        <p className="text-base text-gray-200 mb-4 leading-relaxed">
                          Enjoy {offer.discountPercentage}% OFF this limited-time deal.
                        </p>

                        {/* Discount Badge - Clean Circular Design */}
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2 rounded-full shadow-xl mb-4">
                          <FireIcon className="w-4 h-4 text-white" />
                          <span className="text-white font-black text-lg">{offer.discountPercentage}% OFF</span>
                        </div>

                        {/* Pricing Clarity */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-gray-400 line-through text-base">
                              KSH {offer.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-green-400 font-bold text-2xl">
                              KSH {offer.discountedPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-green-300 font-semibold text-sm">
                            You save KSH {(offer.originalPrice - offer.discountedPrice).toFixed(2)}!
                          </div>
                        </div>

                        {/* Urgency & Availability */}
                        <div className="flex items-center gap-4 text-yellow-300 mb-4">
                          <div className="flex items-center gap-1">
                            <TimerIcon className="w-3 h-3" />
                            <span className="text-xs font-medium">{offer.timeLeft}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">Nairobi, Kenya</span>
                          </div>
                        </div>

                        {/* Trust Signals */}
                        <div className="flex items-center gap-4 text-white/90 text-xs mb-4">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>Verified Deal</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-400" />
                            <span>Instant Booking</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleOfferClick(offer)}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-base font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 mb-3"
                        >
                          Claim Deal Now
                        </button>

                        {/* Short Description */}
                        {/* <div className="text-white/80 text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>Full Body Massage (90 min)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>Free Spa Access</span>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {topOffers.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {topOffers.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                  {topOffers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide
                        ? 'bg-white scale-125'
                        : 'bg-white/50 hover:bg-white/75'
                        }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Side Deals */}
        <div className="flex flex-col gap-6 h-[480px]">
          {sideOffers.slice(0, 2).map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 flex-1 cursor-pointer"
              onClick={() => handleOfferClick(offer)}
            >
              <div className="relative h-36">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/default-offer.jpg';
                  }}
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {offer.isHot && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <FireIcon className="w-3 h-3" />
                      HOT
                    </span>
                  )}
                  {offer.featured && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Discount Badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  {offer.discountPercentage}% OFF
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h4 className="font-bold text-lg mb-2 text-gray-800">{offer.title}</h4>

                {/* Price */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl font-bold text-black">
                    KSH {offer.discountedPrice?.toFixed(2)}
                  </span>
                  <span className="text-gray-400 line-through text-sm">
                    KSH {offer.originalPrice?.toFixed(2)}
                  </span>
                </div>

                {/* Store */}
                <p className="text-sm text-gray-500 mb-3">at {offer.store}</p>

                {/* Time Left */}
                <div className="flex items-center gap-2 text-orange-600 mb-5">
                  <TimerIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{offer.timeLeft}</span>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleOfferClick(offer)}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl text-sm font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200 mt-auto"
                >
                  Get This Deal
                </button>
              </div>
            </div>
          ))}

          {sideOffers.length === 0 && !loading && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200 flex-1 flex flex-col justify-center">
              <div className="text-gray-400 text-3xl mb-3">🔍</div>
              <p className="text-gray-600 font-medium text-md">Loading more deals...</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for more offers!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats */}
      {topOffers.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Hottest Deals of the Week!
            </h3>
            <p className="text-gray-600">
              Featuring discounts up to <span className="font-bold text-red-600">
                {Math.max(...topOffers.map(o => o.discountPercentage))}%
              </span> from top-rated providers
            </p>

          </div>
        </div>
      )}
    </section>
  );
}