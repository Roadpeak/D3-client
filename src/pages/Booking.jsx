import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, User, CreditCard, Smartphone, Check, 
  ChevronRight, AlertCircle, Star, X, Loader2, CheckCircle, 
  Users, UserCheck, Info, RefreshCw, Zap 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import bookingService from '../services/bookingService';
import { offerAPI } from '../services/offerService';
import authService from '../services/authService';

// Enhanced Booking Page with Concurrent Booking Support
const EnhancedBookingPage = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [offerDetails, setOfferDetails] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [detailedSlots, setDetailedSlots] = useState([]);
  const [bookingRules, setBookingRules] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [stores, setStores] = useState([]);
  const [staff, setStaff] = useState([]);
  const [user, setUser] = useState(null);

  // Form states
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    store: null,
    staff: null,
    notes: ''
  });

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);

  const platformFee = 5.99;

  const steps = [
    { id: 1, title: "Date & Time", icon: Calendar, completed: currentStep > 1 },
    { id: 2, title: "Location & Staff", icon: MapPin, completed: currentStep > 2 },
    { id: 3, title: "Review & Pay", icon: CreditCard, completed: currentStep > 3 },
    { id: 4, title: "Confirmation", icon: CheckCircle, completed: false }
  ];

  // ==================== INITIALIZATION ====================

  const initializeBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!offerId || offerId.trim() === '') {
        throw new Error('Invalid booking request. Offer ID is missing.');
      }

      console.log('🎯 Initializing enhanced booking for offer ID:', offerId);

      // Get current user using existing authService
      try {
        const userResponse = await authService.getCurrentUser();
        if (!userResponse || !userResponse.success) {
          console.warn('User not authenticated, redirecting to login');
          navigate('/login?redirect=/booking/' + offerId);
          return;
        }
        setUser(userResponse.data?.user || userResponse.user);
        console.log('✅ User authenticated:', userResponse.data?.user?.firstName || userResponse.user?.firstName);
      } catch (userError) {
        console.warn('Auth error, redirecting to login:', userError);
        navigate('/login?redirect=/booking/' + offerId);
        return;
      }

      // Get offer details using existing offerAPI
      let offer = null;
      try {
        console.log('📄 Fetching offer details...');
        const offerResponse = await offerAPI.getOfferById(offerId);
        
        // Handle different response structures from your API
        if (offerResponse && offerResponse.success && offerResponse.offer) {
          offer = offerResponse.offer;
        } else if (offerResponse && offerResponse.data) {
          offer = offerResponse.data;
        } else if (offerResponse) {
          offer = offerResponse;
        }
        
        console.log('✅ Offer loaded:', offer?.title);
      } catch (offerError) {
        console.error('❌ Failed to load offer:', offerError);
        throw new Error('Offer not found or may have expired');
      }

      if (!offer) {
        throw new Error('Offer not found or invalid response format');
      }

      setOfferDetails(offer);

      // Get stores for this offer using existing bookingService
      try {
        console.log('🏪 Fetching stores for offer...');
        const storesResponse = await bookingService.getStoresForOffer(offerId);
        
        if (storesResponse && storesResponse.stores) {
          setStores(storesResponse.stores);
          console.log('✅ Stores loaded:', storesResponse.stores.length);
        } else {
          console.warn('⚠️ No stores found, using offer store');
          if (offer.service && offer.service.store) {
            setStores([offer.service.store]);
          } else {
            setStores([]);
          }
        }
      } catch (storesError) {
        console.warn('⚠️ Error fetching stores:', storesError);
        setStores([]);
      }

      console.log('🎉 Enhanced booking initialization completed successfully');

    } catch (err) {
      console.error('💥 Error initializing enhanced booking:', err);

      let errorMessage = 'Failed to load booking information';

      if (err.message.includes('Offer not found')) {
        errorMessage = 'This offer is no longer available. It may have expired or been removed.';
      } else if (err.message.includes('missing')) {
        errorMessage = 'Invalid booking link. Please select an offer from our listings.';
      } else if (err.status === 401 || err.message.includes('auth')) {
        errorMessage = 'Please log in to continue with your booking.';
        navigate('/login?redirect=/booking/' + offerId);
        return;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==================== SLOT MANAGEMENT ====================

  const fetchAvailableSlots = async (forceRefresh = false) => {
    if (!bookingData.date || !offerId) return;

    try {
      if (forceRefresh) {
        setRefreshing(true);
      }

      console.log('⏰ Fetching enhanced available slots for:', offerId, bookingData.date);
      const response = await bookingService.getAvailableSlots(offerId, bookingData.date);
      
      if (response && response.success) {
        setAvailableSlots(response.availableSlots || []);
        setDetailedSlots(response.detailedSlots || []);
        setBookingRules(response.bookingRules || null);
        setStoreInfo(response.storeInfo || null);
        
        console.log('✅ Enhanced slots loaded:', response.availableSlots?.length || 0);
        console.log('📊 Booking rules:', response.bookingRules);
        console.log('🏪 Store info:', response.storeInfo);
        
        if (response.debug) {
          console.log('🔍 Debug info:', response.debug);
        }
      } else {
        setAvailableSlots([]);
        setDetailedSlots([]);
        console.warn('⚠️ No available slots returned');
      }
    } catch (err) {
      console.error('❌ Error fetching enhanced available slots:', err);
      setAvailableSlots([]);
      setDetailedSlots([]);
      setError('Failed to load available time slots. Please try again.');
    } finally {
      if (forceRefresh) {
        setRefreshing(false);
      }
    }
  };

  const getSlotDetails = (selectedTime) => {
    return detailedSlots.find(slot => 
      slot.time === selectedTime || slot.startTime === selectedTime
    );
  };

  const refreshSlots = () => {
    fetchAvailableSlots(true);
  };

  // ==================== STAFF MANAGEMENT ====================

  const fetchStaffForStore = async () => {
    if (!bookingData.store?.id) return;

    try {
      console.log('👥 Fetching staff for store:', bookingData.store.id);
      const response = await bookingService.getStaffForStore(bookingData.store.id);
      
      if (response && response.staff) {
        setStaff(response.staff);
        console.log('✅ Staff loaded:', response.staff.length);
      } else {
        setStaff([]);
        console.log('ℹ️ No staff members found for this store');
      }
    } catch (err) {
      console.error('❌ Error fetching staff:', err);
      setStaff([]);
    }
  };

  // ==================== EVENT HANDLERS ====================

  const handleDateTimeNext = () => {
    if (bookingData.date && bookingData.time) {
      setCurrentStep(2);
    }
  };

  const handleLocationNext = () => {
    if (bookingData.store) {
      setCurrentStep(3);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const selectedSlot = getSlotDetails(bookingData.time);
      
      const bookingPayload = {
        offerId: offerId,
        userId: user.id,
        startTime: `${bookingData.date}T${convertTo24Hour(bookingData.time)}`,
        storeId: bookingData.store.id,
        staffId: bookingData.staff?.id,
        notes: bookingData.notes,
        paymentData: {
          amount: platformFee,
          currency: 'KES',
          method: paymentMethod,
          phoneNumber: phoneNumber
        },
        clientInfo: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || phoneNumber
        }
      };

      console.log('📝 Creating enhanced booking with payload:', bookingPayload);
      const result = await bookingService.createBooking(bookingPayload);

      if (result.success) {
        setCurrentStep(4);
        setPaymentStatus('success');
        console.log('🎉 Enhanced booking created successfully');
        
        if (result.availability) {
          console.log(`📊 Slots remaining: ${result.availability.remainingSlots}/${result.availability.totalSlots}`);
        }
      }

    } catch (err) {
      console.error('❌ Error creating enhanced booking:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMpesaPayment = async () => {
    try {
      if (!phoneNumber || phoneNumber.length < 10) {
        setError('Please enter a valid phone number');
        return;
      }

      setSubmitting(true);
      setError(null);
      
      const result = await bookingService.processMpesaPayment(
        phoneNumber,
        platformFee,
        'temp-booking-id'
      );

      if (result.success) {
        setShowPaymentModal(false);
        await handleBookingSubmit();
      }

    } catch (err) {
      console.error('❌ M-Pesa payment error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    const timer = setTimeout(() => {
      if (offerId && offerId.trim() !== '' && offerId !== 'undefined') {
        initializeBooking();
      } else {
        setError('Invalid booking request. Please select a valid offer.');
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [offerId]);

  useEffect(() => {
    if (bookingData.date && offerId) {
      fetchAvailableSlots();
    }
  }, [bookingData.date, offerId]);

  useEffect(() => {
    if (bookingData.store) {
      fetchStaffForStore();
    }
  }, [bookingData.store]);

  useEffect(() => {
    if (error && (error.includes('no longer available') || error.includes('expired'))) {
      const timer = setTimeout(() => {
        navigate('/offers');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  // ==================== STEP COMPONENTS ====================

  const StepTracker = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step.completed ? 'bg-green-500 text-white' :
                currentStep === step.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step.completed ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
              </div>
              <span className={`mt-2 text-sm font-medium ${
                currentStep === step.id ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const DateTimeStep = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date & Time</h2>

      {bookingRules && bookingRules.maxConcurrentBookings > 1 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold text-blue-800">Multiple Bookings Available</span>
          </div>
          <p className="text-sm text-blue-700">
            Up to {bookingRules.maxConcurrentBookings} customers can book the same time slot. 
            Each slot shows remaining availability.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Date
          </label>
          <input
            type="date"
            value={bookingData.date}
            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value, time: '' })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {storeInfo && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700">{storeInfo.name}</p>
              <p className="text-xs text-gray-500">
                Open: {storeInfo.openingTime} - {storeInfo.closingTime}
              </p>
              {storeInfo.workingDays && (
                <p className="text-xs text-gray-500">
                  Working days: {storeInfo.workingDays.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Available Time Slots
            </label>
            {availableSlots.length > 0 && (
              <button
                onClick={refreshSlots}
                disabled={refreshing}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>

          {!bookingData.date ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Please select a date first</p>
              </div>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No available slots for this date</p>
                <p className="text-sm text-gray-400">Please try a different date</p>
                {bookingData.date && (
                  <button
                    onClick={refreshSlots}
                    disabled={refreshing}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {refreshing ? 'Checking...' : 'Check again'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {detailedSlots.length > 0 ? (
                  detailedSlots.map((slot) => {
                    const isSelected = bookingData.time === slot.time;
                    const availabilityColor = slot.available === slot.total ? 'text-green-600' : 
                                            slot.available > slot.total / 2 ? 'text-yellow-600' : 'text-orange-600';
                    
                    return (
                      <button
                        key={slot.time}
                        onClick={() => setBookingData({ ...bookingData, time: slot.time })}
                        className={`p-3 rounded-lg border text-sm font-medium transition duration-200 ${
                          isSelected
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{slot.time}</span>
                          <div className="flex items-center space-x-2">
                            {slot.total > 1 && (
                              <>
                                <Users className={`w-4 h-4 ${isSelected ? 'text-white' : availabilityColor}`} />
                                <span className={`text-xs ${isSelected ? 'text-white' : availabilityColor}`}>
                                  {slot.available}/{slot.total}
                                </span>
                              </>
                            )}
                            {slot.available === 1 && slot.total === 1 && (
                              <UserCheck className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-green-600'}`} />
                            )}
                          </div>
                        </div>
                        {slot.total > 1 && !isSelected && (
                          <div className="mt-1 text-xs text-gray-500">
                            {slot.available === slot.total ? 'All slots available' :
                             slot.available === 1 ? 'Last slot available' :
                             `${slot.available} slots available`}
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setBookingData({ ...bookingData, time })}
                      className={`p-3 rounded-lg border text-sm font-medium transition duration-200 ${
                        bookingData.time === time
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))
                )}
              </div>

              {bookingData.time && (() => {
                const selectedSlot = getSlotDetails(bookingData.time);
                return selectedSlot && selectedSlot.total > 1 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Selected: {selectedSlot.time}
                        </p>
                        <p className="text-xs text-green-600">
                          {selectedSlot.available - 1} more slots available after your booking
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          {selectedSlot.available}/{selectedSlot.total}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleDateTimeNext}
          disabled={!bookingData.date || !bookingData.time}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const LocationStep = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Location & Staff</h2>

      {bookingData.time && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              Selected time: <strong>{bookingData.time}</strong> on {bookingData.date}
            </span>
            {(() => {
              const slotDetails = getSlotDetails(bookingData.time);
              return slotDetails && slotDetails.total > 1 && (
                <span className="ml-2 text-xs text-blue-600">
                  ({slotDetails.available}/{slotDetails.total} slots available)
                </span>
              );
            })()}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Store Location</h3>
        {stores.length === 0 ? (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No store locations available</p>
            <button 
              onClick={() => setError('No stores available for this offer. Please contact support.')}
              className="text-blue-600 hover:text-blue-800 text-sm mt-2"
            >
              Report Issue
            </button>
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              onClick={() => setBookingData({ ...bookingData, store, staff: null })}
              className={`p-4 rounded-lg border-2 cursor-pointer transition duration-200 mb-4 ${
                bookingData.store?.id === store.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{store.name}</h4>
                  <p className="text-gray-600 mt-1">{store.location || store.address}</p>
                </div>
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>

      {bookingData.store && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Select Staff Member (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.length > 0 ? staff.map((member) => (
              <div
                key={member.id}
                onClick={() => setBookingData({ ...bookingData, staff: member })}
                className={`p-4 rounded-lg border-2 cursor-pointer transition duration-200 ${
                  bookingData.staff?.id === member.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                    <p className="text-gray-600 text-sm">{member.role || member.specialization}</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 col-span-2 text-center py-8">
                No staff members available. You can proceed without selecting staff.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={bookingData.notes}
          onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any special requests or notes..."
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400 transition duration-200"
        >
          Back
        </button>
        <button
          onClick={handleLocationNext}
          disabled={!bookingData.store}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Booking</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-gray-600">{bookingData.date} at {bookingData.time}</p>
                {(() => {
                  const slotDetails = getSlotDetails(bookingData.time);
                  return slotDetails && slotDetails.total > 1 && (
                    <p className="text-sm text-blue-600">
                      Multiple booking slot ({slotDetails.available}/{slotDetails.total} available)
                    </p>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-gray-600">{bookingData.store?.name}</p>
                <p className="text-sm text-gray-500">{bookingData.store?.location || bookingData.store?.address}</p>
              </div>
            </div>

            {bookingData.staff && (
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Staff Member</p>
                  <p className="text-gray-600">{bookingData.staff.name}</p>
                  <p className="text-sm text-gray-500">{bookingData.staff.role || bookingData.staff.specialization}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex space-x-4">
              <img
                src={offerDetails?.images?.[0] || offerDetails?.image || "/api/placeholder/80/80"}
                alt={offerDetails?.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{offerDetails?.title}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{offerDetails?.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-lg font-bold text-green-600">
                    {offerDetails?.offerPrice || offerDetails?.discounted_price || 'N/A'}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {offerDetails?.originalPrice || offerDetails?.original_price || ''}
                  </span>
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                    {offerDetails?.discount}% OFF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Payment</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition duration-200 ${
              paymentMethod === 'mpesa' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
            }`}
            onClick={() => setPaymentMethod('mpesa')}
          >
            <div className="flex items-center space-x-3">
              <Smartphone className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-medium">M-Pesa</h4>
                <p className="text-sm text-gray-600">Pay with mobile money</p>
              </div>
              {paymentMethod === 'mpesa' && <Check className="w-5 h-5 text-green-600" />}
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 cursor-not-allowed">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-500">Card Payment</h4>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Access Fee</span>
              <span>KES {platformFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> This fee secures your booking and grants access to the exclusive offer.
                  You'll pay the discounted service price of <strong>{offerDetails?.offerPrice || offerDetails?.discounted_price}</strong>
                  when you arrive for your appointment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400 transition duration-200"
        >
          Back
        </button>
        <button
          onClick={() => setShowPaymentModal(true)}
          disabled={submitting}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center space-x-2"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Pay KES {platformFee.toFixed(2)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const ConfirmationStep = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your booking has been successfully created and payment processed.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Check your email for booking confirmation</li>
            <li>• Arrive 10 minutes before your appointment</li>
            <li>• Pay the discounted rate at the store: {offerDetails?.offerPrice || offerDetails?.discounted_price}</li>
            <li>• Bring a valid ID for verification</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/bookings')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate('/offers')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
          >
            Browse More Offers
          </button>
        </div>
      </div>
    </div>
  );

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
          <button
            onClick={() => setShowPaymentModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Amount to Pay</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">KES {platformFee.toFixed(2)}</p>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your M-Pesa phone number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. 0712345678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowPaymentModal(false)}
            disabled={submitting}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleMpesaPayment}
            disabled={phoneNumber.length < 10 || submitting}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Pay Now</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <DateTimeStep />;
      case 2:
        return <LocationStep />;
      case 3:
        return <ReviewStep />;
      case 4:
        return <ConfirmationStep />;
      default:
        return <DateTimeStep />;
    }
  };

  // ==================== MAIN RENDER ====================

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading booking information...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state (for initialization errors)
  if (error && !offerDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Booking</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            
            <div className="space-y-2">
              <button
                onClick={() => {
                  setError(null);
                  initializeBooking();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Try Again
              </button>
              
              {error.includes('no longer available') || error.includes('expired') ? (
                <button
                  onClick={() => navigate('/offers')}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition duration-200"
                >
                  Browse Other Offers
                </button>
              ) : null}
              
              {error.includes('log in') && (
                <button
                  onClick={() => navigate('/login?redirect=' + encodeURIComponent('/booking/' + offerId))}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Go to Login
                </button>
              )}
            </div>
            
            {error.includes('expired') && (
              <p className="text-sm text-gray-500 mt-4">
                Redirecting to offers page in 5 seconds...
              </p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Offer</h1>
          <p className="text-gray-600">Secure your exclusive access to this amazing deal</p>
          
          {offerDetails && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-4">
                <img
                  src={offerDetails?.images?.[0] || offerDetails?.image || "/api/placeholder/60/60"}
                  alt={offerDetails?.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{offerDetails?.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {offerDetails?.service?.name || 'Service booking'}
                  </p>
                  {bookingRules && (
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Duration: {bookingRules.serviceDuration}min</span>
                      {bookingRules.maxConcurrentBookings > 1 && (
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          Up to {bookingRules.maxConcurrentBookings} per slot
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <StepTracker />

        {error && offerDetails && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {renderCurrentStep()}
      </div>

      {showPaymentModal && <PaymentModal />}

      <Footer />
    </div>
  );
};

export default EnhancedBookingPage;