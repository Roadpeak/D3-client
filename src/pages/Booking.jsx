import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, MapPin, User, CreditCard, Smartphone, Check, 
  ChevronRight, AlertCircle, X, Loader2, CheckCircle, 
  Users, UserCheck, Info, RefreshCw, Zap, ArrowLeft, Phone,
  AlertTriangle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import bookingService from '../services/enhancedBookingService';
import { offerAPI } from '../services/offerService';
import serviceAPI from '../services/serviceService';
import authService from '../services/authService';

const EnhancedBookingPage = () => {
  const { offerId, serviceId } = useParams();
  const navigate = useNavigate();
  
  // UI States
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data States
  const [entityDetails, setEntityDetails] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [detailedSlots, setDetailedSlots] = useState([]);
  const [bookingRules, setBookingRules] = useState(null);
  const [branchInfo, setBranchInfo] = useState(null);
  const [branch, setBranch] = useState(null);
  const [staff, setStaff] = useState([]);
  const [user, setUser] = useState(null);

  // Entity State Management
  const [entityType, setEntityType] = useState('');
  const [isOfferBooking, setIsOfferBooking] = useState(false);

  // Form States
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    branch: null,
    staff: null,
    notes: ''
  });

  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accessFee, setAccessFee] = useState(0);

  // Derived values
  const entityId = offerId || serviceId;
  const initialEntityType = offerId ? 'offer' : 'service';
  const initialIsOfferBooking = !!offerId;

  const steps = [
    { id: 1, title: "Date & Time", icon: Calendar, completed: currentStep > 1 },
    { id: 2, title: "Location & Staff", icon: MapPin, completed: currentStep > 2 },
    { id: 3, title: "Review & Pay", icon: CreditCard, completed: currentStep > 3 },
    { id: 4, title: "Confirmation", icon: CheckCircle, completed: false }
  ];

  // ==================== UTILITY FUNCTIONS ====================

  const convertTo24Hour = useCallback((time12h) => {
    if (!time12h) {
      console.error('convertTo24Hour: time is empty:', time12h);
      return '09:00'; // Default fallback
    }
  
    const timeStr = time12h.toString().trim();
    console.log('convertTo24Hour input:', timeStr);
  
    // If it's already in 24-hour format (no AM/PM), return as-is
    if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
      // Ensure it's properly formatted
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      return timeStr;
    }
  
    // Handle AM/PM format
    const parts = timeStr.split(' ');
    if (parts.length !== 2) {
      console.error('convertTo24Hour: invalid format:', timeStr);
      return '09:00'; // Fallback
    }
  
    const [timePart, modifier] = parts;
    const [hoursStr, minutesStr] = timePart.split(':');
  
    if (!hoursStr || !minutesStr) {
      console.error('convertTo24Hour: missing hours or minutes:', timeStr);
      return '09:00'; // Fallback
    }
  
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr.padStart(2, '0');
  
    if (modifier.toUpperCase() === 'AM') {
      if (hours === 12) hours = 0;
    } else if (modifier.toUpperCase() === 'PM') {
      if (hours !== 12) hours += 12;
    }
  
    const result = `${hours.toString().padStart(2, '0')}:${minutes}`;
    console.log('convertTo24Hour result:', result);
    return result;
  }, []);
  const formatCurrency = useCallback((amount) => {
    return `KES ${parseFloat(amount).toFixed(2)}`;
  }, []);

  const parseWorkingDaysArray = (workingDays) => {
    if (!workingDays) return [];
    
    if (Array.isArray(workingDays)) {
      return workingDays.filter(day => day && typeof day === 'string');
    }
    
    if (typeof workingDays === 'string') {
      try {
        const parsed = JSON.parse(workingDays);
        if (Array.isArray(parsed)) {
          return parsed.filter(day => day && typeof day === 'string');
        }
      } catch (e) {
        return workingDays.split(',').map(day => day.trim()).filter(day => day);
      }
    }
    
    return [];
  };

  const isWorkingDay = useCallback((date, workingDays) => {
    if (!workingDays || !Array.isArray(workingDays)) {
      return false;
    }

    const targetDate = new Date(date + 'T00:00:00');
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    return workingDays.some(workingDay => 
      workingDay.toString().toLowerCase() === dayName.toLowerCase()
    );
  }, []);

  const getAvailableDates = useCallback(() => {
    if (!branchInfo?.workingDays || !Array.isArray(branchInfo.workingDays)) {
      return [];
    }

    const availableDates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      if (isWorkingDay(dateString, branchInfo.workingDays)) {
        availableDates.push({
          date: dateString,
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          formattedDate: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return availableDates;
  }, [branchInfo, isWorkingDay]);

  // ==================== INITIALIZATION ====================

  const initializeBooking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
  
      if (!entityId || entityId.trim() === '') {
        throw new Error(`Invalid booking request. ${initialEntityType} ID is missing.`);
      }
  
      // Get current user
      const userResponse = await authService.getCurrentUser();
      if (!userResponse || !userResponse.success) {
        navigate(`/login?redirect=${window.location.pathname}`);
        return;
      }
      
      const userData = userResponse.data?.user || userResponse.data;
      setUser(userData);
      setPhoneNumber(userData?.phoneNumber || userData?.phone || '');
  
      // Get entity details based on type
      let entityData;
      if (initialIsOfferBooking) {
        const offerResponse = await offerAPI.getOfferById(entityId);
        entityData = offerResponse.offer || offerResponse.data || offerResponse;
      } else {
        const serviceResponse = await serviceAPI.getServiceById(entityId);
        entityData = serviceResponse.service || serviceResponse.data || serviceResponse;
      }
  
      if (!entityData) {
        throw new Error(`${initialEntityType === 'offer' ? 'Offer' : 'Service'} not found`);
      }
  
      setEntityType(initialEntityType);
      setIsOfferBooking(initialIsOfferBooking);
      setEntityDetails(entityData);
  
      // Load branch information
      try {
        let branchResponse;
        
        if (initialIsOfferBooking) {
          branchResponse = await bookingService.getBranchForOffer(entityId);
        } else {
          branchResponse = await bookingService.getBranchForService(entityId);
        }
        
        if (branchResponse?.branch) {
          setBranch(branchResponse.branch);
          
          setBranchInfo({
            name: branchResponse.branch.name,
            openingTime: branchResponse.branch.openingTime,
            closingTime: branchResponse.branch.closingTime,
            workingDays: branchResponse.branch.workingDays
          });
          
          setBookingData(prev => ({
            ...prev,
            branch: branchResponse.branch
          }));
        } else {
          // Fallback: extract branch from entity data
          if (initialIsOfferBooking && entityData.service?.store) {
            const fallbackBranch = {
              id: `store-${entityData.service.store.id}`,
              name: entityData.service.store.name + ' (Main Branch)',
              address: entityData.service.store.location,
              phone: entityData.service.store.phone_number,
              openingTime: entityData.service.store.opening_time,
              closingTime: entityData.service.store.closing_time,
              workingDays: entityData.service.store.working_days,
              isMainBranch: true,
              storeId: entityData.service.store.id
            };
            
            setBranch(fallbackBranch);
            setBranchInfo({
              name: fallbackBranch.name,
              openingTime: fallbackBranch.openingTime,
              closingTime: fallbackBranch.closingTime,
              workingDays: fallbackBranch.workingDays
            });
            
            setBookingData(prev => ({
              ...prev,
              branch: fallbackBranch
            }));
          } else if (!initialIsOfferBooking && entityData.store) {
            const fallbackBranch = {
              id: `store-${entityData.store.id}`,
              name: entityData.store.name + ' (Main Branch)',
              address: entityData.store.location,
              phone: entityData.store.phone_number,
              openingTime: entityData.store.opening_time,
              closingTime: entityData.store.closing_time,
              workingDays: entityData.store.working_days,
              isMainBranch: true,
              storeId: entityData.store.id
            };
            
            setBranch(fallbackBranch);
            setBranchInfo({
              name: fallbackBranch.name,
              openingTime: fallbackBranch.openingTime,
              closingTime: fallbackBranch.closingTime,
              workingDays: fallbackBranch.workingDays
            });
            
            setBookingData(prev => ({
              ...prev,
              branch: fallbackBranch
            }));
          }
        }
      } catch (branchError) {
        setBranch(null);
        setBranchInfo(null);
      }
  
    } catch (err) {
      let errorMessage = `Failed to load ${initialEntityType} booking information`;
      
      if (err.message.includes('not found')) {
        errorMessage = `This ${initialEntityType} is no longer available.`;
      } else if (err.status === 401) {
        navigate(`/login?redirect=${window.location.pathname}`);
        return;
      }
  
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [entityId, initialEntityType, initialIsOfferBooking, navigate]);

  useEffect(() => {
    if (currentStep === 2 && !bookingData.branch && branch) {
      setBookingData(prev => ({
        ...prev,
        branch: branch
      }));
    }
  }, [currentStep, bookingData.branch, branch]);

  // ==================== SLOT MANAGEMENT ====================

  const fetchAvailableSlots = useCallback(async (forceRefresh = false) => {
    if (!bookingData.date || !entityId) return;
  
    try {
      if (forceRefresh) {
        setRefreshing(true);
      }
      
      let response;
      
      if (isOfferBooking) {
        response = await bookingService.getAvailableSlotsForOffer(entityId, bookingData.date);
      } else {
        response = await bookingService.getAvailableSlotsForService(entityId, bookingData.date);
      }
      
      // Handle business rule violations
      if (response?.businessRuleViolation || (!response?.success && response?.message)) {
        setAvailableSlots([]);
        setDetailedSlots([]);
        
        if (response.storeInfo || response.branchInfo) {
          setBranchInfo(response.storeInfo || response.branchInfo);
        }
        
        setError(response.message || 'Branch validation failed');
        return;
      }
      
      if (response?.success || response?.availableSlots) {
        setAvailableSlots(response.availableSlots || []);
        setDetailedSlots(response.detailedSlots || []);
        setBookingRules(response.bookingRules);
        
        if (response.storeInfo || response.branchInfo) {
          setBranchInfo(response.storeInfo || response.branchInfo);
        }
        
        setAccessFee(isOfferBooking ? (response.accessFee || 5.99) : 0);
        setError(null);
        return;
      }
  
      setAvailableSlots([]);
      setDetailedSlots([]);
      setError('No available time slots for this date. Please try a different date.');
      
    } catch (err) {
      setAvailableSlots([]);
      setDetailedSlots([]);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        
        if (err.response.data.storeInfo || err.response.data.branchInfo) {
          setBranchInfo(err.response.data.storeInfo || err.response.data.branchInfo);
        }
      } else {
        setError('Failed to load available time slots. Please try again.');
      }
    } finally {
      if (forceRefresh) setRefreshing(false);
    }
  }, [bookingData.date, entityId, entityType, isOfferBooking]);

  const getSlotDetails = useCallback((selectedTime) => {
    return detailedSlots.find(slot => 
      slot.time === selectedTime || slot.startTime === selectedTime
    );
  }, [detailedSlots]);

  const refreshSlots = useCallback(() => {
    fetchAvailableSlots(true);
  }, [fetchAvailableSlots]);

  // ==================== STAFF MANAGEMENT ====================

  const fetchStaffForService = useCallback(async () => {
    if (!entityId) return;

    try {
      let response;
      
      if (isOfferBooking) {
        response = await bookingService.getStaffForOffer(entityId);
      } else {
        response = await bookingService.getStaffForService(entityId);
      }
      
      if (response?.staff && Array.isArray(response.staff)) {
        setStaff(response.staff);
      } else {
        setStaff([]);
      }
      
    } catch (err) {
      setStaff([]);
    }
  }, [entityId, isOfferBooking, branch]);

  // ==================== HANDLERS ====================

  const handleStepNavigation = useCallback((step) => {
    if (step === 1) {
      setCurrentStep(1);
    } else if (step === 2 && bookingData.date && bookingData.time) {
      setCurrentStep(2);
    } else if (step === 3 && bookingData.branch) {
      setCurrentStep(3);
    }
  }, [bookingData.date, bookingData.time, bookingData.branch]);

  const handleBookingSubmit = useCallback(async () => {
    console.log('=== BOOKING SUBMIT DEBUG ===');
    console.log('bookingData.time:', bookingData.time);
    console.log('bookingData.date:', bookingData.date);
    
    const convertedTime = convertTo24Hour(bookingData.time);
    console.log('converted time:', convertedTime);
    
    const fullDateTime = `${bookingData.date}T${convertedTime}:00`;
    console.log('full datetime string:', fullDateTime);
    
    // Test if the datetime is valid
    const testDate = new Date(fullDateTime);
    console.log('parsed date object:', testDate);
    console.log('is valid date:', !isNaN(testDate.getTime()));
    console.log('=== END SUBMIT DEBUG ===');
  
    let processedBookingData = {
      userId: user.id,
      startTime: fullDateTime,
      staffId: bookingData.staff?.id,
      notes: bookingData.notes,
      bookingType: entityType,
      clientInfo: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phoneNumber || user.phone || phoneNumber
      }
    };
    // Handle branch ID that might be a store fallback
    if (bookingData.branch) {
      if (bookingData.branch.id && bookingData.branch.id.startsWith('store-')) {
        const actualStoreId = bookingData.branch.id.replace('store-', '');
        processedBookingData.storeId = actualStoreId;
      } else if (bookingData.branch.isMainBranch) {
        processedBookingData.storeId = bookingData.branch.storeId || bookingData.branch.id;
      } else {
        processedBookingData.branchId = bookingData.branch.id;
      }
    }

    // Add correct ID field based on booking type
    if (isOfferBooking) {
      processedBookingData.offerId = entityId;
    } else {
      processedBookingData.serviceId = entityId;
    }

    // Only add payment data for offer bookings
    if (isOfferBooking && accessFee > 0) {
      processedBookingData.paymentData = {
        amount: accessFee,
        currency: 'KES',
        method: paymentMethod,
        phoneNumber: phoneNumber
      };
    }

    try {
      setSubmitting(true);
      setError(null);

      const result = await bookingService.createBooking(processedBookingData);

      if (result.success) {
        setCurrentStep(4);
      } else {
        throw new Error(result.message || 'Failed to create booking');
      }

    } catch (err) {
      // Enhanced error handling for branch/store issues
      if (err.message && err.message.includes('Branch not found')) {
        try {
          const fallbackData = {
            ...processedBookingData,
            storeId: bookingData.branch?.id?.replace('store-', '') || bookingData.branch?.storeId
          };
          delete fallbackData.branchId;
          
          const retryResult = await bookingService.createBooking(fallbackData);
          
          if (retryResult.success) {
            setCurrentStep(4);
            return;
          }
        } catch (retryError) {
          // Ignore retry error
        }
      }
      
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  }, [bookingData, user, entityId, entityType, isOfferBooking, accessFee, paymentMethod, phoneNumber, convertTo24Hour]);

  const handleMpesaPayment = useCallback(async () => {
    try {
      if (!phoneNumber || phoneNumber.length < 10) {
        setError('Please enter a valid phone number');
        return;
      }
  
      setSubmitting(true);
      setError(null);
      
      // Step 1: Initiate M-Pesa payment first
      const paymentResult = await bookingService.processMpesaPayment(
        phoneNumber,
        accessFee,
        null, // No booking ID yet
        {
          // Include booking data for later processing
          bookingData: {
            userId: user.id,
            offerId: entityId,
            startTime: `${bookingData.date}T${convertTo24Hour(bookingData.time)}:00`,
            staffId: bookingData.staff?.id,
            notes: bookingData.notes,
            storeId: bookingData.branch?.storeId || bookingData.branch?.id?.replace('store-', ''),
            branchId: bookingData.branch?.isMainBranch ? null : bookingData.branch?.id,
            clientInfo: {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              phone: user.phoneNumber || user.phone || phoneNumber
            }
          }
        }
      );
  
      if (paymentResult.success) {
        setShowPaymentModal(false);
        
        // Show payment pending state
        setCurrentStep('payment-pending');
        
        // Start polling for payment confirmation
        pollPaymentStatus(paymentResult.payment.id);
        
      } else {
        setError('Payment initiation failed. Please try again.');
      }
  
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  }, [phoneNumber, accessFee, bookingData, user, entityId]);

  const pollPaymentStatus = useCallback(async (paymentId) => {
    const maxAttempts = 60; // 5 minutes (5 second intervals)
    let attempts = 0;
    
    const checkPayment = async () => {
      try {
        const status = await bookingService.checkPaymentStatus(paymentId);
        
        if (status.payment?.status === 'completed') {
          // Payment successful - booking should be created automatically
          setCurrentStep(4);
          return;
        } else if (status.payment?.status === 'failed') {
          setError('Payment failed. Please try again.');
          setCurrentStep(3); // Go back to payment step
          return;
        } else if (attempts >= maxAttempts) {
          setError('Payment confirmation timeout. Please check your M-Pesa messages.');
          setCurrentStep(3);
          return;
        }
        
        attempts++;
        setTimeout(checkPayment, 5000); // Check again in 5 seconds
        
      } catch (error) {
        console.error('Error checking payment status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkPayment, 5000);
        } else {
          setError('Unable to confirm payment status. Please contact support.');
          setCurrentStep(3);
        }
      }
    };
    
    checkPayment();
  }, []);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (entityId && entityId.trim() !== '' && entityId !== 'undefined') {
      initializeBooking();
    } else {
      const errorMessage = initialIsOfferBooking 
        ? 'Invalid booking request. Please select a valid offer.'
        : 'Invalid booking request. Please select a valid service.';
      setError(errorMessage);
      setLoading(false);
    }
  }, [entityId, initializeBooking]);

  useEffect(() => {
    if (bookingData.date && entityId) {
      fetchAvailableSlots();
    }
  }, [bookingData.date, entityId, fetchAvailableSlots]);

  useEffect(() => {
    if (branch && entityId) {
      fetchStaffForService();
    }
  }, [branch, entityId, fetchStaffForService]);

  useEffect(() => {
    if (bookingData.date) {
      setBookingData(prev => ({ ...prev, time: '' }));
    }
  }, [bookingData.date]);

  useEffect(() => {
    if (bookingData.branch) {
      setBookingData(prev => ({ ...prev, staff: null }));
    }
  }, [bookingData.branch]);

  // ==================== UI COMPONENTS ====================

  const StepTracker = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleStepNavigation(step.id)}
                disabled={step.id > currentStep && !step.completed}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  step.completed ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' :
                  currentStep === step.id ? 'bg-blue-500 text-white' : 
                  step.id < currentStep ? 'bg-blue-300 text-white cursor-pointer hover:bg-blue-400' :
                  'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {step.completed ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
              </button>
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

  const EntitySummary = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center space-x-4">
        <img
          src={entityDetails?.images?.[0] || entityDetails?.image || "/api/placeholder/60/60"}
          alt={entityDetails?.title || entityDetails?.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {entityDetails?.title || entityDetails?.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {isOfferBooking 
              ? entityDetails?.service?.name || 'Offer booking'
              : entityDetails?.description || 'Service booking'
            }
          </p>
          {bookingRules && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {bookingRules.serviceDuration}min
              </span>
              {bookingRules.maxConcurrentBookings > 1 && (
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  Up to {bookingRules.maxConcurrentBookings} per slot
                </span>
              )}
              <span className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                {isOfferBooking ? 'Offer Booking' : 'Direct Service'}
              </span>
            </div>
          )}
        </div>
        {isOfferBooking && entityDetails?.discount ? (
          <div className="text-right">
            <div className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded mb-1">
              {entityDetails.discount}% OFF
            </div>
            <div className="text-lg font-bold text-green-600">
              {entityDetails.offerPrice || entityDetails.discounted_price}
            </div>
            <div className="text-sm text-gray-500 line-through">
              {entityDetails.originalPrice || entityDetails.original_price}
            </div>
          </div>
        ) : !isOfferBooking && entityDetails?.price ? (
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              KES {entityDetails.price}
            </div>
            <div className="text-sm text-gray-500">
              Service Price
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const SmartDatePicker = () => {
    const availableDates = getAvailableDates();
    
    const getDisplayWorkingDays = () => {
      if (!branchInfo || !branchInfo.workingDays) return [];
      
      const parsedDays = parseWorkingDaysArray(branchInfo.workingDays);
      return parsedDays.map(day => {
        const dayStr = day.toString().trim();
        return dayStr.charAt(0).toUpperCase() + dayStr.slice(1).toLowerCase();
      });
    };
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Date
        </label>
        
        <input
          type="date"
          value={bookingData.date}
          onChange={(e) => {
            setBookingData(prev => ({ ...prev, date: e.target.value, time: '' }));
          }}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
        
        {availableDates.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Quick select (working days only):</p>
            <div className="grid grid-cols-2 gap-2">
              {availableDates.slice(0, 6).map((dateObj) => (
                <button
                  key={dateObj.date}
                  onClick={() => {
                    setBookingData(prev => ({ ...prev, date: dateObj.date, time: '' }));
                  }}
                  className={`p-2 text-xs rounded border transition-colors ${
                    bookingData.date === dateObj.date
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium">{dateObj.dayName}</div>
                  <div className="text-xs opacity-75">{dateObj.formattedDate}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {branchInfo ? (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700">{branchInfo.name}</p>
            <p className="text-xs text-gray-500">
              Open: {branchInfo.openingTime} - {branchInfo.closingTime}
            </p>
            {(() => {
              const displayWorkingDays = getDisplayWorkingDays();
              return displayWorkingDays.length > 0 && (
                <p className="text-xs text-gray-500">
                  Working days: {displayWorkingDays.join(', ')}
                </p>
              );
            })()}
          </div>
        ) : (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Loading branch information...
            </p>
          </div>
        )}
      </div>
    );
  };

  const ErrorDisplay = ({ error, onRetry }) => (
    <div className="flex items-center justify-center h-64 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-2" />
        <p className="text-red-600 font-medium mb-2">{error}</p>
        
        <div className="space-y-2">
          <button
            onClick={onRetry}
            disabled={refreshing}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
        
        {error.includes('closed') && branchInfo?.workingDays && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="text-blue-800 font-medium">Branch is open on:</p>
            <p className="text-blue-600">
              {branchInfo.workingDays.map(day => 
                day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
              ).join(', ')}
            </p>
            {bookingData.date && (
              <p className="text-blue-600 text-xs mt-1">
                Selected: {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })} 
                ({bookingData.date})
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const StaffSelectionInfo = () => {
    if (!entityDetails) return null;
    
    return (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <Info className="w-4 h-4 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800">
            {isOfferBooking ? (
              <>
                Showing staff assigned to: <strong>{entityDetails.service?.name}</strong>
                {branch && !branch.isMainBranch && (
                  <> at <strong>{branch.name}</strong></>
                )}
                {staff.length === 0 && ' (No staff currently assigned to this service)'}
              </>
            ) : (
              <>
                Showing staff assigned to: <strong>{entityDetails.name}</strong>
                {branch && !branch.isMainBranch && (
                  <> at <strong>{branch.name}</strong></>
                )}
                {staff.length === 0 && ' (No staff currently assigned to this service)'}
              </>
            )}
          </span>
        </div>
        {staff.length === 0 && (
          <p className="text-xs text-blue-600 mt-1">
            You can still proceed with your booking. A staff member will be assigned automatically.
          </p>
        )}
      </div>
    );
  };

  const DateTimeStep = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select Date & Time</h2>
        {isOfferBooking && accessFee > 0 && (
          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Platform Access Fee: {formatCurrency(accessFee)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SmartDatePicker />

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Available Time Slots
            </label>
            {availableSlots.length > 0 && (
              <button
                onClick={refreshSlots}
                disabled={refreshing}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>

          {!bookingData.date ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Please select a date first</p>
              </div>
            </div>
          ) : error ? (
            <ErrorDisplay error={error} onRetry={refreshSlots} />
          ) : availableSlots.length === 0 ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No available slots for this date</p>
                <p className="text-sm text-gray-400">Please try a different date</p>
                <button
                  onClick={refreshSlots}
                  disabled={refreshing}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {refreshing ? 'Checking...' : 'Check again'}
                </button>
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
                        onClick={() => setBookingData(prev => ({ ...prev, time: slot.time }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:shadow-sm'
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
                      onClick={() => setBookingData(prev => ({ ...prev, time }))}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        bookingData.time === time
                          ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      {time}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => setCurrentStep(2)}
          disabled={!bookingData.date || !bookingData.time}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
  const BranchSelection = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Location & Staff</h2>
  
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
        <h3 className="text-lg font-semibold mb-4">Service Branch</h3>
        
        {!branch && loading ? (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="text-gray-500">Loading branch information...</span>
            </div>
          </div>
        ) : !branch ? (
          <div className="p-4 border-2 border-dashed border-red-300 rounded-lg">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-600 font-medium mb-2">
                Branch information not available
              </p>
              <p className="text-sm text-red-500 mb-3">
                {isOfferBooking 
                  ? "We couldn't load the branch details for this offer. This might be a configuration issue."
                  : "We couldn't load the branch details for this service."
                }
              </p>
              <button
                onClick={initializeBooking}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded text-sm transition-colors"
              >
                Retry Loading Branch
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              setBookingData(prev => ({ ...prev, branch, staff: null }));
            }}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              bookingData.branch?.id === branch.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                <p className="text-gray-600 mt-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {branch.address || branch.location}
                </p>
                {branch.phone && (
                  <p className="text-gray-600 mt-1 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {branch.phone}
                  </p>
                )}
                {branch.openingTime && branch.closingTime && (
                  <p className="text-gray-600 mt-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {branch.openingTime} - {branch.closingTime}
                  </p>
                )}
                {branch.workingDays && Array.isArray(branch.workingDays) && branch.workingDays.length > 0 && (
                  <p className="text-gray-600 mt-1 text-sm">
                    Open: {branch.workingDays.map(day => 
                      typeof day === 'string' ? day.charAt(0).toUpperCase() + day.slice(1).toLowerCase() : day
                    ).join(', ')}
                  </p>
                )}
                {branch.isMainBranch && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                    Main Branch
                  </span>
                )}
                {isOfferBooking && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2">
                    Offer Location
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {bookingData.branch?.id === branch.id && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>
  
      {(bookingData.branch || branch) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Select Staff Member (Optional)</h3>
          
          <StaffSelectionInfo />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.length > 0 ? staff.map((member) => (
              <div
                key={member.id}
                onClick={() => setBookingData(prev => ({ 
                  ...prev, 
                  staff: prev.staff?.id === member.id ? null : member 
                }))}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  bookingData.staff?.id === member.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                    <p className="text-gray-600 text-sm">{member.role}</p>
                    {member.assignedToService && (
                      <p className="text-xs text-blue-600">
                        Assigned to this service
                      </p>
                    )}
                  </div>
                  {bookingData.staff?.id === member.id && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-8">
                <div className="flex items-center justify-center">
                  <Info className="w-6 h-6 text-blue-600 mr-2" />
                  <p className="text-gray-500">No staff assigned to this service</p>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  You can still proceed with your booking. A staff member will be assigned automatically.
                </p>
              </div>
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
          onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any special requests or notes..."
        />
      </div>
  
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          disabled={!bookingData.branch && !branch}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Booking</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Date & Time</p>
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

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Service Location</p>
                <p className="text-gray-600">{bookingData.branch?.name}</p>
                <p className="text-sm text-gray-500">{bookingData.branch?.address || bookingData.branch?.location}</p>
                {bookingData.branch?.isMainBranch && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                    Main Branch
                  </span>
                )}
              </div>
            </div>

            {bookingData.staff && (
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Staff Member</p>
                  <p className="text-gray-600">{bookingData.staff.name}</p>
                  <p className="text-sm text-gray-500">{bookingData.staff.role}</p>
                  {bookingData.staff.assignedToService && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                      Assigned to Service
                    </span>
                  )}
                </div>
              </div>
            )}

            {bookingData.notes && (
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Notes</p>
                  <p className="text-gray-600">{bookingData.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex space-x-4">
              <img
                src={entityDetails?.images?.[0] || entityDetails?.image || "/api/placeholder/80/80"}
                alt={entityDetails?.title || entityDetails?.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {entityDetails?.title || entityDetails?.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {entityDetails?.description}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {isOfferBooking ? (
                    <>
                      <span className="text-lg font-bold text-green-600">
                        {entityDetails?.offerPrice || entityDetails?.discounted_price || 'N/A'}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {entityDetails?.originalPrice || entityDetails?.original_price || ''}
                      </span>
                      <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                        {entityDetails?.discount}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-blue-600">
                      KES {entityDetails?.price || 'Service Price'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {accessFee > 0 && isOfferBooking && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Access Fee</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                paymentMethod === 'mpesa' ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 hover:border-green-300'
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
                <span>Platform Access Fee</span>
                <span>{formatCurrency(accessFee)}</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Platform Access Fee:</strong> This fee secures your booking slot and gives you access to the exclusive offer.
                    You'll pay the discounted service price of <strong>{entityDetails?.offerPrice || entityDetails?.discounted_price}</strong>
                    directly to the merchant when you arrive for your appointment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        
        {accessFee > 0 && isOfferBooking ? (
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={submitting}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Pay {formatCurrency(accessFee)}</span>
                <CreditCard className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleBookingSubmit}
            disabled={submitting}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Creating Booking...</span>
              </>
            ) : (
              <>
                <span>Confirm {isOfferBooking ? 'Offer ' : ''}Booking</span>
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  const ConfirmationStep = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your {isOfferBooking ? 'offer' : 'service'} booking has been successfully created
          {isOfferBooking && accessFee > 0 ? ' and platform access fee processed' : ''}.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-green-700 space-y-1 text-left">
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Check your email for booking confirmation
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Arrive 10 minutes before your appointment
            </li>
            {isOfferBooking ? (
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Pay the discounted rate directly to merchant: {entityDetails?.offerPrice || entityDetails?.discounted_price}
              </li>
            ) : (
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Pay the service fee directly to merchant: KES {entityDetails?.price}
              </li>
            )}
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Bring a valid ID for verification
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/profile/bookings')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate(isOfferBooking ? '/offers' : '/stores')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Browse More {isOfferBooking ? 'Offers' : 'Services'}
          </button>
        </div>
      </div>
    </div>
  );

  const PaymentModal = () => {
    // Move phone number state to local component state to prevent re-renders
    const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber);
    
    // Only update parent state on blur or form submit
    const handlePhoneChange = (e) => {
      setLocalPhoneNumber(e.target.value);
    };
    
    const handlePhoneBlur = () => {
      setPhoneNumber(localPhoneNumber);
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Platform Access Fee</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(accessFee)}</p>
            </div>
  
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your M-Pesa phone number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={localPhoneNumber} // Use local state
                onChange={handlePhoneChange} // Use local handler
                onBlur={handlePhoneBlur} // Update parent state on blur
                placeholder="e.g. 0712345678"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={13}
                autoComplete="tel"
              />
            </div>
  
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>
  
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              disabled={submitting}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setPhoneNumber(localPhoneNumber); // Ensure parent state is updated
                handleMpesaPayment();
              }}
              disabled={localPhoneNumber.length < 10 || submitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
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
  };

  const PaymentPendingStep = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
        <p className="text-gray-600 mb-6">
          Please complete the M-Pesa payment on your phone. Your booking will be created automatically once payment is confirmed.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Next steps:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Check your phone for M-Pesa prompt</li>
            <li>• Enter your M-Pesa PIN</li>
            <li>• Wait for confirmation (this may take up to 2 minutes)</li>
          </ul>
        </div>
      </div>
    </div>
  );
  

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <DateTimeStep />;
      case 2:
        return <BranchSelection />;
      case 3:
        return <ReviewStep />;
      case 'payment-pending':
        return <PaymentPendingStep />;
      case 4:
        return <ConfirmationStep />;
      default:
        return <DateTimeStep />;
    }
  };

  // ==================== MAIN RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading booking information...</span>
        </div>
      </div>
    );
  }

  if (error && !entityDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Book Your {isOfferBooking ? 'Offer' : 'Service'}
                </h1>
                <p className="text-gray-600">
                  {isOfferBooking 
                    ? 'Secure your exclusive access to this amazing deal'
                    : 'Schedule your service appointment'
                  }
                </p>
              </div>
            </div>
            
            {entityDetails && <EntitySummary />}
          </div>

          <StepTracker />

          {error && entityDetails && (
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
      </div>
      <Footer />
    </>
  );
};

export default EnhancedBookingPage;