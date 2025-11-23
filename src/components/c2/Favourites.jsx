import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Star, Store, ArrowLeft, MapPin, Calendar, Percent, Loader2, AlertCircle, X, RefreshCw } from 'lucide-react';
import authService from '../../services/authService';
import { useFavorites } from '../../hooks/useFavorites';

const FavouritesStandalone = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Use favorites hook with improved state management
  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
    removeFromFavorites,
    refreshFavorites,
    clearError,
    initialized: favoritesInitialized
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

  // Debug log favorites data
  useEffect(() => {
    console.log('📋 Favorites page data:', {
      favoritesCount: favorites.length,
      favoritesInitialized,
      favoritesLoading,
      favoritesError,
      sampleFavorite: favorites[0]
    });
  }, [favorites, favoritesInitialized, favoritesLoading, favoritesError]);

  const handleRemoveFavorite = async (offerId) => {
    const confirmRemove = window.confirm('Are you sure you want to remove this offer from your favorites?');
    if (!confirmRemove) return;

    console.log('🗑️ Removing favorite:', offerId);
    const success = await removeFromFavorites(offerId);
    if (success) {
      console.log('✅ Offer removed from favorites successfully');
      // The useFavorites hook will automatically update the favorites list
    } else {
      console.log('❌ Failed to remove from favorites');
    }
  };

  const handleOfferClick = (offerId) => {
    console.log('🔗 Navigating to offer:', offerId);
    navigate(`/offer/${offerId}`);
  };

  const formatOfferData = (favorite) => {
    console.log('🔧 Formatting favorite data:', favorite);

    // Handle different data structures that might come from the API
    const offer = favorite.offer || favorite;
    const service = offer.service || favorite.service;
    const store = offer.store || service?.store || favorite.store;

    const formatted = {
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

    console.log('📋 Formatted offer:', formatted);
    return formatted;
  };

  const handleRefreshFavorites = async () => {
    console.log('🔄 Manually refreshing favorites...');
    await refreshFavorites();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (favoritesLoading && !favoritesInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500 dark:text-red-400 fill-current" />
                  My Favourite Offers
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {favorites.length} {favorites.length === 1 ? 'offer' : 'offers'} saved
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    Debug: Initialized: {favoritesInitialized ? 'Yes' : 'No'} |
                    Loading: {favoritesLoading ? 'Yes' : 'No'}
                  </p>
                )}
              </div>

              <button
                onClick={handleRefreshFavorites}
                disabled={favoritesLoading}
                className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                title="Refresh favorites"
              >
                <RefreshCw className={`w-4 h-4 ${favoritesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message */}
          {favoritesError && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <span className="block font-medium">Error loading favorites</span>
                    <span className="block text-sm">{favoritesError}</span>
                  </div>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  title="Clear error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Loading indicator while refreshing */}
          {favoritesLoading && favoritesInitialized && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Refreshing favorites...</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {favorites.length === 0 && favoritesInitialized ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Heart className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favourite offers yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start exploring amazing offers and save the ones you love by clicking the heart icon.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/Hotdeals')}
                      className="w-full bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                    >
                      Discover Offers
                    </button>
                    <button
                      onClick={() => navigate('/stores')}
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      Browse Stores
                    </button>
                  </div>
                </div>
              </div>
            ) : !favoritesInitialized ? (
              <div className="text-center py-16">
                <Loader2 className="animate-spin w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Initializing favorites...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite, index) => {
                  const offer = formatOfferData(favorite);
                  const isExpired = offer.expirationDate && new Date(offer.expirationDate) < new Date();

                  return (
                    <div
                      key={`${offer.id}-${index}`}
                      className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-lg transition-all duration-200 group"
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
                            <span className="bg-yellow-500 dark:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium mb-1 block">
                              FEATURED
                            </span>
                          )}
                          {offer.discount > 0 && (
                            <span className="bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                              {offer.discount}% OFF
                            </span>
                          )}
                        </div>

                        {/* Remove from favorites button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(offer.id);
                          }}
                          className="absolute top-3 right-3 bg-red-500 dark:bg-red-600 text-white p-2 rounded-full hover:bg-red-600 dark:hover:bg-red-500 transition-colors shadow-lg"
                          title="Remove from favorites"
                          disabled={favoritesLoading}
                        >
                          {favoritesLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Heart className="w-4 h-4 fill-current" />
                          )}
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
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
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
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{offer.storeName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {offer.storeLocation}
                            </p>
                          </div>
                        </div>

                        {/* Offer Info */}
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{offer.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{offer.description}</p>

                        {/* Category */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full">
                            {offer.category}
                          </span>
                          {offer.expirationDate && (
                            <div className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                              <Calendar className="w-3 h-3" />
                              {isExpired ? 'Expired' : `Expires ${new Date(offer.expirationDate).toLocaleDateString()}`}
                            </div>
                          )}
                        </div>

                        {/* Pricing */}
                        {offer.originalPrice > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              KSH {offer.discountedPrice}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              KSH {offer.originalPrice}
                            </span>
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
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
                            className={`flex-1 text-center py-2 px-4 rounded-lg font-medium transition-colors ${isExpired
                                ? 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                              }`}
                          >
                            {isExpired ? 'Expired' : 'View Offer'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(offer.id);
                            }}
                            disabled={favoritesLoading}
                            className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                            title="Remove from favorites"
                          >
                            {favoritesLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Heart className="w-4 h-4 fill-current" />
                            )}
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
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>Total favorites: {favorites.length}</span>
                  <span>•</span>
                  <span>Active offers: {favorites.filter(fav => {
                    const offer = formatOfferData(fav);
                    return !offer.expirationDate || new Date(offer.expirationDate) > new Date();
                  }).length}</span>
                </div>

                <button
                  onClick={() => navigate('/Hotdeals')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Find more offers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavouritesStandalone;