import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Star, Store, ArrowLeft, MapPin, Calendar, Percent, Loader2, AlertCircle, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import authService from '../../services/authService';
import { useFavorites } from '../../hooks/useFavorites';

const FavouritesStandalone = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Use favorites hook
  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
    removeFromFavorites,
    refreshFavorites,
    clearError
  } = useFavorites();

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
        } else {
          navigate('/accounts/sign-in');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/accounts/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleRemoveFavorite = async (offerId) => {
    const confirmRemove = window.confirm('Are you sure you want to remove this offer from your favorites?');
    if (!confirmRemove) return;

    const success = await removeFromFavorites(offerId);
    if (success) {
      // Optional: Add toast notification here
      console.log('Offer removed from favorites successfully');
    }
  };

  const handleOfferClick = (offerId) => {
    navigate(`/offer/${offerId}`);
  };

  const formatOfferData = (favorite) => {
    // Handle different data structures that might come from the API
    const offer = favorite.offer || favorite;
    const service = offer.service || favorite.service;
    const store = offer.store || service?.store || favorite.store;

    return {
      id: offer.id || favorite.offer_id,
      title: offer.title || service?.name || 'Special Offer',
      description: offer.description || service?.description || 'Exclusive offer available',
      image: service?.image_url || offer.image_url || '/api/placeholder/300/200',
      discount: offer.discount || 0,
      originalPrice: service?.price || 0,
      discountedPrice: service?.price && offer.discount 
        ? (service.price * (1 - offer.discount / 100)).toFixed(2) 
        : 0,
      category: service?.category || 'General',
      storeName: store?.name || 'Store',
      storeLocation: store?.location || 'Location not specified',
      storeLogo: store?.logo_url || '/api/placeholder/40/40',
      status: offer.status || 'active',
      expirationDate: offer.expiration_date || offer.expiry_date,
      featured: offer.featured || false
    };
  };

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your favorites...</p>
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

        <div className="bg-white rounded-2xl shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500 fill-current" />
                  My Favourite Offers
                </h1>
                <p className="text-gray-600 mt-1">
                  {favorites.length} {favorites.length === 1 ? 'offer' : 'offers'} saved
                </p>
              </div>
              
              <button
                onClick={refreshFavorites}
                disabled={favoritesLoading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Loader2 className={`w-4 h-4 ${favoritesLoading ? 'animate-spin' : 'hidden'}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message */}
          {favoritesError && (
            <div className="p-4 border-b border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span>{favoritesError}</span>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {favorites.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Heart className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No favourite offers yet</h3>
                  <p className="text-gray-500 mb-6">
                    Start exploring amazing offers and save the ones you love by clicking the heart icon.
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/Hotdeals')}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Discover Offers
                    </button>
                    <button 
                      onClick={() => navigate('/stores')}
                      className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Browse Stores
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => {
                  const offer = formatOfferData(favorite);
                  const isExpired = offer.expirationDate && new Date(offer.expirationDate) < new Date();
                  
                  return (
                    <div 
                      key={offer.id} 
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
                    >
                      {/* Image */}
                      <div className="relative">
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/300/200';
                          }}
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3">
                          {offer.featured && (
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium mb-1 block">
                              FEATURED
                            </span>
                          )}
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                            {offer.discount}% OFF
                          </span>
                        </div>

                        {/* Remove from favorites button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(offer.id);
                          }}
                          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          title="Remove from favorites"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>

                        {/* Status overlay for expired offers */}
                        {isExpired && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <div className="text-center text-white">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                              <span className="text-sm font-medium">Expired</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Store Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <img 
                              src={offer.storeLogo} 
                              alt="Store logo"
                              className="w-6 h-6 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/20/20';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{offer.storeName}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {offer.storeLocation}
                            </p>
                          </div>
                        </div>

                        {/* Offer Info */}
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{offer.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>
                        
                        {/* Category */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {offer.category}
                          </span>
                          {offer.expirationDate && (
                            <div className={`flex items-center gap-1 text-xs ${
                              isExpired ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              {isExpired ? 'Expired' : `Expires ${new Date(offer.expirationDate).toLocaleDateString()}`}
                            </div>
                          )}
                        </div>

                        {/* Pricing */}
                        {offer.originalPrice > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg font-bold text-green-600">
                              KSH {offer.discountedPrice}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              KSH {offer.originalPrice}
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              Save KSH {(offer.originalPrice - offer.discountedPrice).toFixed(2)}
                            </span>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOfferClick(offer.id)}
                            disabled={isExpired}
                            className={`flex-1 text-center py-2 px-4 rounded-lg font-medium transition-colors ${
                              isExpired
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isExpired ? 'Expired' : 'View Offer'}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(offer.id);
                            }}
                            className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove from favorites"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with stats */}
          {favorites.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Total favorites: {favorites.length}</span>
                  <span>•</span>
                  <span>Active offers: {favorites.filter(fav => {
                    const offer = formatOfferData(fav);
                    return !offer.expirationDate || new Date(offer.expirationDate) > new Date();
                  }).length}</span>
                </div>
                
                <button
                  onClick={() => navigate('/offers')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Find more offers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FavouritesStandalone;