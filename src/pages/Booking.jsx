import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Clock, MapPin, User, CreditCard, Smartphone, Check,
  ChevronRight, AlertCircle, X, Loader2, CheckCircle,
  Users, UserCheck, Info, RefreshCw, Zap, ArrowLeft, Phone,
  AlertTriangle, Shield, ChevronLeft
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [slotsWithStaff, setSlotsWithStaff] = useState([]); // NEW: Slot-centric staff availability
  const [selectedSlotData, setSelectedSlotData] = useState(null); // NEW: Data for selected slot
  const [showStaffModal, setShowStaffModal] = useState(false); // NEW: Staff selection modal
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
    { id: 2, title: "Location", icon: MapPin, completed: currentStep > 2 },
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
        // Offers use the old flow (time-first, no staff availability)
        response = await bookingService.getAvailableSlotsForOffer(entityId, bookingData.date);
      } else {
        // Services use NEW hybrid flow (shows staff availability per slot)
        response = await bookingService.getServiceSlotsWithStaffAvailability(entityId, bookingData.date);
      }

      // Handle business rule violations
      if (response?.businessRuleViolation || (!response?.success && response?.message)) {
        setAvailableSlots([]);
        setDetailedSlots([]);
        setSlotsWithStaff([]); // NEW: Clear slot-centric data

        if (response.storeInfo || response.branchInfo) {
          setBranchInfo(response.storeInfo || response.branchInfo);
        }

        setError(response.message || 'Branch validation failed');
        return;
      }

      if (response?.success) {
        if (isOfferBooking) {
          // OLD FLOW: For offers, use availableSlots array
          setAvailableSlots(response.availableSlots || []);
          setDetailedSlots(response.detailedSlots || []);
          setSlotsWithStaff([]); // Clear for offers
        } else {
          // NEW FLOW: For services, use slots with staff data
          setSlotsWithStaff(response.slots || []);
          // Build availableSlots array for backward compatibility
          setAvailableSlots((response.slots || []).map(slot => slot.time));
          setDetailedSlots(response.slots || []);
        }

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
      setSlotsWithStaff([]);
      setError('No available time slots for this date. Please try a different date.');

    } catch (err) {
      setAvailableSlots([]);
      setDetailedSlots([]);
      setSlotsWithStaff([]);

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
    
    // STEP 1: Create the booking FIRST (with pending status)
    console.log('=== CREATING BOOKING FIRST ===');
    console.log('bookingData.time:', bookingData.time);
    console.log('bookingData.date:', bookingData.date);
    
    const convertedTime = convertTo24Hour(bookingData.time);
    console.log('converted time:', convertedTime);
    
    const fullDateTime = `${bookingData.date}T${convertedTime}:00`;
    console.log('full datetime string:', fullDateTime);

    let bookingPayload = {
      userId: user.id,
      offerId: entityId,
      startTime: fullDateTime,
      staffId: bookingData.staff?.id,
      notes: bookingData.notes,
      bookingType: 'offer',
      status: 'pending', // Important: booking starts as pending
      clientInfo: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phoneNumber || user.phone || phoneNumber
      }
    };

    // Handle branch/store ID
    if (bookingData.branch) {
      if (bookingData.branch.id && bookingData.branch.id.startsWith('store-')) {
        const actualStoreId = bookingData.branch.id.replace('store-', '');
        bookingPayload.storeId = actualStoreId;
      } else if (bookingData.branch.isMainBranch) {
        bookingPayload.storeId = bookingData.branch.storeId || bookingData.branch.id;
      } else {
        bookingPayload.branchId = bookingData.branch.id;
      }
    }

    console.log('Creating booking with payload:', bookingPayload);

    // Create the booking
    const bookingResult = await bookingService.createBooking(bookingPayload);
    
    if (!bookingResult.success) {
      throw new Error(bookingResult.message || 'Failed to create booking');
    }

    const createdBooking = bookingResult.booking || bookingResult.data;
    const bookingId = createdBooking.id;
    
    console.log('✅ Booking created successfully:', bookingId);

    // STEP 2: Now initiate M-Pesa payment with the booking ID
    console.log('=== INITIATING MPESA PAYMENT ===');
    console.log('Booking ID:', bookingId);
    console.log('Amount:', accessFee);
    console.log('Phone:', phoneNumber);

    const paymentResult = await bookingService.processMpesaPayment(
      phoneNumber,
      accessFee,
      bookingId, // CRITICAL: Pass the booking ID here
      'booking_access_fee'
    );

    console.log('Payment initiation result:', paymentResult);

    if (paymentResult.success) {
      setShowPaymentModal(false);
      
      // Show payment pending state
      setCurrentStep('payment-pending');
      
      // Start polling for payment confirmation
      pollPaymentStatus(paymentResult.payment.id, bookingId);
      
    } else {
      // Payment initiation failed - we should keep the booking but mark it as payment_failed
      console.error('Payment initiation failed:', paymentResult);
      throw new Error('Payment initiation failed. Your booking has been created but payment could not be processed. Please contact support.');
    }

  } catch (err) {
    console.error('❌ Payment/Booking error:', err);
    setError(err.message || 'Failed to process booking and payment');
  } finally {
    setSubmitting(false);
  }
}, [phoneNumber, accessFee, bookingData, user, entityId, convertTo24Hour]);

// FIXED pollPaymentStatus function
const pollPaymentStatus = useCallback(async (paymentId, bookingId) => {
  const maxAttempts = 60; // 5 minutes (5 second intervals)
  let attempts = 0;
  
  const checkPayment = async () => {
    try {
      console.log(`Checking payment status (attempt ${attempts + 1}/${maxAttempts})...`);
      
      const status = await bookingService.checkPaymentStatus(paymentId);
      
      console.log('Payment status:', status.payment?.status);
      
      if (status.payment?.status === 'completed') {
        // Payment successful - booking should be auto-confirmed by backend
        console.log('✅ Payment completed! Booking should be confirmed.');
        setCurrentStep(4);
        return;
        
      } else if (status.payment?.status === 'failed') {
        console.error('❌ Payment failed');
        setError('Payment failed. Your booking has been created but payment was not completed. Please contact support with booking ID: ' + bookingId);
        setCurrentStep(3); // Go back to payment step
        return;
        
      } else if (attempts >= maxAttempts) {
        console.warn('⏰ Payment confirmation timeout');
        setError('Payment confirmation timeout. Please check your M-Pesa messages or contact support with booking ID: ' + bookingId);
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
        setError('Unable to confirm payment status. Please check your M-Pesa messages or contact support with booking ID: ' + bookingId);
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/20 p-4 sm:p-6 mb-6 transition-colors duration-200">
      <div className="flex items-center justify-between overflow-x-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleStepNavigation(step.id)}
                disabled={step.id > currentStep && !step.completed}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  step.completed ? 'bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25' :
                  currentStep === step.id ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' :
                  step.id < currentStep ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {step.completed ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
              <span className={`mt-2 text-xs sm:text-sm font-medium transition-colors ${
                step.completed ? 'text-green-600 dark:text-green-400' :
                currentStep === step.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 mx-2 sm:mx-4 rounded transition-colors ${
                step.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const EntitySummary = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/20 p-4 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={entityDetails?.images?.[0] || entityDetails?.image || "/api/placeholder/60/60"}
            alt={entityDetails?.title || entityDetails?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-700"
          />
          {isOfferBooking && entityDetails?.discount && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
              -{entityDetails.discount}%
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {entityDetails?.title || entityDetails?.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
            {isOfferBooking
              ? entityDetails?.service?.name || 'Offer booking'
              : entityDetails?.description || 'Service booking'
            }
          </p>
          {bookingRules && (
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                <Clock className="w-3 h-3 mr-1 text-blue-500" />
                {bookingRules.serviceDuration}min
              </span>
              {bookingRules.maxConcurrentBookings > 1 && (
                <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                  <Users className="w-3 h-3 mr-1 text-purple-500" />
                  Up to {bookingRules.maxConcurrentBookings}
                </span>
              )}
              <span className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg">
                <Zap className="w-3 h-3 mr-1" />
                {isOfferBooking ? 'Offer' : 'Service'}
              </span>
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          {isOfferBooking && entityDetails?.discount ? (
            <>
              <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                {entityDetails.offerPrice || entityDetails.discounted_price}
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500 line-through">
                {entityDetails.originalPrice || entityDetails.original_price}
              </div>
            </>
          ) : !isOfferBooking && entityDetails?.price ? (
            <>
              <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                KES {entityDetails.price}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Service Price
              </div>
            </>
          ) : null}
        </div>
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Date
        </label>

        <input
          type="date"
          value={bookingData.date}
          onChange={(e) => {
            setBookingData(prev => ({ ...prev, date: e.target.value, time: '' }));
          }}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 transition-colors"
          style={{ fontSize: '16px' }}
        />

        {availableDates.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick select (working days only):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableDates.slice(0, 6).map((dateObj) => (
                <button
                  key={dateObj.date}
                  onClick={() => {
                    setBookingData(prev => ({ ...prev, date: dateObj.date, time: '' }));
                  }}
                  className={`p-3 text-xs rounded-xl border-2 transition-all duration-200 ${
                    bookingData.date === dateObj.date
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="font-semibold">{dateObj.dayName}</div>
                  <div className={`text-xs mt-0.5 ${bookingData.date === dateObj.date ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {dateObj.formattedDate}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {branchInfo ? (
          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{branchInfo.name}</p>
            </div>
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
              <Clock className="w-3 h-3 mr-1" />
              Open: {branchInfo.openingTime} - {branchInfo.closingTime}
            </div>
            {(() => {
              const displayWorkingDays = getDisplayWorkingDays();
              return displayWorkingDays.length > 0 && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Working days: {displayWorkingDays.join(', ')}
                </p>
              );
            })()}
          </div>
        ) : (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex items-center">
              <Loader2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-spin mr-2" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Loading branch information...
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ErrorDisplay = ({ error, onRetry }) => (
    <div className="flex items-center justify-center h-64 border-2 border-dashed border-red-300 dark:border-red-700 rounded-xl bg-red-50 dark:bg-red-900/20">
      <div className="text-center max-w-md px-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <p className="text-red-700 dark:text-red-300 font-medium mb-4">{error}</p>

        <button
          onClick={onRetry}
          disabled={refreshing}
          className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 px-6 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {refreshing ? 'Retrying...' : 'Try Again'}
        </button>

        {error.includes('closed') && branchInfo?.workingDays && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm">
            <p className="text-blue-800 dark:text-blue-300 font-medium">Branch is open on:</p>
            <p className="text-blue-600 dark:text-blue-400">
              {branchInfo.workingDays.map(day =>
                day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
              ).join(', ')}
            </p>
            {bookingData.date && (
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
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
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors duration-200">
        <div className="flex items-center">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
          <span className="text-sm text-blue-800 dark:text-blue-300">
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
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            You can still proceed with your booking. A staff member will be assigned automatically.
          </p>
        )}
      </div>
    );
  };

  const DateTimeStep = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/20 p-4 sm:p-6 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Select Date & Time</h2>
        {isOfferBooking && accessFee > 0 && (
          <div className="flex items-center text-sm bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full font-medium">
            <CreditCard className="w-4 h-4 mr-2" />
            Access Fee: {formatCurrency(accessFee)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <SmartDatePicker />

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Available Time Slots
            </label>
            {availableSlots.length > 0 && (
              <button
                onClick={refreshSlots}
                disabled={refreshing}
                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>

          {!bookingData.date ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Please select a date first</p>
              </div>
            </div>
          ) : error ? (
            <ErrorDisplay error={error} onRetry={refreshSlots} />
          ) : availableSlots.length === 0 ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No available slots for this date</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please try a different date</p>
                <button
                  onClick={refreshSlots}
                  disabled={refreshing}
                  className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium disabled:opacity-50"
                >
                  {refreshing ? 'Checking...' : 'Check again'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                {detailedSlots.length > 0 ? (
                  detailedSlots.map((slot) => {
                    const isSelected = bookingData.time === slot.time;

                    // NEW: For services, show staff availability count
                    const isServiceWithStaff = !isOfferBooking && slot.availableStaffCount !== undefined;
                    const staffCount = isServiceWithStaff ? slot.availableStaffCount : null;
                    const availabilityColor = slot.available === slot.total ? 'text-green-600 dark:text-green-400' :
                                            slot.available > slot.total / 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-orange-600 dark:text-orange-400';

                    return (
                      <button
                        key={slot.time}
                        onClick={() => {
                          if (isServiceWithStaff) {
                            // NEW: For services, open staff selection modal
                            setSelectedSlotData(slot);
                            setShowStaffModal(true);
                          } else {
                            // OLD: For offers, directly set time
                            setBookingData(prev => ({ ...prev, time: slot.time }));
                          }
                        }}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{slot.time}</span>
                          <div className="flex items-center space-x-2">
                            {isServiceWithStaff ? (
                              // NEW: Show staff availability for services
                              <>
                                <Users className={`w-4 h-4 ${isSelected ? 'text-white' : staffCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                <span className={`text-xs font-medium ${isSelected ? 'text-white' : staffCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                  {staffCount} {staffCount === 1 ? 'staff' : 'staff'}
                                </span>
                              </>
                            ) : (
                              // OLD: Show slot availability for offers
                              <>
                                {slot.total > 1 && (
                                  <>
                                    <Users className={`w-4 h-4 ${isSelected ? 'text-white' : availabilityColor}`} />
                                    <span className={`text-xs font-medium ${isSelected ? 'text-white' : availabilityColor}`}>
                                      {slot.available}/{slot.total}
                                    </span>
                                  </>
                                )}
                                {slot.available === 1 && slot.total === 1 && (
                                  <UserCheck className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {isServiceWithStaff && !isSelected && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {staffCount === 0 ? 'No staff available' :
                             staffCount === 1 ? 'Click to select staff' :
                             'Click to choose staff'}
                          </div>
                        )}
                        {!isServiceWithStaff && slot.total > 1 && !isSelected && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                        bookingData.time === time
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
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
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-medium disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-blue-500/25 disabled:shadow-none"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
  const BranchSelection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/20 p-4 sm:p-6 transition-colors duration-200">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Service Location</h2>

      {bookingData.time && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
          <div className="flex items-center flex-wrap gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-blue-800 dark:text-blue-300">
              Selected: <strong>{bookingData.time}</strong> on <strong>{bookingData.date}</strong>
            </span>
            {(() => {
              const slotDetails = getSlotDetails(bookingData.time);
              return slotDetails && slotDetails.total > 1 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  {slotDetails.available}/{slotDetails.total} slots available
                </span>
              );
            })()}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Branch</h3>

        {!branch && loading ? (
          <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 text-gray-400 dark:text-gray-500 animate-spin" />
              <span className="text-gray-500 dark:text-gray-400">Loading branch information...</span>
            </div>
          </div>
        ) : !branch ? (
          <div className="p-6 border-2 border-dashed border-red-300 dark:border-red-700 rounded-xl bg-red-50 dark:bg-red-900/20">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
              <p className="text-red-700 dark:text-red-300 font-medium mb-2">
                Branch information not available
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {isOfferBooking
                  ? "We couldn't load the branch details for this offer."
                  : "We couldn't load the branch details for this service."
                }
              </p>
              <button
                onClick={initializeBooking}
                className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
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
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              bookingData.branch?.id === branch.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{branch.name}</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                  {branch.address || branch.location}
                </p>
                {branch.phone && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-1 text-green-500" />
                    {branch.phone}
                  </p>
                )}
                {branch.openingTime && branch.closingTime && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-1 text-purple-500" />
                    {branch.openingTime} - {branch.closingTime}
                  </p>
                )}
                {branch.workingDays && Array.isArray(branch.workingDays) && branch.workingDays.length > 0 && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
                    Open: {branch.workingDays.map(day =>
                      typeof day === 'string' ? day.charAt(0).toUpperCase() + day.slice(1).toLowerCase() : day
                    ).join(', ')}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {branch.isMainBranch && (
                    <span className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full font-medium">
                      Main Branch
                    </span>
                  )}
                  {isOfferBooking && (
                    <span className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2.5 py-1 rounded-full font-medium">
                      <Zap className="w-3 h-3 mr-1" />
                      Offer Location
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {bookingData.branch?.id === branch.id && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={bookingData.notes}
          onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Any special requests or notes..."
          style={{ fontSize: '16px' }}
        />
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 sm:px-8 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          disabled={!bookingData.branch && !branch}
          className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-3 rounded-xl font-medium disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 disabled:shadow-none"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/20 p-4 sm:p-6 transition-colors duration-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Review Your Booking</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Date & Time</p>
                <p className="text-gray-600 dark:text-gray-400">{bookingData.date} at {bookingData.time}</p>
                {(() => {
                  const slotDetails = getSlotDetails(bookingData.time);
                  return slotDetails && slotDetails.total > 1 && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Multiple booking slot ({slotDetails.available}/{slotDetails.total} available)
                    </p>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Service Location</p>
                <p className="text-gray-600 dark:text-gray-400">{bookingData.branch?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{bookingData.branch?.address || bookingData.branch?.location}</p>
                {bookingData.branch?.isMainBranch && (
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full mt-2 font-medium">
                    Main Branch
                  </span>
                )}
              </div>
            </div>

            {bookingData.staff && (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Staff Member</p>
                  <p className="text-gray-600 dark:text-gray-400">{bookingData.staff.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{bookingData.staff.role}</p>
                  {bookingData.staff.assignedToService && (
                    <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2.5 py-1 rounded-full mt-2 font-medium">
                      Assigned to Service
                    </span>
                  )}
                </div>
              </div>
            )}

            {bookingData.notes && (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Notes</p>
                  <p className="text-gray-600 dark:text-gray-400">{bookingData.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-700/50">
            <div className="flex space-x-4">
              <img
                src={entityDetails?.images?.[0] || entityDetails?.image || "/api/placeholder/80/80"}
                alt={entityDetails?.title || entityDetails?.name}
                className="w-20 h-20 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-600"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {entityDetails?.title || entityDetails?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                  {entityDetails?.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {isOfferBooking ? (
                    <>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {entityDetails?.offerPrice || entityDetails?.discounted_price || 'N/A'}
                      </span>
                      <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                        {entityDetails?.originalPrice || entityDetails?.original_price || ''}
                      </span>
                      <span className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full font-medium">
                        {entityDetails?.discount}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-200">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Platform Access Fee</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                paymentMethod === 'mpesa'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md'
                  : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500'
              }`}
              onClick={() => setPaymentMethod('mpesa')}
            >
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">M-Pesa</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pay with mobile money</p>
                </div>
                {paymentMethod === 'mpesa' && <Check className="w-5 h-5 text-green-600 dark:text-green-400" />}
              </div>
            </div>

            <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-500 dark:text-gray-400">Card Payment</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Coming soon</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                <span>Platform Access Fee</span>
                <span>{formatCurrency(accessFee)}</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
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
          className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {accessFee > 0 && isOfferBooking ? (
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={submitting}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-green-500/25"
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
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-blue-500/25"
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8 transition-colors duration-200">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your {isOfferBooking ? 'offer' : 'service'} booking has been successfully created
          {isOfferBooking && accessFee > 0 ? ' and platform access fee processed' : ''}.
        </p>

        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-5 mb-8">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4">What's Next?</h3>
          <ul className="text-sm text-green-700 dark:text-green-400 space-y-3 text-left">
            <li className="flex items-center">
              <Check className="w-5 h-5 mr-3 flex-shrink-0" />
              Check your email for booking confirmation
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 mr-3 flex-shrink-0" />
              Arrive 10 minutes before your appointment
            </li>
            {isOfferBooking ? (
              <li className="flex items-center">
                <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                Pay the discounted rate directly to merchant: {entityDetails?.offerPrice || entityDetails?.discounted_price}
              </li>
            ) : (
              <li className="flex items-center">
                <Check className="w-5 h-5 mr-3 flex-shrink-0" />
                Pay the service fee directly to merchant: KES {entityDetails?.price}
              </li>
            )}
            <li className="flex items-center">
              <Check className="w-5 h-5 mr-3 flex-shrink-0" />
              Bring a valid ID for verification
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/profile/bookings')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate(isOfferBooking ? '/offers' : '/stores')}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3.5 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl transition-colors duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Complete Payment</h3>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 mb-5 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="w-5 h-5" />
                <span className="font-medium">Platform Access Fee</span>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(accessFee)}</p>
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter your M-Pesa phone number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="tel"
                value={localPhoneNumber}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                placeholder="e.g. 0712345678"
                className="w-full pl-11 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200"
                style={{ fontSize: '16px' }}
                maxLength={13}
                autoComplete="tel"
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              disabled={submitting}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3.5 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setPhoneNumber(localPhoneNumber);
                handleMpesaPayment();
              }}
              disabled={localPhoneNumber.length < 10 || submitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-medium hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-green-500/25"
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8 transition-colors duration-200">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent"></div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Please complete the M-Pesa payment on your phone. Your booking will be created automatically once payment is confirmed.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
            Next steps:
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 text-left">
            <li className="flex items-center">
              <Smartphone className="w-4 h-4 mr-2 flex-shrink-0" />
              Check your phone for M-Pesa prompt
            </li>
            <li className="flex items-center">
              <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
              Enter your M-Pesa PIN
            </li>
            <li className="flex items-center">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              Wait for confirmation (this may take up to 2 minutes)
            </li>
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

  // Skeleton Components
  const BookingSkeleton = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-4" />
            <div>
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          {/* Entity Summary Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="flex-1">
                <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="flex space-x-4">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="text-right">
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Step Tracker Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 animate-pulse">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
                </div>
                {index < 3 && <div className="w-8 h-1 bg-gray-200 dark:bg-gray-700 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
            <div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <BookingSkeleton />;
  }

  if (error && !entityDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Unable to Load Booking</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                initializeBooking();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Book Your {isOfferBooking ? 'Offer' : 'Service'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isOfferBooking
                  ? 'Secure your exclusive access to this amazing deal'
                  : 'Schedule your service appointment'
                }
              </p>
            </div>
            {isOfferBooking && (
              <div className="hidden sm:flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4 mr-1" />
                Limited Offer
              </div>
            )}
          </div>

          {entityDetails && <EntitySummary />}
        </div>

        <StepTracker />

        {error && entityDetails && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {renderCurrentStep()}
      </div>

      {showPaymentModal && <PaymentModal />}

      {/* Staff Selection Modal */}
      {showStaffModal && selectedSlotData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Staff Member
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Time: {selectedSlotData.time}
                </p>
              </div>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Any Available Staff Option */}
              <button
                onClick={() => {
                  setBookingData(prev => ({
                    ...prev,
                    time: selectedSlotData.time,
                    staff: null // null means any available staff
                  }));
                  setShowStaffModal(false);
                }}
                className="w-full p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Any Available Staff
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      System will assign an available staff member
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                </div>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or choose specific staff
                  </span>
                </div>
              </div>

              {/* Staff List */}
              {selectedSlotData.availableStaff && selectedSlotData.availableStaff.length > 0 ? (
                selectedSlotData.availableStaff.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => {
                      setBookingData(prev => ({
                        ...prev,
                        time: selectedSlotData.time,
                        staff: staff.id // Set specific staff ID
                      }));
                      setShowStaffModal(false);
                    }}
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {staff.name?.charAt(0).toUpperCase() || 'S'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {staff.name}
                        </div>
                        {staff.specialization && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {staff.specialization}
                          </div>
                        )}
                        {staff.email && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                            {staff.email}
                          </div>
                        )}
                      </div>
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No specific staff available for this slot</p>
                  <p className="text-sm mt-1">Please select "Any Available Staff"</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setShowStaffModal(false)}
                className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBookingPage;