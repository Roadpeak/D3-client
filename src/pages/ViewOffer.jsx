// ViewOffer.jsx - Updated version with View Store button and fixed ESLint warnings
import React, { useState, useEffect, useCallback } from 'react';
import { Share2, Copy, Facebook, Twitter, Instagram, Linkedin, Star, Clock, MapPin, Tag, Users, Calendar, Loader2, AlertCircle, CheckCircle, Info, ExternalLink, Building2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { offerAPI } from '../services/offerService';
import authService from '../services/authService';

const ViewOffer = () => {
  const { id, storeId, offerId } = useParams();
  const navigate = useNavigate();
  
  // Handle both old and new URL structures
  const actualOfferId = offerId || id;
  const actualStoreId = storeId;

  // Debug logging for URL structure
  console.log('🔍 ViewOffer URL Parameters:', {
    id,
    storeId,
    offerId,
    actualOfferId,
    actualStoreId,
    urlStructure: actualStoreId ? 'NEW (store/offer/id)' : 'LEGACY (offer/id)'
  });

  // Helper function to generate correct offer URLs
  const generateOfferUrl = (offerIdParam, storeIdParam = null) => {
    if (storeIdParam) {
      return `/store/${storeIdParam}/offer/${offerIdParam}`;
    }
    // For backward compatibility or when store ID is not available
    return `/offers`; // Redirect to offers listing
  };

  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offerData, setOfferData] = useState(null);
  const [user, setUser] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [storeNavigationLoading, setStoreNavigationLoading] = useState(false);

  const checkUserAuth = useCallback(async () => {
    try {
      const userResponse = await authService.getCurrentUser();
      if (userResponse && userResponse.success) {
        setUser(userResponse.data?.user || userResponse.user);
      }
    } catch (err) {
      console.log('User not authenticated');
    }
  }, []);

  const fetchOfferData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching offer with ID:', actualOfferId);

      const response = await offerAPI.getOfferById(actualOfferId);

      console.log('API Response:', response);

      if (!response) {
        throw new Error('No response received from server');
      }

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch offer');
      }

      if (response.offer) {
        // Enhanced offer transformation with better data handling
        const transformedOffer = {
          id: response.offer.id,
          title: response.offer.title || response.offer.service?.name || "Special Offer",
          location: response.offer.store?.location || response.offer.service?.store?.location || "Location not specified",
          platform: response.offer.store?.name || response.offer.service?.store?.name || "Store",
          region: "Nairobi",
          // purchases: "75 Bought", // You might want to track this in your API
          originalPrice: response.offer.service?.price ? `KES ${response.offer.service.price}` : "KES 200.00",
          offerPrice: response.offer.service?.price && response.offer.discount
            ? `KES ${(response.offer.service.price * (1 - response.offer.discount / 100)).toFixed(2)}`
            : "KES 60.00",
          discount: response.offer.discount,
          description: response.offer.description || response.offer.service?.description || "Get exclusive offers with these amazing deals",
          urgencyText: "HURRY UP ONLY A FEW DEALS LEFT",
          expiryText: new Date(response.offer.expiration_date) < new Date() ? "This offer has expired!" : "Limited time offer!",
          offerDuration: `Valid until ${new Date(response.offer.expiration_date).toLocaleDateString()}`,
          status: response.offer.status,
          featured: response.offer.featured,
          offer_type: response.offer.offer_type,
          discount_explanation: response.offer.discount_explanation,
          requires_consultation: response.offer.requires_consultation,
          // FIXED: Store the actual expiration date for proper comparison
          expiration_date: response.offer.expiration_date,
          // Enhanced image handling
          images: response.offer.service?.images && response.offer.service.images.length > 0
            ? response.offer.service.images
            : response.offer.service?.image_url
            ? [response.offer.service.image_url, response.offer.service.image_url, response.offer.service.image_url]
            : ["/api/placeholder/600/400", "/api/placeholder/600/400", "/api/placeholder/600/400"],
          // Additional offer metadata
          serviceId: response.offer.service?.id,
          serviceType: response.offer.service?.type,
          storeId: response.offer.store?.id || response.offer.service?.store?.id,
          storeData: response.offer.store || response.offer.service?.store, // Store complete store data
          serviceDuration: response.offer.service?.duration || 60,
          bookingEnabled: response.offer.service?.booking_enabled !== false
        };

        setOfferData(transformedOffer);
      } else {
        throw new Error('Offer data not found in response');
      }
    } catch (err) {
      console.error('Error fetching offer:', err);

      let errorMessage = 'Failed to load offer details. Please try again.';

      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;

        switch (status) {
          case 400:
            errorMessage = serverMessage || 'Invalid offer ID provided.';
            break;
          case 401:
            errorMessage = 'You need to be logged in to view this offer.';
            break;
          case 403:
            errorMessage = 'You don\'t have permission to view this offer.';
            break;
          case 404:
            errorMessage = 'This offer could not be found. It may have been removed or expired.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = serverMessage || `Error ${status}: ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [actualOfferId]);

  useEffect(() => {
    if (actualOfferId) {
      fetchOfferData();
      checkUserAuth();
    }
  }, [actualOfferId, actualStoreId, fetchOfferData, checkUserAuth]);

  // Enhanced booking handler with better flow
  const handleBookOffer = async () => {
    try {
      setBookingLoading(true);
      
      // Check if user is authenticated
      if (!user) {
        // Store the current location to redirect back after login
        const redirectUrl = actualStoreId 
          ? `/store/${actualStoreId}/offer/${actualOfferId}`
          : `/offer/${actualOfferId}`;
        
        console.log('🔄 Not logged in, redirecting to login with:', redirectUrl);
        navigate(`/accounts/sign-in?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }
      // Check if offer is active and bookable
      if (!isOfferActive) {
        setError('This offer is no longer available for booking.');
        return;
      }

      if (!offerData.bookingEnabled) {
        setError('Booking is not enabled for this offer.');
        return;
      }

      // For dynamic offers that require consultation, show info
      if (offerData.offer_type === 'dynamic' && offerData.requires_consultation) {
        const confirmConsultation = window.confirm(
          'This is a dynamic pricing offer that requires consultation. ' +
          'The exact service price will be determined after discussion with the provider. ' +
          'The discount will be applied to the final agreed price. Continue?'
        );
        
        if (!confirmConsultation) {
          setBookingLoading(false);
          return;
        }
      }

      // Navigate to the enhanced booking page with offer type
      const bookingUrl = actualStoreId 
        ? `/store/${actualStoreId}/offer/${actualOfferId}/book`
        : `/booking/offer/${actualOfferId}`;
        
      navigate(bookingUrl, {
        state: {
          offerData: offerData,
          bookingType: 'offer',
          storeId: actualStoreId
        }
      });
      
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to start booking process. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // NEW: Handle view store navigation
  const handleViewStore = async () => {
    try {
      setStoreNavigationLoading(true);
      
      // Use store ID from URL if available, otherwise fall back to offer data
      const targetStoreId = actualStoreId || offerData?.storeId || offerData?.storeData?.id;
      
      // Check if store data is available
      if (!targetStoreId) {
        setError('Store information not available.');
        return;
      }
      
      // Navigate to store view page
      navigate(`/store/${targetStoreId}`, {
        state: {
          fromOffer: true,
          offerData: offerData,
          offerId: actualOfferId
        }
      });
      
    } catch (error) {
      console.error('Store navigation error:', error);
      setError('Failed to navigate to store. Please try again.');
    } finally {
      setStoreNavigationLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing offer: ${offerData?.title}`;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      instagram: `https://www.instagram.com/`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // FIXED: Check if offer is active and bookable using actual expiration_date
  const isOfferActive = offerData?.status === 'active' && 
                        new Date(offerData?.expiration_date) > new Date();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading offer details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error && !offerData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-2">
              <button
                onClick={fetchOfferData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/offers"
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Browse Offers
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No offer found
  if (!offerData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Offer not found</h2>
            <p className="text-gray-600 mb-4">The offer you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/offers"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Browse All Offers
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb for Store Context */}
        {actualStoreId && offerData && (
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link 
              to="/stores" 
              className="hover:text-blue-600 transition-colors"
            >
              Stores
            </Link>
            <span>›</span>
            <Link 
              to={`/store/${actualStoreId}`}
              className="hover:text-blue-600 transition-colors"
            >
              {offerData.platform || offerData.storeData?.name || 'Store'}
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">
              {offerData.title}
            </span>
          </nav>
        )}

        {/* Error Alert */}
        {error && offerData && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={offerData.images[selectedImage]}
                  alt="Main offer"
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/400';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {offerData.discount}% OFF
                  </span>
                </div>
                {offerData.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      FEATURED
                    </span>
                  </div>
                )}
                {offerData.offer_type === 'dynamic' && (
                  <div className="absolute top-4 right-4 mr-20">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      DYNAMIC PRICING
                    </span>
                  </div>
                )}
                {!isOfferActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <AlertCircle className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-xl font-semibold">Offer Expired</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {offerData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/80/80';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Offer Description</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{offerData.description}</p>

              {/* Dynamic Offer Information */}
              {offerData.offer_type === 'dynamic' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center text-blue-800">
                    <Info className="w-5 h-5 mr-2" />
                    Dynamic Pricing Offer
                  </h4>
                  <p className="text-blue-700 text-sm mb-2">
                    {offerData.discount_explanation || 
                     `This offer provides ${offerData.discount}% off the final quoted price that will be agreed upon after consultation.`}
                  </p>
                  {offerData.requires_consultation && (
                    <p className="text-blue-700 text-sm">
                      <strong>Consultation Required:</strong> The service provider will discuss your specific needs to determine the exact service and pricing before applying the discount.
                    </p>
                  )}
                </div>
              )}

              {/* Offer Benefits */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  What You Get
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>{offerData.discount}% discount {offerData.offer_type === 'dynamic' ? 'on final price' : 'on regular price'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Professional service quality</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Easy online booking</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Flexible scheduling</span>
                  </div>
                  {offerData.serviceType === 'fixed' && (
                    <div className="flex items-center text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Fixed pricing guarantee</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-3">Offer Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{offerData.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Tag className="w-4 h-4 mr-2" />
                    <span>{offerData.platform}</span>
                  </div>
                  {/* <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{offerData.purchases}</span>
                  </div> */}
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{offerData.offerDuration}</span>
                  </div>
                  {offerData.serviceDuration && offerData.serviceType === 'fixed' && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{offerData.serviceDuration} minutes duration</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Enhanced Booking Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{offerData.title}</h1>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {offerData.platform}
                </span>
                <span>{offerData.region}</span>
                <span>{offerData.purchases}</span>
              </div>

              {/* Enhanced Pricing Display */}
              <div className="mb-6">
                {offerData.offer_type === 'dynamic' ? (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {offerData.discount}% OFF
                      </div>
                      <div className="text-sm text-blue-700">
                        Dynamic pricing - discount applied to final quoted price
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl font-bold text-gray-500 line-through">
                      {offerData.originalPrice}
                    </span>
                    <span className="text-3xl font-bold text-green-500">
                      {offerData.offerPrice}
                    </span>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  {offerData.offer_type === 'dynamic' ? (
                    <span>Final price determined after consultation</span>
                  ) : (
                    <>
                      You save: <span className="font-semibold text-green-600">
                        KES {(parseFloat(offerData.originalPrice.replace('KES ', '')) - parseFloat(offerData.offerPrice.replace('KES ', ''))).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Offer Duration with enhanced styling */}
              <div className={`border rounded-lg p-3 mb-4 ${
                isOfferActive ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className={`flex items-center ${
                  isOfferActive ? 'text-blue-800' : 'text-red-800'
                }`}>
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {isOfferActive ? offerData.offerDuration : 'This offer has expired'}
                  </span>
                </div>
              </div>

              {/* Status indicators */}
              {offerData.status !== 'active' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm font-medium">
                    This offer is currently {offerData.status}
                  </p>
                </div>
              )}

              {/* Enhanced Action Buttons */}
              <div className="space-y-3 mb-4">
                {/* Primary Booking Button */}
                <button
                  onClick={handleBookOffer}
                  disabled={!isOfferActive || !offerData.bookingEnabled || bookingLoading}
                  className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                    isOfferActive && offerData.bookingEnabled
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : isOfferActive && offerData.bookingEnabled ? (
                    <>
                      <Calendar className="w-5 h-5" />
                      <span>BOOK THIS OFFER</span>
                    </>
                  ) : (
                    <span>OFFER UNAVAILABLE</span>
                  )}
                </button>

                {/* NEW: View Store Button */}
                {(actualStoreId || offerData.storeId || offerData.storeData?.id) && (
                  <button
                    onClick={handleViewStore}
                    disabled={storeNavigationLoading}
                    className="w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 hover:border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {storeNavigationLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5" />
                        <span>VIEW STORE</span>
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* User Authentication Info */}
              {!user && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>New here?</strong> You'll need to sign in or create an account to book this offer.
                  </p>
                </div>
              )}

              {/* Store Information Display */}
              {offerData.storeData && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{offerData.storeData.name || offerData.platform}</p>
                      <p className="text-sm text-gray-600">{offerData.storeData.location || offerData.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Important Note */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Booking Process:</strong> This booking grants you access to the exclusive offer.
                      {offerData.offer_type === 'dynamic' 
                        ? ' Final service price will be determined after consultation.'
                        : ` You'll pay the discounted service price of ${offerData.offerPrice} when you arrive for your appointment.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Urgency Message */}
              <div className="text-center mb-4">
                <p className="text-red-600 font-medium text-sm">{offerData.urgencyText}</p>
                <div className="flex items-center justify-center text-gray-500 text-sm mt-2">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{offerData.expiryText}</span>
                </div>
              </div>

              {/* Enhanced Share Options */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Share this offer:</span>
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 transform hover:scale-110"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-all duration-200 transform hover:scale-110"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-all duration-200 transform hover:scale-110"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('instagram')}
                    className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-600 transition-all duration-200 transform hover:scale-110"
                    title="Share on Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-all duration-200 transform hover:scale-110"
                    title="Copy link"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>

                {copySuccess && (
                  <p className="text-green-600 text-sm text-center mt-2 animate-fade-in">
                    Link copied to clipboard!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Simplified */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(4)}
              </div>
              <span className="text-gray-600">4.0 (205 reviews)</span>
            </div>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>Reviews will be displayed here when available.</p>
          </div>
        </div> */}
      </div>

      <Footer />
    </div>
  );
};

export default ViewOffer;