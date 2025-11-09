// ViewOffer.jsx - Redesigned with modern layout and cyan-blue theme
import React, { useState, useEffect, useCallback } from 'react';
import { Share2, Copy, Facebook, Twitter, Instagram, Linkedin, Star, Clock, MapPin, Tag, Users, Calendar, Loader2, AlertCircle, CheckCircle, Info, ExternalLink, Building2, Phone, Mail, Globe, Award } from 'lucide-react';
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
      // User not authenticated
    }
  }, []);

  const fetchOfferData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await offerAPI.getOfferById(actualOfferId);

      if (!response) {
        throw new Error('No response received from server');
      }

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch offer');
      }

      if (response.offer) {
        const transformedOffer = {
          id: response.offer.id,
          title: response.offer.title || response.offer.service?.name || "Special Offer",
          location: response.offer.store?.location || response.offer.service?.store?.location || "Location not specified",
          platform: response.offer.store?.name || response.offer.service?.store?.name || "Store",
          region: "Nairobi",
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
          expiration_date: response.offer.expiration_date,
          images: response.offer.service?.images && response.offer.service.images.length > 0
            ? response.offer.service.images
            : response.offer.service?.image_url
              ? [response.offer.service.image_url, response.offer.service.image_url, response.offer.service.image_url]
              : ["/api/placeholder/600/400", "/api/placeholder/600/400", "/api/placeholder/600/400"],
          serviceId: response.offer.service?.id,
          serviceType: response.offer.service?.type,
          storeId: response.offer.store?.id || response.offer.service?.store?.id,
          storeData: response.offer.store || response.offer.service?.store,
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

  const handleBookOffer = async () => {
    try {
      setBookingLoading(true);

      if (!user) {
        const redirectUrl = actualStoreId
          ? `/store/${actualStoreId}/offer/${actualOfferId}`
          : `/offer/${actualOfferId}`;

        navigate(`/accounts/sign-in?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }

      if (!isOfferActive) {
        setError('This offer is no longer available for booking.');
        return;
      }

      if (!offerData.bookingEnabled) {
        setError('Booking is not enabled for this offer.');
        return;
      }

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

  const handleViewStore = async () => {
    try {
      setStoreNavigationLoading(true);

      const targetStoreId = actualStoreId || offerData?.storeId || offerData?.storeData?.id;

      if (!targetStoreId) {
        setError('Store information not available.');
        return;
      }

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

  const isOfferActive = offerData?.status === 'active' &&
    new Date(offerData?.expiration_date) > new Date();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin text-cyan-500" size={24} />
            <span className="text-gray-600">Loading offer details...</span>
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
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="mx-auto text-gray-600 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={fetchOfferData}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md"
              >
                Try Again
              </button>
              <Link
                to="/offers"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-colors font-medium"
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
          <div className="text-center max-w-md mx-auto px-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Offer not found</h2>
            <p className="text-gray-600 mb-6">The offer you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/offers"
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Error Alert */}
        {error && offerData && (
          <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-gray-700 flex-shrink-0" />
              <p className="text-gray-900 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images and Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={offerData.images[selectedImage]}
                  alt="Main offer"
                  className="w-full h-80 lg:h-96 object-cover"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/400';
                  }}
                />

                {/* Expired Overlay */}
                {!isOfferActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white">
                      <AlertCircle className="w-16 h-16 mx-auto mb-3" />
                      <p className="text-2xl font-bold">Offer Expired</p>
                      <p className="text-sm mt-2 opacity-90">This deal is no longer available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="p-4 bg-gray-50">
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {offerData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImage === index
                        ? 'border-cyan-500 ring-2 ring-cyan-200 scale-105'
                        : 'border-gray-200 hover:border-cyan-300'
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

            {/* ACTION BUTTONS - Quick Access Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-cyan-600" />
                Quick Actions
              </h3>

              <div className="space-y-3">
                {/* Book Offer Button */}
                <button
                  onClick={handleBookOffer}
                  disabled={!isOfferActive || !offerData.bookingEnabled || bookingLoading}
                  className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${isOfferActive && offerData.bookingEnabled
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white transform hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isOfferActive && offerData.bookingEnabled ? (
                    <>
                      <Calendar className="w-5 h-5" />
                      <span>BOOK THIS OFFER NOW</span>
                    </>
                  ) : (
                    <span>OFFER UNAVAILABLE</span>
                  )}
                </button>

                {/* View Store Button */}
                {(actualStoreId || offerData.storeId || offerData.storeData?.id) && (
                  <button
                    onClick={handleViewStore}
                    disabled={storeNavigationLoading}
                    className="w-full font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Share Button */}
                <button
                  onClick={handleCopyLink}
                  className="w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                >
                  <Share2 className="w-5 h-5" />
                  <span>SHARE THIS OFFER</span>
                </button>
              </div>

              {/* Auth Info */}
              {!user && (
                <div className="mt-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-cyan-900">
                      <strong>Sign in required:</strong> Create an account or sign in to book this amazing offer.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Offer Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Offer Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Location</p>
                    <p className="text-sm font-semibold text-gray-900">{offerData.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Provider</p>
                    <p className="text-sm font-semibold text-gray-900">{offerData.platform}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Valid Until</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(offerData.expiration_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {offerData.serviceDuration && offerData.serviceType === 'fixed' && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">{offerData.serviceDuration} mins</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="border-t pt-6">
                <h4 className="font-bold text-gray-900 mb-3">Description</h4>
                <p className="text-gray-600 leading-relaxed">{offerData.description}</p>
              </div>

              {/* Dynamic Offer Info */}
              {offerData.offer_type === 'dynamic' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl">
                  <h4 className="font-bold mb-2 flex items-center text-cyan-900">
                    <Info className="w-5 h-5 mr-2" />
                    Dynamic Pricing Offer
                  </h4>
                  <p className="text-cyan-800 text-sm mb-2">
                    {offerData.discount_explanation ||
                      `Get ${offerData.discount}% off the final quoted price after consultation.`}
                  </p>
                  {offerData.requires_consultation && (
                    <p className="text-cyan-800 text-sm">
                      <strong>Note:</strong> Consultation required to determine exact pricing before applying discount.
                    </p>
                  )}
                </div>
              )}

              {/* Benefits */}
              <div className="mt-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-cyan-600 mr-2" />
                  What You Get
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-cyan-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">{offerData.discount}% discount {offerData.offer_type === 'dynamic' ? 'on final price' : ''}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-cyan-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Professional service</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-cyan-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Easy online booking</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-cyan-600 mr-2 flex-shrink-0" />
                    <span className="text-sm">Flexible scheduling</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Options Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Share This Offer</h3>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Share on Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-12 h-12 bg-cyan-500 text-white rounded-xl flex items-center justify-center hover:bg-cyan-600 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Share on Twitter"
                >
                  <Twitter className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center hover:bg-blue-800 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleShare('instagram')}
                  className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Share on Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-12 h-12 bg-gray-600 text-white rounded-xl flex items-center justify-center hover:bg-gray-700 transition-all duration-200 transform hover:scale-110 shadow-md"
                  title="Copy link"
                >
                  <Copy className="w-6 h-6" />
                </button>
              </div>

              {copySuccess && (
                <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-center">
                  <p className="text-cyan-900 font-medium text-sm flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Link copied to clipboard!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Pricing & Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{offerData.title}</h1>
                <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
                  <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <MapPin className="w-4 h-4 mr-1" />
                    {offerData.location}
                  </span>
                  <span className="flex items-center bg-blue-100 px-3 py-1 rounded-full text-blue-700">
                    <Building2 className="w-4 h-4 mr-1" />
                    {offerData.platform}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-b py-6">
                {offerData.offer_type === 'dynamic' ? (
                  <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl">
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mb-2">
                      {offerData.discount}% OFF
                    </div>
                    <div className="text-sm text-cyan-700 font-medium">
                      Applied to final quoted price
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-400 line-through">
                        {offerData.originalPrice}
                      </span>
                      <span className="text-4xl font-bold text-gray-900">
                        {offerData.offerPrice}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 font-semibold text-right">
                      You save: KES {(parseFloat(offerData.originalPrice.replace('KES ', '')) - parseFloat(offerData.offerPrice.replace('KES ', ''))).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className={`p-4 rounded-xl border-2 ${isOfferActive
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
                : 'bg-gray-100 border-gray-300'
                }`}>
                <div className={`flex items-center justify-center ${isOfferActive ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-bold">
                    {isOfferActive ? `Valid until ${new Date(offerData.expiration_date).toLocaleDateString()}` : 'Offer Expired'}
                  </span>
                </div>
              </div>

              {/* Urgency Message */}
              {isOfferActive && (
                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-xl">
                  <p className="text-gray-900 font-bold text-sm">⚡ {offerData.urgencyText}</p>
                </div>
              )}

              {/* Store Info */}
              {offerData.storeData && (
                <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{offerData.storeData.name || offerData.platform}</p>
                      <p className="text-sm text-gray-600">{offerData.storeData.location || offerData.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Info */}
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-cyan-900">
                    <p className="font-semibold mb-1">Booking Process</p>
                    <p>
                      {offerData.offer_type === 'dynamic'
                        ? 'Final price determined after consultation. Discount applied to agreed amount.'
                        : `Pay the discounted price of ${offerData.offerPrice} at your appointment.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ViewOffer;