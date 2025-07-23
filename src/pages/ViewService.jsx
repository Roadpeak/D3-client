import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Star,
  Users,
  Loader2,
  Camera,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  Navigation,
  Mail
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ViewService = () => {
  // Get service ID from URL (in real app, use useParams())
  const getServiceId = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1];
  };

  const [service, setService] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Mock navigation function (in real app, use useNavigate())
  const navigate = (path) => {
    console.log('Navigate to:', path);
    window.history.pushState({}, '', path);
  };

  useEffect(() => {
    fetchService();
  }, []);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const serviceId = getServiceId();
      console.log('🔍 Fetching service:', serviceId);

      // Try multiple endpoints for getting service
      let serviceData = null;
      let storeData = null;

      try {
        // Try individual service endpoint
        const response = await fetch(`http://localhost:4000/api/v1/services/${serviceId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          serviceData = data.service || data;
          console.log('✅ Service data fetched:', serviceData);
        } else {
          throw new Error(`Service API returned ${response.status}`);
        }
      } catch (apiError) {
        console.warn('⚠️ Individual service API failed:', apiError);
        
        // Fallback: try to get from services list
        try {
          const response = await fetch('http://localhost:4000/api/v1/services', {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            const services = data.services || data || [];
            serviceData = services.find(s => s.id === serviceId || s.id === parseInt(serviceId));
            
            if (!serviceData) {
              throw new Error('Service not found in services list');
            }
            console.log('✅ Service found in list:', serviceData);
          }
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          throw new Error('Unable to fetch service data');
        }
      }

      // Fetch store information if we have store_id
      if (serviceData && serviceData.store_id) {
        try {
          const storeResponse = await fetch(`http://localhost:4000/api/v1/stores/${serviceData.store_id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (storeResponse.ok) {
            const storeResponseData = await storeResponse.json();
            storeData = storeResponseData.store || storeResponseData;
            console.log('✅ Store data fetched:', storeData);
          }
        } catch (storeError) {
          console.warn('⚠️ Store data fetch failed:', storeError);
          // Continue without store data
        }
      }

      setService(serviceData);
      setStore(storeData);

    } catch (err) {
      console.error('❌ Error fetching service:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async () => {
    try {
      setBookingLoading(true);
      
      // Check authentication
      const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
      if (!token) {
        // Redirect to login
        navigate('/accounts/sign-in');
        return;
      }

      // Navigate to booking page
      navigate(`/booking/service/${service.id}`);
      
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to start booking process. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactStore = () => {
    if (store) {
      navigate(`/store/${store.id}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.name,
          text: `Check out this service: ${service.name}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Stars component
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating || 0) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading service details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The service you are looking for does not exist.'}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/stores')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Browse Stores
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>
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
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Image */}
            <div className="relative h-96 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl overflow-hidden mb-6">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Fallback gradient background */}
              <div className={`absolute inset-0 flex items-center justify-center ${service.image_url ? 'hidden' : 'flex'}`}>
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <div className="text-2xl font-bold opacity-90">{service.name}</div>
                </div>
              </div>

              {/* Service Type Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  service.type === 'fixed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {service.type === 'fixed' ? 'Fixed Price' : 'Dynamic Price'}
                </span>
              </div>

              {/* Action Buttons Overlay */}
              <div className="absolute top-4 left-4 flex gap-2">
                <button
                  onClick={handleShare}
                  className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                  title="Share service"
                >
                  <Share2 className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                  title="Add to favorites"
                >
                  <Heart className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Service Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                  
                  {/* Service Meta Info */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Category */}
                    {service.category && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                        {service.category}
                      </span>
                    )}
                    
                    {/* Rating (if available) */}
                    {service.rating && (
                      <div className="flex items-center gap-1">
                        <div className="flex">{renderStars(service.rating)}</div>
                        <span className="text-sm text-gray-600">({service.rating})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Duration */}
              {service.type === 'fixed' && (
                <div className="flex items-center gap-6 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-700 font-bold text-2xl">
                    <DollarSign className="w-6 h-6 mr-1" />
                    <span>KES {service.price}</span>
                  </div>
                  {service.duration && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-1" />
                      <span className="font-medium">{service.duration} minutes</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {service.description || 'This is a professional service provided by experienced staff. Contact the store for more details about what\'s included.'}
                </p>
              </div>

              {/* Service Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Professional service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Quality guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Experienced staff</span>
                  </div>
                  {service.type === 'fixed' && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Fixed pricing</span>
                      </div>
                      {service.duration && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{service.duration} minute duration</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Store Information */}
              {store && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Provider</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url}
                          alt={store.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <Users className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{store.name}</h4>
                      {store.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {store.location}
                        </p>
                      )}
                      {store.rating && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex">{renderStars(store.rating)}</div>
                          <span className="text-sm text-gray-600">
                            {store.rating} ({store.totalReviews || 0} reviews)
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={handleContactStore}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Store
                        </button>
                        {store.phone_number && (
                          <button
                            onClick={() => window.open(`tel:${store.phone_number}`)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Call Store
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 sticky top-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Book This Service</h3>
              
              {/* Price Display */}
              {service.type === 'fixed' && service.price && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900">KES {service.price}</div>
                  {service.duration && (
                    <div className="text-sm text-gray-600 mt-1">{service.duration} minutes</div>
                  )}
                </div>
              )}

              {service.type === 'dynamic' && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-lg font-semibold text-blue-900">Custom Quote</div>
                  <div className="text-sm text-blue-700 mt-1">Pricing based on your specific needs</div>
                </div>
              )}

              {/* Main Booking Button */}
              <button 
                className="w-full bg-blue-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleBookService}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Book Service
                  </>
                )}
              </button>

              {/* Additional Actions */}
              <div className="space-y-2">
                {store && (
                  <>
                    <button 
                      className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      onClick={handleContactStore}
                    >
                      <Users className="w-4 h-4" />
                      View Store Profile
                    </button>
                    
                    <button 
                      className="w-full bg-green-100 text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat with Store
                    </button>

                    {store.phone_number && (
                      <button 
                        className="w-full bg-orange-100 text-orange-700 px-6 py-3 rounded-lg font-medium hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
                        onClick={() => window.open(`tel:${store.phone_number}`)}
                      >
                        <Phone className="w-4 h-4" />
                        Call Store
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Store Quick Info */}
            {store && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
                <div className="space-y-3 text-sm">
                  {store.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{store.location}</span>
                    </div>
                  )}
                  {store.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{store.phone_number}</span>
                    </div>
                  )}
                  {store.primary_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{store.primary_email}</span>
                    </div>
                  )}
                  {store.opening_time && store.closing_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {store.opening_time} - {store.closing_time}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Professional Service</div>
                    <div className="text-sm text-gray-600">Experienced and trained staff</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Quality Guarantee</div>
                    <div className="text-sm text-gray-600">Satisfaction guaranteed</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Easy Booking</div>
                    <div className="text-sm text-gray-600">Simple and secure process</div>
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

export default ViewService;