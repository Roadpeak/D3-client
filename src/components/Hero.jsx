import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { offerAPI } from '../services/offerService';
import ApiService from '../services/storeService';

// Simplified SVG icons using a more consistent style
const ChevronIcon = ({ direction = "left", className = "" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
    />
  </svg>
);

const StarIcon = ({ className = "" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const TimerIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <motion.div
      className="h-10 w-10 rounded-full border-2 border-t-transparent border-blue-500"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// Animation variants - simplified and more subtle
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '3%' : '-3%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? '3%' : '-3%',
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: [0.32, 0.72, 0, 1]
    }
  })
};

export default function Hero() {
  const [topOffers, setTopOffers] = useState([]);
  const [sideOffers, setSideOffers] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform API offer data to match component structure
  const transformOfferData = async (offers) => {
    const transformedOffers = [];

    for (const offer of offers) {
      const originalPrice = offer.service?.price || 199.99;
      const discountedPrice = originalPrice * (1 - offer.discount / 100);
      const store = offer.store || offer.service?.store || {};

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

  useEffect(() => {
    const fetchTopDiscountOffers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await offerAPI.getOffers({
          sortBy: 'discount',
          status: 'active',
          limit: 20
        });

        if (response.success && response.offers) {
          const activeOffers = response.offers.filter(offer => {
            if (!offer.expiration_date) return true;
            return new Date(offer.expiration_date) > new Date();
          });

          const sortedOffers = activeOffers.sort((a, b) => b.discount - a.discount);
          const transformedOffers = await transformOfferData(sortedOffers);

          const heroOffers = transformedOffers.slice(0, 2);
          const sideOffersList = transformedOffers.slice(2, 4);

          setTopOffers(heroOffers);
          setSideOffers(sideOffersList);
        } else {
          throw new Error('No offers data received');
        }
      } catch (err) {
        console.error('Error fetching top discount offers:', err);
        setError('Failed to load top offers');

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

  useEffect(() => {
    if (topOffers.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % topOffers.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [topOffers.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % topOffers.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + topOffers.length) % topOffers.length);
  };

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const handleOfferClick = async (offer) => {
    try {
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
      <section className="w-full max-w-[1280px] mx-auto px-4 py-12">
        <LoadingSpinner />
      </section>
    );
  }

  if (error && topOffers.length === 0) {
    return (
      <section className="w-full max-w-[1280px] mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 bg-white rounded-xl shadow-sm"
        >
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="w-full max-w-[1280px] mx-auto px-4 py-6"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Hero Banner with Carousel */}
        <motion.div
          variants={fadeInUp}
          className="lg:col-span-2 relative bg-white rounded-xl overflow-hidden shadow-sm"
        >
          {topOffers.length > 0 && (
            <>
              {/* Carousel Container */}
              <div className="relative h-[450px] overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    <img
                      src={topOffers[currentSlide].image}
                      alt={topOffers[currentSlide].title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/default-offer.jpg';
                      }}
                    />

                    {/* Modern semi-transparent overlay - less gradient, more flat */}
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-8 py-6">
                      <div className="max-w-md">
                        {/* Store with rating */}
                        <div className="flex items-center gap-2 mb-5 opacity-90">
                          <span className="text-white font-medium">
                            {topOffers[currentSlide].store}
                          </span>
                          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                            <StarIcon className="w-3 h-3 text-yellow-300" />
                            <span className="text-white text-xs">
                              {topOffers[currentSlide].rating?.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                          {topOffers[currentSlide].title}
                        </h2>

                        {/* Simple discount badge */}
                        <div className="inline-flex items-center bg-blue-500 px-4 py-1 rounded-full mb-4">
                          <span className="text-white font-bold">
                            {topOffers[currentSlide].discountPercentage}% OFF
                          </span>
                        </div>

                        {/* Clean pricing display */}
                        <div className="mb-5">
                          <div className="flex items-center gap-3">
                            <span className="text-white/60 line-through text-sm">
                              KSH {topOffers[currentSlide].originalPrice.toFixed(2)}
                            </span>
                            <span className="text-white font-bold text-2xl">
                              KSH {topOffers[currentSlide].discountedPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-green-300 text-sm mt-1">
                            Save KSH {(topOffers[currentSlide].originalPrice - topOffers[currentSlide].discountedPrice).toFixed(2)}
                          </div>
                        </div>

                        {/* Time left - simplified */}
                        <div className="flex items-center gap-1 text-white/80 mb-6">
                          <TimerIcon className="w-4 h-4" />
                          <span className="text-sm">
                            {topOffers[currentSlide].timeLeft}
                          </span>
                        </div>

                        {/* Clean button */}
                        <button
                          onClick={() => handleOfferClick(topOffers[currentSlide])}
                          className="bg-white hover:bg-white/90 text-blue-600 px-6 py-3 rounded-lg text-sm font-medium transition-colors"
                        >
                          Get Deal
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Simplified Navigation */}
              {topOffers.length > 1 && (
                <>
                  {/* Clean, minimal arrow buttons */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors z-10"
                    aria-label="Previous slide"
                  >
                    <ChevronIcon direction="left" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors z-10"
                    aria-label="Next slide"
                  >
                    <ChevronIcon direction="right" className="w-5 h-5" />
                  </button>

                  {/* Subtle dots indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {topOffers.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/60"
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>

        {/* Side Deals - Improved to match layout */}
        <div className="space-y-6 h-[450px] overflow-hidden">
          {sideOffers.slice(0, 2).map((offer) => (
            <motion.div
              key={offer.id}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex-1 cursor-pointer h-[215px]"
              onClick={() => handleOfferClick(offer)}
            >
              <div className="flex h-full">
                {/* Image */}
                <div className="w-1/2 relative">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/default-offer.jpg';
                    }}
                  />

                  {/* Clean discount badge */}
                  <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {offer.discountPercentage}% OFF
                  </div>
                </div>

                {/* Content - Fixed text truncation issues */}
                <div className="w-1/2 p-4 flex flex-col">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 h-10">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-gray-500 mb-2 truncate">{offer.store}</p>

                  {/* Price */}
                  <div className="mt-auto">
                    <div className="flex flex-col mb-1">
                      <span className="text-gray-900 font-semibold">
                        KSH {offer.discountedPrice?.toFixed(2)}
                      </span>
                      <span className="text-gray-400 line-through text-xs">
                        KSH {offer.originalPrice?.toFixed(2)}
                      </span>
                    </div>

                    {/* Time left */}
                    <div className="flex items-center gap-1 text-blue-500 text-xs mb-3">
                      <TimerIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{offer.timeLeft}</span>
                    </div>

                    {/* Button */}
                    <button
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 rounded text-xs font-medium transition-colors"
                    >
                      View Deal
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Placeholder for no side offers */}
          {sideOffers.length === 0 && !loading && (
            <motion.div
              variants={fadeInUp}
              className="bg-gray-50 rounded-xl p-6 text-center flex-1 flex flex-col justify-center h-full"
            >
              <p className="text-gray-500 font-medium">More deals coming soon</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Minimal footer stats */}
      {topOffers.length > 0 && (
        <motion.div
          variants={fadeInUp}
          className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100 text-center"
        >
          <p className="text-blue-800 text-sm">
            Top deals with discounts up to <span className="font-semibold">
              {Math.max(...topOffers.map(o => o.discountPercentage))}%
            </span> off
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}