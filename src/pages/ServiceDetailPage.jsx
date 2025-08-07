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
  Share2
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StoreService from '../services/storeService';
import serviceAPI from '../services/serviceService';

const ServiceDetailPage = () => {
  const { storeId, serviceId } = useParams();
  const navigate = useNavigate();

  // State management
  const [storeData, setStoreData] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeLoading, setStoreLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: ''
  });
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch store data
  const fetchStoreData = async () => {
    try {
      setStoreLoading(true);
      const data = await StoreService.getStoreById(storeId);
      setStoreData(data.store);
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('Store not found');
    } finally {
      setStoreLoading(false);
    }
  };

  // Fetch service data
  const fetchServiceData = async () => {
    try {
      setServiceLoading(true);
      const data = await serviceAPI.getServiceById(serviceId);
      setServiceData(data.service || data);
    } catch (err) {
      console.error('Error fetching service:', err);
      setError('Service not found');
    } finally {
      setServiceLoading(false);
    }
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!bookingData.date || !bookingData.time) {
      alert('Please select both date and time for your booking.');
      return;
    }

    try {
      setBooking(true);
      const response = await serviceAPI.bookService(serviceId, {
        storeId: parseInt(storeId),
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes
      });

      setBookingSuccess(true);
      setBookingData({ date: '', time: '', notes: '' });
      
      // Show success message for 3 seconds then reset
      setTimeout(() => {
        setBookingSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to book service. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    // Check if we have both storeId and serviceId (nested route)
    if (storeId && serviceId) {
      fetchStoreData();
      fetchServiceData();
    } 
    // Handle legacy route /service/:id (serviceId would be in the :id param)
    else if (serviceId && !storeId) {
      fetchServiceData();
    }
  }, [storeId, serviceId]);

  useEffect(() => {
    setLoading(storeLoading || serviceLoading);
  }, [storeLoading, serviceLoading]);

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
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(storeId ? `/store/${storeId}` : '/stores')}
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
          
          {storeData ? (
            <>
              <Link 
                to={`/store/${storeId}`} 
                className="hover:text-gray-900 transition-colors"
              >
                {storeData.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Services</span>
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Services</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-gray-900 font-medium">{serviceData.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(storeId ? `/store/${storeId}` : '/stores')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {storeId ? 'Back to Store' : 'Back to Stores'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details - Left Column */}
          <div className="lg:col-span-2">
            {/* Service Header */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              {/* Service Image */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                {serviceData.image_url ? (
                  <img
                    src={serviceData.image_url}
                    alt={serviceData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Fallback gradient background */}
                <div className={`absolute inset-0 flex items-center justify-center ${serviceData.image_url ? 'hidden' : 'flex'}`}>
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <div className="text-2xl font-bold opacity-90">{serviceData.name}</div>
                  </div>
                </div>

                {/* Service Type Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    serviceData.type === 'fixed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {serviceData.type === 'fixed' ? 'Fixed Price' : 'Dynamic Price'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {serviceData.name}
                    </h1>
                    
                    {/* Store Info (if available) */}
                    {storeData && (
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={storeData.logo || storeData.logo_url}
                          alt={storeData.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/images/store-placeholder.png';
                          }}
                        />
                        <Link 
                          to={`/store/${storeId}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {storeData.name}
                        </Link>
                        {storeData.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">{storeData.rating}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Service Category */}
                    {serviceData.category && (
                      <div className="mb-4">
                        <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                          {serviceData.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price Display */}
                  {serviceData.type === 'fixed' && serviceData.price && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        KES {serviceData.price}
                      </div>
                      {serviceData.duration && (
                        <div className="text-sm text-gray-500">
                          {serviceData.duration} minutes
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Service Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Service</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {serviceData.description || 'No description available for this service.'}
                  </p>
                </div>

                {/* Service Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {serviceData.type === 'fixed' && (
                    <>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-900">Fixed Price</div>
                        <div className="text-xs text-gray-600">KES {serviceData.price}</div>
                      </div>
                      {serviceData.duration && (
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-900">Duration</div>
                          <div className="text-xs text-gray-600">{serviceData.duration} mins</div>
                        </div>
                      )}
                    </>
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
                </div>

                {/* Store Location (if available) */}
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
                    <li>• Professional service delivery</li>
                    <li>• Quality assurance guarantee</li>
                    <li>• Customer support</li>
                    {serviceData.features && serviceData.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
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

          {/* Booking Form - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Book This Service</h3>

              {bookingSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Booking Confirmed!</h4>
                  <p className="text-gray-600 mb-4">
                    Your service booking has been submitted successfully.
                  </p>
                  <button
                    onClick={() => navigate(storeId ? `/store/${storeId}` : '/stores')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Back to Store
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleBooking(); }} className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Date *
                    </label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      min={getMinDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Time *
                    </label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Choose a time</option>
                      {generateTimeSlots().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any special requests or notes..."
                    />
                  </div>

                  {/* Price Summary */}
                  {serviceData.type === 'fixed' && serviceData.price && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Total Price:</span>
                        <span className="text-xl font-bold text-green-600">
                          KES {serviceData.price}
                        </span>
                      </div>
                      {serviceData.duration && (
                        <div className="text-sm text-gray-600 mt-1">
                          Duration: {serviceData.duration} minutes
                        </div>
                      )}
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    type="submit"
                    disabled={booking || !bookingData.date || !bookingData.time}
                    className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {booking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        Book Service
                      </>
                    )}
                  </button>

                  {/* Contact Store */}
                  {storeData && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Need help with booking?</p>
                      <Link
                        to={`/store/${storeId}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Contact {storeData.name} →
                      </Link>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Store Quick Info (if available) */}
            {storeData && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">About the Store</h4>
                
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={storeData.logo || storeData.logo_url}
                    alt={storeData.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      e.target.src = '/images/store-placeholder.png';
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
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {storeData.description}
                  </p>
                )}

                <Link
                  to={`/store/${storeId}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Store Profile →
                </Link>
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