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
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
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
          fetch(`${API_BASE_URL}/offers`),
          fetch(`${API_BASE_URL}/side-offers`)
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
            title: "Get 50% off",
            description: "On your first deal purchase",
            image: "/images/3.jpg",
            discountPercentage: 50,
            originalPrice: 99.99,
            discountedPrice: 49.99,
            timeLeft: "7 days left"
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
            timeLeft: "2 days left"
          },
          {
            id: 5,
            title: "Adventure Activities",
            image: "/images/safr.jpg",
            originalPrice: 89.00,
            discountedPrice: 45.00,
            discountPercentage: 49,
            timeLeft: "Limited spots"
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
    }, 5000); // Change slide every 5 seconds

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
      // Track offer click or handle offer selection
      console.log('Offer clicked:', offerId);
      // You can add analytics tracking or navigation logic here
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
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Hero Banner with Carousel */}
        <div className="lg:col-span-2 relative bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg overflow-hidden h-96">
          {heroOffers.length > 0 && (
            <>
              {/* Carousel Container */}
              <div 
                className="flex transition-transform duration-500 ease-in-out h-full"
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
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <h2 className="text-3xl font-bold mb-2">{offer.title}</h2>
                      <p className="text-lg mb-2">{offer.description}</p>
                      {offer.discountPercentage && (
                        <p className="text-xl font-bold text-yellow-400 mb-2">
                          {offer.discountPercentage}% OFF
                        </p>
                      )}
                      {offer.timeLeft && (
                        <p className="text-sm text-gray-300 mb-4">{offer.timeLeft}</p>
                      )}
                      <button 
                        onClick={() => handleOfferClick(offer.id)}
                        className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                      >
                        Grab Offer
                      </button>
                    </div>
                    {/* Store Badge */}
                    {offer.store && (
                      <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
                        {offer.store}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {heroOffers.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {heroOffers.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {heroOffers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Side Deals */}
        <div className="space-y-4">
          {sideOffers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={offer.image} 
                alt={offer.title} 
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.target.src = '/images/default.jpg';
                }}
              />
              <div className="p-4">
                <h3 className="font-semibold mb-1">{offer.title}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <p className="text-red-600 font-bold text-lg">
                    ${offer.discountedPrice?.toFixed(2)}
                  </p>
                  {offer.originalPrice && (
                    <span className="text-gray-400 line-through text-sm">
                      ${offer.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {offer.discountPercentage}% OFF • {offer.timeLeft}
                </p>
                {offer.store && (
                  <p className="text-xs text-gray-500 mb-2">at {offer.store}</p>
                )}
                <button 
                  onClick={() => handleOfferClick(offer.id)}
                  className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get Deal
                </button>
              </div>
            </div>
          ))}
          
          {sideOffers.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              <p>No side offers available at the moment</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}