import React, { useState, useEffect, useRef } from 'react';
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

// Progressive Image Component with blur-up effect
const ProgressiveImage = ({ src, alt, className, placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E" }) => {
  const [imgSrc, setImgSrc] = useState(placeholder);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImgSrc(src);
      setLoading(false);
    };

    img.onerror = () => {
      setImgSrc('/images/default-offer.jpg');
      setLoading(false);
    };
  }, [src]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${loading ? 'blur-sm scale-105' : 'blur-0 scale-100'} transition-all duration-500`}
      />
      {loading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      )}
    </div>
  );
};

// Skeleton loader for Hero with dark mode
const HeroSkeleton = () => (
  <div className="w-full max-w-[1280px] mx-auto px-4 py-6">
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main skeleton */}
      <div className="lg:col-span-2 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm h-[450px] animate-pulse">
        <div className="h-full flex flex-col justify-end p-8">
          <div className="max-w-md space-y-4">
            <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-8 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Side skeletons */}
      <div className="space-y-6 h-[450px]">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl shadow-sm h-[215px] animate-pulse flex">
            <div className="w-1/2 bg-gray-300 dark:bg-gray-600"></div>
            <div className="w-1/2 p-4 space-y-3">
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-3 w-2/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="mt-auto space-y-2">
                <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-8 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Animation variants - simplified and more subtle
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
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

// Cache manager for offers
const offerCache = {
  key: 'hero_offers_cache',
  expiryKey: 'hero_offers_expiry',
  duration: 5 * 60 * 1000, // 5 minutes

  set(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
      localStorage.setItem(this.expiryKey, Date.now() + this.duration);
    } catch (e) {
      console.warn('Cache storage failed:', e);
    }
  },

  get() {
    try {
      const expiry = localStorage.getItem(this.expiryKey);
      if (!expiry || Date.now() > parseInt(expiry)) {
        this.clear();
        return null;
      }
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Cache retrieval failed:', e);
      return null;
    }
  },

  clear() {
    localStorage.removeItem(this.key);
    localStorage.removeItem(this.expiryKey);
  }
};

export default function Hero() {
  const [topOffers, setTopOffers] = useState([]);
  const [sideOffers, setSideOffers] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const mountedRef = useRef(true);

  // Preload images
  const preloadImages = async (offers) => {
    const imageUrls = offers.map(offer => offer.image).filter(Boolean);

    const promises = imageUrls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = resolve; // Still resolve on error to not block
      });
    });

    await Promise.all(promises);
    if (mountedRef.current) {
      setImagesLoaded(true);
    }
  };

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
    mountedRef.current = true;

    const fetchTopDiscountOffers = async () => {
      try {
        // Check cache first
        const cachedData = offerCache.get();
        if (cachedData && mountedRef.current) {
          setTopOffers(cachedData.topOffers);
          setSideOffers(cachedData.sideOffers);
          setLoading(false);
          // Preload images in background
          preloadImages([...cachedData.topOffers, ...cachedData.sideOffers]);
          return;
        }

        setLoading(true);
        setError(null);

        const response = await offerAPI.getOffers({
          sortBy: 'discount',
          status: 'active',
          limit: 20
        });

        if (!mountedRef.current) return;

        if (response.success && response.offers) {
          const activeOffers = response.offers.filter(offer => {
            if (!offer.expiration_date) return true;
            return new Date(offer.expiration_date) > new Date();
          });

          const sortedOffers = activeOffers.sort((a, b) => b.discount - a.discount);
          const transformedOffers = await transformOfferData(sortedOffers);

          if (!mountedRef.current) return;

          const heroOffers = transformedOffers.slice(0, 2);
          const sideOffersList = transformedOffers.slice(2, 4);

          setTopOffers(heroOffers);
          setSideOffers(sideOffersList);

          // Cache the data
          offerCache.set({
            topOffers: heroOffers,
            sideOffers: sideOffersList
          });

          // Preload images
          preloadImages([...heroOffers, ...sideOffersList]);
        } else {
          throw new Error('No offers data received');
        }
      } catch (err) {
        console.error('Error fetching top discount offers:', err);
        if (!mountedRef.current) return;

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
        setImagesLoaded(true);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchTopDiscountOffers();

    return () => {
      mountedRef.current = false;
    };
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

  // Show skeleton loader initially
  if (loading && topOffers.length === 0) {
    return <HeroSkeleton />;
  }

  if (error && topOffers.length === 0) {
    return (
      <section className="w-full max-w-[1280px] mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="text-red-500 dark:text-red-400 text-4xl mb-4">⚠️</div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
          className="lg:col-span-2 relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700"
        >
          {topOffers.length > 0 && (
            <>
              {/* Carousel Container */}
              <div className="relative h-[450px] overflow-hidden bg-gray-100 dark:bg-gray-700">
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
                    <ProgressiveImage
                      src={topOffers[currentSlide].image}
                      alt={topOffers[currentSlide].title}
                      className="w-full h-full object-cover"
                    />

                    {/* Modern semi-transparent overlay */}
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-8 py-6">
                      <div className="max-w-md">
                        {/* Store with rating */}
                        <div className="flex items-center gap-2 mb-5 opacity-90">
                          <span className="text-white font-medium">
                            {topOffers[currentSlide].store}
                          </span>
                          <div className="flex items-center gap-1 bg-white/20 dark:bg-white/30 px-2 py-1 rounded-full backdrop-blur-sm">
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
                        <div className="inline-flex items-center bg-blue-500 dark:bg-blue-600 px-4 py-1 rounded-full mb-4">
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
                          <div className="text-green-300 dark:text-green-400 text-sm mt-1">
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
                          className="bg-white hover:bg-white/90 dark:bg-gray-100 dark:hover:bg-white text-blue-600 dark:text-blue-700 px-6 py-3 rounded-lg text-sm font-medium transition-colors"
                        >
                          Get Deal
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              {topOffers.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 p-2 rounded-full transition-colors z-10 backdrop-blur-sm"
                    aria-label="Previous slide"
                  >
                    <ChevronIcon direction="left" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 p-2 rounded-full transition-colors z-10 backdrop-blur-sm"
                    aria-label="Next slide"
                  >
                    <ChevronIcon direction="right" className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {topOffers.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/60"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>

        {/* Side Deals */}
        <div className="space-y-6 h-[450px] overflow-hidden">
          {sideOffers.slice(0, 2).map((offer) => (
            <motion.div
              key={offer.id}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 flex-1 cursor-pointer h-[215px] transition-colors duration-200"
              onClick={() => handleOfferClick(offer)}
            >
              <div className="flex h-full">
                {/* Image */}
                <div className="w-1/2 relative bg-gray-100 dark:bg-gray-700">
                  <ProgressiveImage
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Clean discount badge */}
                  <div className="absolute top-3 left-3 bg-blue-500 dark:bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {offer.discountPercentage}% OFF
                  </div>
                </div>

                {/* Content */}
                <div className="w-1/2 p-4 flex flex-col">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2 h-10">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{offer.store}</p>

                  {/* Price */}
                  <div className="mt-auto">
                    <div className="flex flex-col mb-1">
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">
                        KSH {offer.discountedPrice?.toFixed(2)}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 line-through text-xs">
                        KSH {offer.originalPrice?.toFixed(2)}
                      </span>
                    </div>

                    {/* Time left */}
                    <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 text-xs mb-3">
                      <TimerIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{offer.timeLeft}</span>
                    </div>

                    {/* Button */}
                    <button
                      className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-1.5 rounded text-xs font-medium transition-colors"
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
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center flex-1 flex flex-col justify-center h-full border border-gray-200 dark:border-gray-700"
            >
              <p className="text-gray-500 dark:text-gray-400 font-medium">More deals coming soon</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer stats */}
      {topOffers.length > 0 && (
        <motion.div
          variants={fadeInUp}
          className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800 text-center transition-colors duration-200"
        >
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Top deals with discounts up to <span className="font-semibold">
              {Math.max(...topOffers.map(o => o.discountPercentage))}%
            </span> off
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}