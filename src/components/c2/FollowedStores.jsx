import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, MapPin, Star, Users, Eye, ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import authService from '../../services/authService';
import api from '../../config/api';

const FollowedStoresStandalone = () => {
  const [user, setUser] = useState(null);
  const [followedStores, setFollowedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/accounts/sign-in');
          return;
        }

        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.data.user);
          await fetchFollowedStores();
        } else {
          navigate('/accounts/sign-in');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Authentication failed. Please log in again.');
        setTimeout(() => navigate('/accounts/sign-in'), 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchFollowedStores = async () => {
    try {
      setError(null);
      console.log('🔍 Fetching followed stores...');
      
      // Updated API endpoint to match the new route
      const response = await api.get('/stores/followed');
      console.log('✅ Followed stores response:', response.data);
      
      if (response.data.success) {
        setFollowedStores(response.data.followedStores || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch followed stores');
      }
    } catch (error) {
      console.error('❌ Error fetching followed stores:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => navigate('/accounts/sign-in'), 2000);
      } else {
        setError(error.response?.data?.message || 'Failed to load followed stores');
      }
    }
  };

  const unfollowStore = async (storeId) => {
    try {
      console.log(`🔄 Unfollowing store ${storeId}...`);
      
      // Use the toggle follow endpoint
      const response = await api.post(`/stores/${storeId}/toggle-follow`);
      
      if (response.data.success) {
        // Remove the store from the followed stores list
        setFollowedStores(prev => prev.filter(store => store.id !== storeId));
        console.log('✅ Store unfollowed successfully');
      } else {
        throw new Error(response.data.message || 'Failed to unfollow store');
      }
    } catch (error) {
      console.error('❌ Error unfollowing store:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => navigate('/accounts/sign-in'), 2000);
      } else {
        setError(error.response?.data?.message || 'Failed to unfollow store');
        // Refresh the list to ensure data consistency
        fetchFollowedStores();
      }
    }
  };

  const handleStoreClick = (storeId) => {
    navigate(`/Store/${storeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your followed stores...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/profile" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchFollowedStores();
              }}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Followed Stores</h1>
              <span className="text-sm text-gray-500">
                {followedStores.length} {followedStores.length === 1 ? 'store' : 'stores'}
              </span>
            </div>
            
            {followedStores.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No followed stores yet</h3>
                <p className="mb-4">Start exploring and follow your favorite stores!</p>
                <button 
                  onClick={() => navigate('/stores')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Discover Stores
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followedStores.map((store) => (
                  <div 
                    key={store.id} 
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer group"
                    onClick={() => handleStoreClick(store.id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {store.logo ? (
                          <img 
                            src={store.logo} 
                            alt={store.name} 
                            className="w-12 h-12 rounded-lg object-cover" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <Store className={`w-8 h-8 text-blue-600 ${store.logo ? 'hidden' : 'block'}`} />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          unfollowStore(store.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                        title="Unfollow store"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {store.name}
                    </h3>
                    
                    {store.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {store.description}
                      </p>
                    )}
                    
                    {store.location && (
                      <div className="flex items-center mb-2">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{store.location}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                        <span className="text-sm font-medium">{store.rating || '0.0'}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({store.reviewCount || store.totalReviews || 0} reviews)
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{store.followers || store.followerCount || 0}</span>
                      </div>
                    </div>
                    
                    {/* Cashback Info */}
                    {store.cashback && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-700">Cashback</span>
                          <span className="text-lg font-bold text-green-600">{store.cashback}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStoreClick(store.id);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Store
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          unfollowStore(store.id);
                        }}
                        className="px-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FollowedStoresStandalone;