import React, { useState, useEffect } from 'react';

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
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-pink-500 to-purple-500"></div>
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

export default function Hero() {
  const [heroOffers, setHeroOffers] = useState([]);
  const [sideOffers, setSideOffers] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL - adjust according to your backend setup
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1/';

  // Fetch offers from backend
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);

        // Fetch hero offers and side offers in parallel
        const [heroResponse, sideResponse] = await Promise.all([
          fetch(`${API_BASE_URL}offers`),
          fetch(`${API_BASE_URL}side-offers`)
        ]);

        if (!heroResponse.ok || !sideResponse.ok) {
          throw new Error('Failed to fetch offers');
        }

        const heroData = await heroResponse.json();
        const sideData = await sideResponse.json();

        if (heroData.success) {
          setHeroOffers(heroData.data.slice(0, 3)); // Limit to 3 slides
        }

        if (sideData.success) {
          setSideOffers(sideData.data);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError('Failed to load offers');
        // Fallback to default data
        setHeroOffers([
          {
            id: 1,
            title: "PrP Treatment",
            description: "Get 70% off ",
            image: "/images/cl.jpeg",
            discountPercentage: 70,
            originalPrice: 199.99,
            discountedPrice: 59.99,
            timeLeft: "2 days left",
            store: "Amazon",
            rating: 4.8,
            totalDeals: 1250
          },
          {
            id: 2,
            title: "Hair Styling",
            description: "Get 30% OFF",
            image: "/images/sl2.webp",
            discountPercentage: 30,
            originalPrice: 149.99,
            discountedPrice: 59.99,
            timeLeft: "6 hours left",
            store: "H&M",
            rating: 4.6,
            totalDeals: 890
          }
        ]);
        setSideOffers([
          {
            id: 4,
            title: "Spa & Wellness Package",
            image: "/images/spa.png",
            originalPrice: 79.99,
            discountedPrice: 29.99,
            discountPercentage: 62,
            timeLeft: "2 days left",
            store: "SpaWorld",
            isHot: true
          },
          {
            id: 5,
            title: "Adventure Activities",
            image: "/images/safr.jpg",
            originalPrice: 89.00,
            discountedPrice: 45.00,
            discountPercentage: 49,
            timeLeft: "Limited spots",
            store: "AdventureHub",
            isNew: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [API_BASE_URL]);

  // Auto-slide functionality
  useEffect(() => {
    if (heroOffers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroOffers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroOffers.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroOffers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroOffers.length) % heroOffers.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleOfferClick = async (offerId) => {
    try {
      console.log('Offer clicked:', offerId);
    } catch (err) {
      console.error('Error handling offer click:', err);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </section>
    );
  }

  if (error && heroOffers.length === 0) {
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
          {heroOffers.length > 0 && (
            <>
              {/* Carousel Container */}
              <div
                className="flex transition-transform duration-700 ease-in-out h-[520px]"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {heroOffers.map((offer, index) => (
                  <div key={offer.id} className="w-full flex-shrink-0 relative">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/default.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-8 lg:px-12">
                      <div className="max-w-lg">
                        {/* Store Badge */}
                        {offer.store && (
                          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold mb-4">
                            <StarIcon className="w-4 h-4 text-yellow-400" />
                            {offer.store}
                          </div>
                        )}

                        {/* Title */}
                        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                          {offer.title}
                        </h2>

                        {/* Description */}
                        <p className="text-lg text-gray-200 mb-6 leading-relaxed">
                          {offer.description}
                        </p>

                        {/* Discount Badge */}
                        {offer.discountPercentage && (
                          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full text-xl font-black mb-6 shadow-lg">
                            <FireIcon className="w-5 h-5" />
                            {offer.discountPercentage}% OFF
                          </div>
                        )}

                        {/* Price Section */}
                        <div className="flex items-center gap-4 mb-6">
                          <span className="text-2xl font-bold text-white">
                            ${offer.discountedPrice?.toFixed(2)}
                          </span>
                          {offer.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">
                              ${offer.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Time Left */}
                        {offer.timeLeft && (
                          <div className="flex items-center gap-2 text-yellow-400 mb-6">
                            <TimerIcon className="w-4 h-4" />
                            <span className="text-md font-semibold">{offer.timeLeft}</span>
                          </div>
                        )}

                        {/* CTA Button */}
                        <button
                          onClick={() => handleOfferClick(offer.id)}
                          className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl text-md font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:from-pink-600 hover:to-red-600"
                        >
                          Grab This Deal Now!
                        </button>

                        {/* Rating & Deals Count */}
                        {offer.rating && (
                          <div className="flex items-center gap-4 mt-4 text-gray-300">
                            <div className="flex items-center gap-1">
                              <StarIcon className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm">{offer.rating}</span>
                            </div>
                            {offer.totalDeals && (
                              <span className="text-sm">{offer.totalDeals}+ deals claimed</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {heroOffers.length > 1 && (
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
              {heroOffers.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                  {heroOffers.map((_, index) => (
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
        <div className="flex flex-col gap-6 h-[520px]">
          {sideOffers.slice(0, 2).map((offer) => (
            <div key={offer.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 flex-1">
              <div className="relative h-36">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/default.jpg';
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
                  {offer.isNew && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      NEW
                    </span>
                  )}
                </div>

                {/* Discount Badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                  {offer.discountPercentage}% OFF
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h4 className="font-bold text-lg mb-2 text-gray-800">{offer.title}</h4>

                {/* Price */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl font-bold text-black">
                    ${offer.discountedPrice?.toFixed(2)}
                  </span>
                  {offer.originalPrice && (
                    <span className="text-gray-400 line-through text-sm">
                      ${offer.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Store */}
                {offer.store && (
                  <p className="text-sm text-gray-500 mb-3">at {offer.store}</p>
                )}

                {/* Time Left */}
                <div className="flex items-center gap-2 text-orange-600 mb-5">
                  <TimerIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{offer.timeLeft}</span>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleOfferClick(offer.id)}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl text-sm font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200 mt-auto"
                >
                  Get Deal
                </button>
              </div>
            </div>
          ))}

          {sideOffers.length === 0 && !loading && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200 flex-1 flex flex-col justify-center">
              <div className="text-gray-400 text-3xl mb-3">🔍</div>
              <p className="text-gray-600 font-medium text-md">No side offers available</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for more deals!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}