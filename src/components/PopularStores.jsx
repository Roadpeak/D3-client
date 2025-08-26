import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/storeService'; // Use the same service as working Stores component

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
        
        // Use the same ApiService pattern that works in Stores component
        const filters = {
          sortBy: 'Popular', // Use existing sort that works, or try 'Most Reviewed' if implemented
          limit: 8
        };
        
        console.log('Fetching stores with filters:', filters);
        const response = await ApiService.getStores(filters);
        console.log('API response:', response);
        
        if (response.success && response.stores) {
          console.log('Successfully fetched stores:', response.stores.length);
          
          // Sort by review count if available, otherwise by rating
          const sortedStores = response.stores
            .sort((a, b) => {
              const reviewsA = parseInt(a.totalReviews || a.reviews || 0);
              const reviewsB = parseInt(b.totalReviews || b.reviews || 0);
              if (reviewsA !== reviewsB) {
                return reviewsB - reviewsA; // Most reviewed first
              }
              // Fallback to rating
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

  const getTagFromReviewCount = (reviewCount) => {
    const numReviews = parseInt(reviewCount || 0);
    if (numReviews >= 50) return { text: 'MOST REVIEWED', color: 'bg-green-500' };
    if (numReviews >= 25) return { text: 'HIGHLY REVIEWED', color: 'bg-blue-500' };
    if (numReviews >= 10) return { text: 'POPULAR', color: 'bg-orange-500' };
    if (numReviews >= 1) return { text: 'REVIEWED', color: 'bg-purple-500' };
    return { text: 'NEW', color: 'bg-gray-500' };
  };

  const generateLogo = (name) => {
    if (!name) return 'ST';
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
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
    const rating = parseFloat(store.rating || 0);
    const reviewCount = parseInt(store.totalReviews || store.reviews || 0);
    const reviewTag = getTagFromReviewCount(reviewCount);
    
    return (
      <div 
        key={store.id} 
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative"
        onClick={() => handleStoreClick(store)}
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
          
          <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold text-white ${reviewTag.color}`}>
            {reviewTag.text}
          </div>
          
          <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-bold text-red-600">
            {store.cashback || '5%'} OFF
          </div>
          
          <div className={`absolute bottom-3 left-3 ${getLogoColor(store)} rounded-full p-2 shadow-lg overflow-hidden`}>
            {(store.logo_url || store.logo) && (store.logo_url?.startsWith('http') || store.logo?.startsWith('http')) ? (
              <img 
                src={store.logo_url || store.logo} 
                alt={`${store.name} logo`}
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  // If image fails to load, replace with text logo
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <span 
              className={`text-white font-bold text-xs ${(store.logo_url || store.logo) && (store.logo_url?.startsWith('http') || store.logo?.startsWith('http')) ? 'hidden' : 'block'}`}
            >
              {generateLogo(store.name)}
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
              <span className="text-xs text-gray-500">({reviewCount} reviews)</span>
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
                handleStoreClick(store);
              }}
            >
              Visit Store
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">TOP STORES</h2>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">TOP STORES</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
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

  const totalStores = stores.all.length;

  if (totalStores === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">TOP STORES</h2>
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
        <h2 className="text-2xl font-bold">TOP STORES</h2>
        <span className="text-sm text-gray-500">{totalStores} stores available</span>
      </div>

      <div className="mb-8">
        <div className="grid md:grid-cols-4 gap-6">
          {stores.all.slice(0, 8).map((store, index) => renderStoreCard(store, index))}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button 
          onClick={handleViewAllStores}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-normal transition-colors duration-200 flex items-center gap-2"
        >
          View All Stores
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default PopularStores;