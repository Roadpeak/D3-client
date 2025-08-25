import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const Heart = ({ className, filled = false }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const PopularStores = () => {
  const [stores, setStores] = useState({ travel: [], food: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [debugInfo, setDebugInfo] = useState('');

  // Fetch most reviewed stores with fallback options
  useEffect(() => {
    const fetchMostReviewedStores = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo('Starting to fetch stores...');
        
        // FALLBACK APPROACH: Try multiple endpoints in order of preference
        const endpoints = [
          // First try the "Most Reviewed" sorting (if backend supports it)
          '/api/v1/stores?sortBy=Most Reviewed&limit=8',
          // Fallback to "Popular" sorting (rating-based)
          '/api/v1/stores?sortBy=Popular&limit=8',
          // Fallback to default with limit
          '/api/v1/stores?limit=8',
          // Final fallback to basic endpoint
          '/api/v1/stores'
        ];

        let successfulResponse = null;
        let usedEndpoint = '';

        for (const endpoint of endpoints) {
          try {
            setDebugInfo(`Trying endpoint: ${endpoint}`);
            console.log('🔍 Trying endpoint:', endpoint);
            
            const response = await fetch(endpoint);
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
              console.log('❌ Response not OK:', response.status, response.statusText);
              const errorText = await response.text();
              console.log('❌ Error response body:', errorText.substring(0, 200));
              continue; // Try next endpoint
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.log('❌ Response is not JSON. Content-Type:', contentType);
              const responseText = await response.text();
              console.log('❌ Non-JSON response preview:', responseText.substring(0, 200));
              continue; // Try next endpoint
            }

            const data = await response.json();
            console.log('✅ Successfully parsed JSON:', data);
            
            if (data.success && data.stores) {
              successfulResponse = data;
              usedEndpoint = endpoint;
              setDebugInfo(`Success with endpoint: ${endpoint}`);
              break;
            } else {
              console.log('❌ API returned success:false or no stores:', data);
              continue; // Try next endpoint
            }
          } catch (endpointError) {
            console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
            continue; // Try next endpoint
          }
        }

        if (!successfulResponse) {
          throw new Error('All endpoints failed. Please check your backend server and API routes.');
        }

        console.log('✅ Final successful endpoint:', usedEndpoint);
        console.log('✅ Fetched stores:', successfulResponse.stores.length);
        
        // Group stores by category for display
        const groupedStores = {
          travel: successfulResponse.stores.filter(store => 
            store.category?.toLowerCase().includes('travel') || 
            store.category?.toLowerCase().includes('adventure') ||
            store.category?.toLowerCase().includes('hotel') ||
            store.category?.toLowerCase().includes('flight')
          ),
          food: successfulResponse.stores.filter(store => 
            store.category?.toLowerCase().includes('food') || 
            store.category?.toLowerCase().includes('restaurant') ||
            store.category?.toLowerCase().includes('dining') ||
            store.category?.toLowerCase().includes('delivery')
          ),
          all: successfulResponse.stores
        };
        
        // If we don't have enough stores in specific categories, use all stores
        if (groupedStores.travel.length === 0 && groupedStores.food.length === 0) {
          const midpoint = Math.ceil(successfulResponse.stores.length / 2);
          groupedStores.travel = successfulResponse.stores.slice(0, midpoint);
          groupedStores.food = successfulResponse.stores.slice(midpoint);
        }
        
        console.log('📊 Grouped stores:', {
          travel: groupedStores.travel.length,
          food: groupedStores.food.length,
          all: groupedStores.all.length
        });
        
        setStores(groupedStores);
        setDebugInfo(`Successfully loaded ${successfulResponse.stores.length} stores using: ${usedEndpoint}`);
        
      } catch (err) {
        console.error('💥 Final error:', err);
        setError(`Network error: ${err.message}`);
        setDebugInfo(`Failed with error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMostReviewedStores();
  }, []);

  // Test API connectivity
  const testApiConnectivity = async () => {
    try {
      console.log('🧪 Testing API connectivity...');
      setDebugInfo('Testing API connectivity...');
      
      // Test basic health endpoint
      const healthResponse = await fetch('/api/v1/health');
      console.log('🏥 Health check response:', healthResponse.status);
      
      // Test stores endpoint
      const storesResponse = await fetch('/api/v1/stores');
      console.log('🏪 Stores endpoint response:', storesResponse.status);
      
      if (storesResponse.ok) {
        const contentType = storesResponse.headers.get('content-type');
        console.log('📋 Stores endpoint content-type:', contentType);
        
        if (contentType?.includes('application/json')) {
          const data = await storesResponse.json();
          console.log('📊 Stores data preview:', {
            success: data.success,
            storeCount: data.stores?.length,
            hasStores: !!data.stores
          });
          setDebugInfo(`API is working! Found ${data.stores?.length || 0} stores`);
        } else {
          setDebugInfo('API endpoint exists but not returning JSON');
        }
      } else {
        setDebugInfo(`API endpoint returned status: ${storesResponse.status}`);
      }
    } catch (testError) {
      console.error('🧪 API test failed:', testError);
      setDebugInfo(`API test failed: ${testError.message}`);
    }
  };

  // Handle store click
  const handleStoreClick = (storeId) => {
    window.location.href = `/stores/${storeId}`;
  };

  // Handle view all stores
  const handleViewAllStores = () => {
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

  // Get tag color based on review count
  const getTagFromReviewCount = (reviewCount) => {
    const numReviews = parseInt(reviewCount || 0);
    if (numReviews >= 50) return { text: 'MOST REVIEWED', color: 'bg-green-500' };
    if (numReviews >= 25) return { text: 'HIGHLY REVIEWED', color: 'bg-blue-500' };
    if (numReviews >= 10) return { text: 'POPULAR', color: 'bg-orange-500' };
    return { text: 'REVIEWED', color: 'bg-gray-500' };
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

  // Get logo color based on store name
  const getLogoColor = (store) => {
    if (store.logoColor) return store.logoColor;
    
    const colors = [
      'bg-orange-500', 'bg-red-500', 'bg-green-500', 'bg-purple-600',
      'bg-blue-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'
    ];
    
    const index = (store.id?.toString().length || store.name?.length || 0) % colors.length;
    return colors[index];
  };

  const renderStoreCard = (store, index) => {
    const rating = parseFloat(store.rating || 0);
    const reviewCount = parseInt(store.totalReviews || store.reviews || 0);
    const reviewTag = getTagFromReviewCount(reviewCount);
    
    return (
      <div 
        key={store.id} 
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative"
        onClick={() => handleStoreClick(store.id)}
      >
        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          #{index + 1}
        </div>
        
        <div className="relative">
          <img 
            src={store.image || store.logo_url || '/images/placeholder-store.png'} 
            alt={store.name} 
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = '/images/placeholder-store.png';
            }}
          />
          
          <div className={`absolute top-3 right-12 px-2 py-1 rounded text-xs font-bold text-white ${reviewTag.color}`}>
            {reviewTag.text}
          </div>
          
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
            {store.cashback || '5%'} OFF
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
          <p className="text-xs text-gray-600 mb-2">{store.category || 'General'}</p>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({reviewCount})</span>
            </div>
            <div className="text-red-500 text-xs font-semibold">
              {store.offer || store.cashback}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-green-600 font-bold text-sm">
              {reviewCount > 0 ? `${reviewCount} Reviews` : 'New Store'}
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
  };

  // Loading state
  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-2">MOST REVIEWED STORES</h2>
        {debugInfo && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded mb-4 text-sm">
            Debug: {debugInfo}
          </div>
        )}
        
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  // Error state with debug info
  if (error) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">MOST REVIEWED STORES</h2>
        
        {/* Debug info */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Debug Information:</p>
          <p className="text-sm">{debugInfo}</p>
        </div>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error loading stores:</p>
          <p className="text-sm">{error}</p>
          <div className="mt-3 space-x-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
            >
              Retry
            </button>
            <button 
              onClick={testApiConnectivity} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            >
              Test API
            </button>
          </div>
        </div>
        
        {/* Troubleshooting tips */}
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
          <p className="font-semibold mb-2">Troubleshooting Tips:</p>
          <ul className="text-sm list-disc list-inside space-y-1">
            <li>Make sure your backend server is running on the correct port</li>
            <li>Check that the API route '/api/v1/stores' exists in your backend</li>
            <li>Verify that your backend controller handles the 'sortBy' parameter</li>
            <li>Ensure CORS is properly configured for frontend-backend communication</li>
            <li>Check browser console for more detailed error information</li>
          </ul>
        </div>
      </section>
    );
  }

  const totalStores = stores.all.length;

  if (totalStores === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">MOST REVIEWED STORES</h2>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No stores found.</p>
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
        <h2 className="text-2xl font-bold">MOST REVIEWED STORES</h2>
        <span className="text-sm text-gray-500">{totalStores} stores available</span>
      </div>

      {/* Debug info when successful */}
      {debugInfo && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
          {debugInfo}
        </div>
      )}

      {stores.travel.length === 0 && stores.food.length === 0 ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Most Popular</h3>
            <span className="text-sm text-gray-500">Ranked by customer reviews</span>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {stores.all.slice(0, 8).map((store, index) => renderStoreCard(store, index))}
          </div>
        </div>
      ) : (
        <>
          {stores.travel.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Most Reviewed Travel & Adventure</h3>
                <span className="text-sm text-gray-500">{stores.travel.length} stores</span>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                {stores.travel.slice(0, 4).map((store, index) => renderStoreCard(store, index))}
              </div>
            </div>
          )}

          {stores.food.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Most Reviewed Food & Restaurants</h3>
                <span className="text-sm text-gray-500">{stores.food.length} stores</span>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                {stores.food.slice(0, 4).map((store, index) => renderStoreCard(store, stores.travel.length + index))}
              </div>
            </div>
          )}
        </>
      )}

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