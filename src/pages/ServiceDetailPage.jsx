import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar,
  Star,
  MapPin,
  Phone,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  ChevronRight,
  Globe,
  Heart,
  Share2,
  Info,
  Navigation,
  Zap,
  Shield,
  UserCheck,
  CreditCard,
  Timer,
  Bell,
  MessageSquare,
  Tag
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StoreService from '../services/storeService';
import serviceAPI from '../services/serviceService';
import authService from '../services/authService';

const ServiceDetailPage = () => {
  const { storeId, serviceId, id } = useParams();
  const navigate = useNavigate();

  // State management
  const [storeData, setStoreData] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeLoading, setStoreLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Determine the actual service ID (could be from :id or :serviceId param)
  const actualServiceId = serviceId || id;

  // Fetch store data
  const fetchStoreData = async () => {
    if (!storeId) {
      setStoreLoading(false);
      return;
    }

    try {
      setStoreLoading(true);
      const data = await StoreService.getStoreById(storeId);
      setStoreData(data.store);
    } catch (err) {
      console.error('Error fetching store:', err);
      // Don't set error here, as service might still load without store data
    } finally {
      setStoreLoading(false);
    }
  };

  // Fetch service data
  const fetchServiceData = async () => {
    try {
      setServiceLoading(true);
      const data = await serviceAPI.getServiceById(actualServiceId);
      setServiceData(data.service || data);
    } catch (err) {
      console.error('Error fetching service:', err);
      setError('Service not found');
    } finally {
      setServiceLoading(false);
    }
  };

  useEffect(() => {
    if (actualServiceId) {
      fetchServiceData();
    }
    if (storeId) {
      fetchStoreData();
    }
  }, [storeId, actualServiceId]);

  useEffect(() => {
    setLoading(storeLoading || serviceLoading);
  }, [storeLoading, serviceLoading]);

  const goBack = () => {
    if (storeId) {
      navigate(`/store/${storeId}`);
    } else {
      navigate('/stores');
    }
  };

  // Enhanced booking handler for service
  const handleBookService = async () => {
    try {
      setBookingLoading(true);
      
      // Check authentication using authService
      if (!authService.isAuthenticated()) {
        // Redirect to login with service booking redirect
        const redirectUrl = `/booking/service/${actualServiceId}`;
        navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }
  
      // Optional: Also verify the user is actually valid
      try {
        const userResponse = await authService.getCurrentUser();
        if (!userResponse.success) {
          // Token exists but is invalid/expired
          const redirectUrl = `/booking/service/${actualServiceId}`;
          navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
          return;
        }
      } catch (error) {
        console.warn('User verification failed:', error);
        // Still proceed if this fails - the backend will handle auth
      }
  
      // Check if service is bookable
      if (!serviceData.booking_enabled) {
        setError('Booking is not enabled for this service.');
        return;
      }
  
      // For dynamic services, show information
      if (serviceData.type === 'dynamic') {
        const message = serviceData.consultation_required 
          ? 'This service requires a consultation to determine your specific needs and pricing. Would you like to book a consultation?'
          : 'This is a dynamic pricing service. The exact price will be determined based on your specific requirements. Would you like to proceed?';
          
        const confirmDynamic = window.confirm(message);
        
        if (!confirmDynamic) {
          setBookingLoading(false);
          return;
        }
      }

      // Show booking confirmation info
      if (!serviceData.auto_confirm_bookings) {
        const confirmManual = window.confirm(
          'This service requires manual confirmation from the provider. Your booking will be reviewed and you\'ll receive confirmation within 24 hours. Continue?'
        );
        
        if (!confirmManual) {
          setBookingLoading(false);
          return;
        }
      }
  
      // Navigate to the enhanced booking page for services
      navigate(`/booking/service/${actualServiceId}`, {
        state: {
          serviceData: serviceData,
          storeData: storeData,
          bookingType: 'service'
        }
      });
      
    } catch (error) {
      console.error('Service booking error:', error);
      setError('Failed to start booking process. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this service: ${serviceData?.name}`;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Get all service images
  const getAllImages = () => {
    if (serviceData.images && Array.isArray(serviceData.images) && serviceData.images.length > 0) {
      return serviceData.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    }
    if (serviceData.image_url && serviceData.image_url.trim() !== '') {
      return [serviceData.image_url];
    }
    return [];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading service details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error && !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={goBack}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {storeId ? 'Back to Store' : 'Back to Stores'}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">No service data available</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = getAllImages();
  const hasMultipleImages = images.length > 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/stores" className="hover:text-gray-900 transition-colors">
            All Stores
          </Link>
          <ChevronRight className="w-4 h-4" />
          
          {storeData && (
            <>
              <button onClick={goBack} className="hover:text-gray-900 transition-colors">
                {storeData.name}
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Services</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-gray-900 font-medium">{serviceData.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {storeId ? 'Back to Store' : 'Back to Stores'}
        </button>

        {/* Error Alert */}
        {error && serviceData && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details - Left Column */}
          <div className="lg:col-span-2">
            {/* Service Header */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              {/* Service Image */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={serviceData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.fallback-bg').style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Fallback gradient background */}
                <div className={`fallback-bg absolute inset-0 flex items-center justify-center ${images.length > 0 ? 'hidden' : 'flex'}`}>
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <div className="text-2xl font-bold opacity-90">{serviceData.name}</div>
                  </div>
                </div>

                {/* Service Type Badge */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    serviceData.type === 'fixed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {serviceData.type === 'fixed' ? 'Fixed Price' : 'Dynamic Price'}
                  </span>
                  {serviceData.featured && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {/* <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button> */}
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Image navigation for multiple images */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700 rotate-180" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white text-sm px-3 py-1 rounded-full">
                      {selectedImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {hasMultipleImages && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {images.map((image, index) => (
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
              )}

              {/* Service Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {serviceData.name}
                    </h1>
                    
                    {/* Store Info */}
                    {storeData && (
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={storeData.logo || storeData.logo_url}
                          alt={storeData.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/32/32';
                          }}
                        />
                        <button 
                          onClick={goBack}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {storeData.name}
                        </button>
                        {storeData.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">{storeData.rating}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Service Category and Meta */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      {serviceData.category && (
                        <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                          {serviceData.category}
                        </span>
                      )}
                      
                      {/* Auto-confirm badge */}
                      {serviceData.auto_confirm_bookings && (
                        <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Instant Confirm
                        </span>
                      )}

                      {/* Prepayment badge */}
                      {serviceData.require_prepayment && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium flex items-center">
                          <CreditCard className="w-3 h-3 mr-1" />
                          Prepay Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="text-right">
                    {serviceData.type === 'fixed' && serviceData.price ? (
                      <>
                        <div className="text-3xl font-bold text-green-600">
                          KES {serviceData.price.toLocaleString()}
                        </div>
                        {serviceData.duration && (
                          <div className="text-sm text-gray-500">
                            {serviceData.duration} minutes
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          Custom Quote
                        </div>
                        <div className="text-sm text-gray-500">
                          {serviceData.price_range || 'Price varies by requirements'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Service Information */}
                {serviceData.type === 'dynamic' && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center text-blue-800">
                      <Info className="w-5 h-5 mr-2" />
                      Dynamic Pricing Service
                    </h4>
                    <p className="text-blue-700 text-sm mb-2">
                      This service offers flexible pricing based on your specific needs and requirements. 
                      The final price will be determined after consultation with our service provider.
                    </p>
                    {serviceData.consultation_required && (
                      <p className="text-blue-700 text-sm">
                        <strong>Consultation Required:</strong> Book a free consultation to discuss your needs and get a custom quote.
                      </p>
                    )}
                    {serviceData.pricing_factors && serviceData.pricing_factors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-blue-800 text-sm font-medium mb-2">Pricing factors include:</p>
                        <div className="flex flex-wrap gap-1">
                          {serviceData.pricing_factors.map((factor, index) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}



                {/* Service Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Service</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {serviceData.description || 'No description available for this service.'}
                  </p>
                </div>

                {/* Service Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {serviceData.type === 'fixed' ? (
                    <>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-900">Fixed Price</div>
                        <div className="text-xs text-gray-600">KES {serviceData.price?.toLocaleString()}</div>
                      </div>
                      {serviceData.duration && (
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-900">Duration</div>
                          <div className="text-xs text-gray-600">{serviceData.duration} mins</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Tag className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Flexible</div>
                      <div className="text-xs text-gray-600">Custom pricing</div>
                    </div>
                  )}
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Bookable</div>
                    <div className="text-xs text-gray-600">Online booking</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Professional</div>
                    <div className="text-xs text-gray-600">Verified service</div>
                  </div>

                  {serviceData.auto_confirm_bookings && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Instant</div>
                      <div className="text-xs text-gray-600">Auto-confirm</div>
                    </div>
                  )}
                </div>

                {/* Store Location */}
                {storeData?.location && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Service Location</h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{storeData.location}</span>
                    </div>
                    {storeData.phone_number && (
                      <div className="flex items-center gap-2 text-gray-600 mt-2">
                        <Phone className="w-4 h-4" />
                        <span>{storeData.phone_number}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Service Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Service Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What's Included</h4>
                  <ul className="text-gray-700 space-y-1">
                    {serviceData.features ? serviceData.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    )) : (
                      <>
                        <li>• Professional service delivery</li>
                        <li>• Quality assurance guarantee</li>
                        <li>• Customer support</li>
                        {serviceData.auto_confirm_bookings && <li>• Instant booking confirmation</li>}
                        {serviceData.allow_early_checkin && <li>• Early check-in available</li>}
                        {serviceData.type === 'fixed' && <li>• Transparent fixed pricing</li>}
                        {serviceData.type === 'dynamic' && <li>• Personalized service and pricing</li>}
                      </>
                    )}
                  </ul>
                </div>

                {serviceData.requirements && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <p className="text-gray-700">{serviceData.requirements}</p>
                  </div>
                )}

                {serviceData.cancellation_policy && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h4>
                    <p className="text-gray-700">{serviceData.cancellation_policy}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Widget - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Book This Service</h3>

              <div className="space-y-4 mb-6">
                {/* Service Type Info */}
                <div className={`p-4 rounded-lg border ${
                  serviceData.type === 'fixed' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Service Type</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      serviceData.type === 'fixed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {serviceData.type === 'fixed' ? 'Fixed Price' : 'Dynamic'}
                    </span>
                  </div>
                  
                  {serviceData.type === 'fixed' ? (
                    <div>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        KES {serviceData.price?.toLocaleString()}
                      </div>
                      {serviceData.duration && (
                        <div className="text-sm text-gray-600">
                          Duration: {serviceData.duration} minutes
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg font-bold text-blue-600 mb-1">
                        {serviceData.price_range || 'Custom Quote Required'}
                      </div>
                      <div className="text-sm text-blue-700">
                        {serviceData.consultation_required 
                          ? 'Consultation required for pricing'
                          : 'Price determined after consultation'
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Booking Information</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {serviceData.auto_confirm_bookings ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Bell className="w-4 h-4 text-yellow-500" />
                      )}
                      <span>
                        {serviceData.auto_confirm_bookings 
                          ? 'Instant booking confirmation'
                          : 'Manual booking review (within 24h)'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>
                        Cancellation allowed {serviceData.min_cancellation_hours || 2}h before
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Professional service guarantee</span>
                    </div>
                    {serviceData.type === 'fixed' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Fixed price - no hidden costs</span>
                      </div>
                    )}
                    {serviceData.allow_early_checkin && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-500" />
                        <span>Early check-in up to {serviceData.early_checkin_minutes || 15} minutes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                {serviceData.require_prepayment && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-blue-900 text-sm">Prepayment Required</div>
                        <div className="text-blue-700 text-xs mt-1">
                          Payment is required to secure your booking
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookService}
                disabled={bookingLoading || !serviceData.booking_enabled}
                className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 mb-4 flex items-center justify-center space-x-2 ${
                  serviceData.booking_enabled && !bookingLoading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : serviceData.booking_enabled ? (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>
                      {serviceData.type === 'dynamic' 
                        ? (serviceData.consultation_required ? 'BOOK CONSULTATION' : 'GET CUSTOM QUOTE')
                        : 'BOOK SERVICE'
                      }
                    </span>
                  </>
                ) : (
                  <span>BOOKING UNAVAILABLE</span>
                )}
              </button>

              {/* User Authentication Info */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Ready to book?</strong> You'll need to sign in or create an account to complete your booking.
                </p>
              </div>

              {/* Contact Store */}
              {storeData && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Need help with booking?</p>
                  <button
                    onClick={goBack}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Contact {storeData.name} →
                  </button>
                  {storeData.phone_number && (
                    <div className="mt-2">
                      <a
                        href={`tel:${storeData.phone_number}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        {storeData.phone_number}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Store Quick Info */}
            {storeData && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">About the Store</h4>
                
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={storeData.logo || storeData.logo_url}
                    alt={storeData.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/48/48';
                    }}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{storeData.name}</div>
                    {storeData.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{storeData.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {storeData.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {storeData.description}
                  </p>
                )}

                <button
                  onClick={goBack}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Store Profile →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetailPage;