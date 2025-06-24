import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const Heart = ({ className, filled = false }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const PopularStores = () => {
  const [stores, setStores] = useState({ travel: [], food: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // Fetch stores from backend
  useEffect(() => {
    const fetchPopularStores = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/stores?limit=8');
        const data = await response.json();
        
        if (data.success) {
          // Use the grouped stores from backend or all stores if not grouped
          const storeData = data.data.stores || { travel: [], food: [] };
          
          // If backend returns allStores but not grouped, we'll group them manually
          if (data.data.allStores && (!storeData.travel?.length && !storeData.food?.length)) {
            const groupedStores = {
              travel: data.data.allStores.filter(store => store.category?.toLowerCase().includes('travel') || store.categoryId === 2),
              food: data.data.allStores.filter(store => store.category?.toLowerCase().includes('food') || store.categoryId === 1)
            };
            setStores(groupedStores);
          } else {
            setStores(storeData);
          }
        } else {
          setError(data.message || 'Failed to fetch stores');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
        console.error('Error fetching stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularStores();
  }, []);

  // Handle store click - navigate to store details
  const handleStoreClick = (storeId) => {
    // For React Router users: navigate(`/stores/${storeId}`);
    // For regular navigation:
    window.location.href = `/stores/${storeId}`;
  };

  // Handle view all stores
  const handleViewAllStores = () => {
    // For React Router users: navigate('/stores');
    // For regular navigation:
    window.location.href = '/stores';
  };

  // Toggle favorite
  const toggleFavorite = (storeId, event) => {
    event.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(storeId)) {
        newFavorites.delete(storeId);
      } else {
        newFavorites.add(storeId);
      }
      return newFavorites;
    });
  };

  // Get tag color based on tag type
  const getTagColor = (tag) => {
    switch (tag?.toLowerCase()) {
      case 'hot deal':
        return 'bg-red-500';
      case 'cashback':
        return 'bg-orange-500';
      case 'bestseller':
        return 'bg-green-500';
      case 'premium':
        return 'bg-purple-500';
      case 'healthy':
        return 'bg-green-600';
      case 'popular':
        return 'bg-blue-500';
      case 'trending':
        return 'bg-pink-500';
      case 'featured':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Generate logo from store name
  const generateLogo = (name) => {
    if (!name) return 'ST';
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  // Get logo color based on store name or category
  const getLogoColor = (store) => {
    if (store.logoColor) return store.logoColor;
    
    const colors = [
      'bg-orange-500', 'bg-red-500', 'bg-green-500', 'bg-purple-600',
      'bg-blue-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'
    ];
    
    // Use store ID or name to consistently assign color
    const index = (store.id || store.name?.length || 0) % colors.length;
    return colors[index];
  };

  const renderStoreCard = (store) => (
    <div 
      key={store.id} 
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => handleStoreClick(store.id)}
    >
      <div className="relative">
        <img 
          src={store.image || '/images/placeholder-store.png'} 
          alt={store.name} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/images/placeholder-store.png';
          }}
        />
        {store.tag && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white ${getTagColor(store.tag)}`}>
            {store.tag}
          </div>
        )}
        <button 
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          onClick={(e) => toggleFavorite(store.id, e)}
        >
          <Heart 
            className={`w-4 h-4 ${favorites.has(store.id) ? 'text-red-500' : 'text-gray-400'}`}
            filled={favorites.has(store.id)}
          />
        </button>
        <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-bold text-red-600">
          {store.discount} OFF
        </div>
        <div className={`absolute bottom-3 left-3 ${getLogoColor(store)} rounded-full p-2 shadow-lg`}>
          <span className="text-white font-bold text-xs">
            {store.logo || generateLogo(store.name)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1 text-sm hover:text-red-600 transition-colors">
          {store.name}
        </h3>
        <p className="text-xs text-gray-600 mb-2">{store.category}</p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{store.rating || 'N/A'}</span>
            <span className="text-xs text-gray-500">({store.reviews || 0})</span>
          </div>
          <div className="text-red-500 text-xs font-semibold">
            {store.offer}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-green-600 font-bold text-sm">
            {store.activeDealsCount ? `${store.activeDealsCount} Active Deals` : 'Active Deals Available'}
          </div>
          <button 
            className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleStoreClick(store.id);
            }}
          >
            Visit Store
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">TOP RATED STORES</h2>
        
        {/* Travel Stores Skeleton */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Travel & Adventure</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={`travel-skeleton-${index}`} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Food Stores Skeleton */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Food & Restaurants</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={`food-skeleton-${index}`} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">TOP RATED STORES</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading stores: {error}</p>
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

  // Calculate total stores
  const totalStores = stores.travel.length + stores.food.length;

  // Empty state
  if (totalStores === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">TOP RATED STORES</h2>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No stores available at the moment.</p>
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
        <h2 className="text-2xl font-bold">TOP RATED STORES</h2>
        <span className="text-sm text-gray-500">{totalStores} stores available</span>
      </div>

      {/* Travel Stores Row */}
      {stores.travel.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Travel & Adventure</h3>
            <span className="text-sm text-gray-500">{stores.travel.length} stores</span>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {stores.travel.slice(0, 4).map((store) => renderStoreCard(store))}
          </div>
        </div>
      )}

      {/* Food Stores Row */}
      {stores.food.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Food & Restaurants</h3>
            <span className="text-sm text-gray-500">{stores.food.length} stores</span>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {stores.food.slice(0, 4).map((store) => renderStoreCard(store))}
          </div>
        </div>
      )}

      {/* View All Stores Button */}
      <div className="flex justify-center mt-8">
        <button 
          onClick={handleViewAllStores}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          View All Stores
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default PopularStores;