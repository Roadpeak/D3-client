import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/storeService';
import VerificationBadge from './VerificationBadge';

// Store Logo Component with fallback to initials
const StoreLogo = ({
  logoUrl,
  storeName,
  className = "w-6 h-6",
  containerClassName = ""
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!logoUrl);

  // Reset error state when logoUrl changes
  useEffect(() => {
    if (logoUrl && logoUrl.startsWith('http') && logoUrl !== '/images/placeholder-store.png') {
      setHasError(false);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [logoUrl]);

  // Get first letters of store name for fallback
  const generateLogo = (name) => {
    if (!name) return 'ST';
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Show fallback if no logoUrl, has error, is placeholder, or doesn't start with http
  const showFallback = !logoUrl || hasError || !logoUrl.startsWith('http') || logoUrl === '/images/placeholder-store.png';

  if (showFallback) {
    return (
      <span className={`text-white font-bold text-xs ${containerClassName}`}>
        {generateLogo(storeName)}
      </span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${storeName} logo`}
      className={`${className} rounded-full object-cover ${containerClassName}`}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading="lazy"
    />
  );
};

// Store Image Component with fallback handling (Dark Mode Support)
const StoreImage = ({
  imageUrl,
  storeName,
  className = "w-full h-48 object-cover"
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state when imageUrl changes
  useEffect(() => {
    if (imageUrl && imageUrl !== '/images/placeholder-store.png') {
      setHasError(false);
    }
  }, [imageUrl]);

  const handleImageError = () => {
    setHasError(true);
  };

  // If no image URL or has error, show placeholder
  if (!imageUrl || hasError || imageUrl === '/images/placeholder-store.png') {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center transition-colors duration-200`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🏪</div>
          <div className="text-sm font-medium">{storeName}</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={storeName}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

const PopularStores = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState({ travel: [], food: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMostReviewedStores = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          sortBy: 'Popular',
          limit: 8
        };

        const response = await ApiService.getStores(filters);

        if (response.success && response.stores) {
          // Sort by review count if available, otherwise by rating
          const sortedStores = response.stores
            .sort((a, b) => {
              const reviewsA = parseInt(a.totalReviews || a.reviews || 0);
              const reviewsB = parseInt(b.totalReviews || b.reviews || 0);
              if (reviewsA !== reviewsB) {
                return reviewsB - reviewsA;
              }
              const ratingA = parseFloat(a.rating || 0);
              const ratingB = parseFloat(b.rating || 0);
              return ratingB - ratingA;
            });

          // Group stores by category
          const groupedStores = {
            travel: sortedStores.filter(store =>
              store.category?.toLowerCase().includes('travel') ||
              store.category?.toLowerCase().includes('adventure') ||
              store.category?.toLowerCase().includes('hotel') ||
              store.category?.toLowerCase().includes('flight')
            ),
            food: sortedStores.filter(store =>
              store.category?.toLowerCase().includes('food') ||
              store.category?.toLowerCase().includes('restaurant') ||
              store.category?.toLowerCase().includes('dining') ||
              store.category?.toLowerCase().includes('delivery')
            ),
            all: sortedStores
          };

          // If no specific categories, split evenly
          if (groupedStores.travel.length === 0 && groupedStores.food.length === 0) {
            const midpoint = Math.ceil(sortedStores.length / 2);
            groupedStores.travel = sortedStores.slice(0, midpoint);
            groupedStores.food = sortedStores.slice(midpoint);
          }

          setStores(groupedStores);
        } else {
          setError(response.message || 'Failed to fetch stores');
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError(`Failed to load stores: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMostReviewedStores();
  }, []);

  const handleStoreClick = (store) => {
    navigate(`/Store/${store.id}`);
  };

  const handleViewAllStores = () => {
    navigate('/stores');
  };

  const getLogoColor = (store) => {
    const colors = [
      'bg-orange-500', 'bg-red-500', 'bg-green-500', 'bg-purple-600',
      'bg-blue-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'
    ];
    const index = (store.id?.toString().length || store.name?.length || 0) % colors.length;
    return colors[index];
  };

  const renderStoreCard = (store, index) => {
    const reviewCount = parseInt(store.totalReviews || store.reviews || 0);
    const rating = parseFloat(store.rating || 0);

    return (
      <div
        key={store.id}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300 cursor-pointer group flex flex-col h-full"
        onClick={() => handleStoreClick(store)}
      >
        <div className="relative">
          <StoreImage
            imageUrl={store.image || store.logo_url}
            storeName={store.name}
            className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Store Logo */}
          <div className="relative">
            <div className={`absolute bottom-2 left-2 ${getLogoColor(store)} rounded-full p-2 shadow-lg overflow-hidden`}>
              <StoreLogo
                logoUrl={store.logo_url || store.logo}
                storeName={store.name}
              />
            </div>
            {(store.is_verified || store.verified) && (
              <div className="absolute bottom-1 left-7">
                <VerificationBadge size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 flex flex-col flex-grow">
          {/* Store Name - Allow 2 lines */}
          <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[2.5rem]">
            {store.name}
          </h3>

          {/* Category - Allow 2 lines */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 min-h-[2rem]">
            {store.category || 'General'}
          </p>

          {/* Rating and Reviews */}
          <div className="flex items-center space-x-1 mb-3">
            <svg className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">({reviewCount})</span>
          </div>

          {/* Visit Store Button - Push to bottom */}
          <button
            className="w-full bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-600 transition-all active:scale-95 mt-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleStoreClick(store);
            }}
          >
            Visit Store
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">TOP STORES</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
          {[...Array(8)].map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden animate-pulse border border-gray-200 dark:border-gray-700">
              <div className="h-40 md:h-48 bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-3 md:p-4 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">TOP STORES</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 dark:hover:from-blue-700 dark:hover:to-cyan-700 transition-all"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const totalStores = stores.all.length;

  if (totalStores === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">TOP STORES</h2>
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No stores found.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 dark:hover:from-blue-700 dark:hover:to-cyan-700 transition-all"
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
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-200">
            TOP STORES
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">Most Popular Stores</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-sm text-gray-500 dark:text-gray-400">{totalStores} stores available</span>
        </div>
      </div>

      {/* Stores Grid - 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {stores.all.slice(0, 8).map((store, index) => renderStoreCard(store, index))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center md:justify-end">
        <button
          onClick={handleViewAllStores}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 hover:from-blue-600 hover:to-cyan-600 dark:hover:from-blue-700 dark:hover:to-cyan-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
        >
          View All Stores
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default PopularStores;