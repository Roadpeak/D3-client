// BookingDetails.jsx - Fixed with working reschedule functionality

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, MapPin, User, Phone, Mail,
  Edit3, X, CheckCircle, AlertTriangle, Loader2, Eye,
  CreditCard, Zap, Building2, UserCheck, Star, Timer,
  Bell, Shield, Tag, DollarSign, MessageCircle, Copy,
  Navigation, ExternalLink, Download, Share2, AlertCircle,
  Clock4, Users, Settings, Info, XCircle, RefreshCw,
  WifiOff, Server, AlertOctagon
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import enhancedBookingService from '../../services/enhancedBookingService';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  // State management
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({
    newStartTime: '',
    newStaffId: '',
    reason: ''
  });
  const [copySuccess, setCopySuccess] = useState('');

  // ==================== HELPER FUNCTIONS ====================
  
  // Enhanced function to determine if booking is an offer booking
  const isOfferBooking = (bookingData) => {
    if (!bookingData) return false;
    
    return !!(
      bookingData.isOfferBooking ||
      bookingData.offerId ||
      bookingData.Offer ||
      bookingData.offer ||
      bookingData.bookingType === 'offer' ||
      bookingData.type === 'offer'
    );
  };

  // Get entity (offer or service) from booking
  const getBookingEntity = (bookingData) => {
    if (!bookingData) return null;
    
    const isOffer = isOfferBooking(bookingData);
    
    if (isOffer) {
      return bookingData.Offer || bookingData.offer || null;
    } else {
      return bookingData.Service || bookingData.service || null;
    }
  };

  // Get store information from booking
  const getBookingStore = (bookingData) => {
    if (!bookingData) return null;
    
    const entity = getBookingEntity(bookingData);
    if (!entity) return null;
    
    const isOffer = isOfferBooking(bookingData);
    
    if (isOffer) {
      return entity.service?.store || entity.service?.Store || entity.Service?.store || null;
    } else {
      return entity.store || entity.Store || null;
    }
  };

  // Get service information (for both offers and direct services)
  const getBookingService = (bookingData) => {
    if (!bookingData) return null;
    
    if (isOfferBooking(bookingData)) {
      const offer = getBookingEntity(bookingData);
      return offer?.service || offer?.Service || null;
    } else {
      return getBookingEntity(bookingData);
    }
  };

  // Format booking data for consistent display
  const formatBookingData = (bookingData) => {
    if (!bookingData) return null;

    const isOffer = isOfferBooking(bookingData);
    const entity = getBookingEntity(bookingData);
    const store = getBookingStore(bookingData);
    const service = getBookingService(bookingData);

    return {
      ...bookingData,
      isOfferBooking: isOffer,
      entity,
      store,
      service,
      startTime: bookingData.startTime || bookingData.start_time || bookingData.date,
      endTime: bookingData.endTime || bookingData.end_time,
      status: bookingData.status || 'pending',
      staff: bookingData.Staff || bookingData.staff || null,
      branch: bookingData.Branch || bookingData.branch || null,
      accessFee: bookingData.accessFee || bookingData.access_fee || 0,
      accessFeePaid: bookingData.accessFeePaid || bookingData.access_fee_paid || false,
      payment: bookingData.Payment || bookingData.payment || null
    };
  };

  // ==================== DATA FETCHING ====================

  const fetchBookingDetails = useCallback(async (showRetryUI = false) => {
    try {
      if (showRetryUI) {
        setRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      setErrorType(null);

      if (!bookingId) {
        throw new Error('Invalid booking ID');
      }

      const result = await enhancedBookingService.getBookingById(bookingId);

      if (result.success && result.booking) {
        const formattedBooking = formatBookingData(result.booking);
        setBooking(formattedBooking);
        setRetryCount(0);
      } else {
        if (result.notFound) {
          setErrorType('notFound');
          setError(result.message || 'Booking not found');
        } else if (result.statusCode === 403) {
          setErrorType('permission');
          setError(result.message || 'You do not have permission to view this booking');
        } else if (result.statusCode >= 500) {
          setErrorType('server');
          setError(result.message || 'Server error occurred');
        } else {
          setErrorType('general');
          setError(result.message || 'Failed to load booking details');
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);

      if (error.message?.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        setErrorType('network');
        setError('Network connection error. Please check your internet connection.');
      } else if (error.response?.status >= 500) {
        setErrorType('server');
        setError('Server error occurred. Please try again in a few moments.');
      } else if (error.response?.status === 404) {
        setErrorType('notFound');
        setError('Booking not found. It may have been deleted or you may not have permission to view it.');
      } else if (error.response?.status === 403) {
        setErrorType('permission');
        setError('You do not have permission to view this booking.');
      } else {
        setErrorType('general');
        setError(error.message || 'An unexpected error occurred');
      }

      setBooking(null);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [bookingId]);

  // Auto-retry logic for server errors
  useEffect(() => {
    if (errorType === 'server' && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchBookingDetails(true);
      }, Math.pow(2, retryCount) * 1000);

      return () => clearTimeout(timer);
    }
  }, [errorType, retryCount, fetchBookingDetails]);

  // Initial load
  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, fetchBookingDetails]);

  // ==================== ACTION HANDLERS ====================

  const handleRetry = () => {
    setRetryCount(0);
    fetchBookingDetails(true);
  };

  const handleGoToBookings = () => {
    navigate('/profile/bookings');
  };

  const handleCancelBooking = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const result = await enhancedBookingService.cancelBooking(
        booking.id,
        cancelReason,
        booking.isOfferBooking && booking.accessFeePaid
      );

      if (result.success) {
        setShowCancelModal(false);
        setCancelReason('');
        await fetchBookingDetails();
      } else {
        throw new Error(result.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError(error.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleBooking = async () => {
    if (!rescheduleData.newStartTime) return;

    try {
      setActionLoading(true);
      setError(null);

      const result = await enhancedBookingService.rescheduleBooking(
        booking.id,
        rescheduleData
      );

      if (result.success) {
        setShowRescheduleModal(false);
        setRescheduleData({
          newStartTime: '',
          newStaffId: '',
          reason: ''
        });
        await fetchBookingDetails();
      } else {
        throw new Error(result.message || 'Failed to reschedule booking');
      }
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      setError(error.message || 'Failed to reschedule booking');
    } finally {
      setActionLoading(false);
    }
  };

  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopySuccess('Booking ID copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy booking ID:', err);
    }
  };

  const shareBooking = async () => {
    if (navigator.share && booking) {
      try {
        const entityName = booking.entity?.title || booking.entity?.name || 'Service';
        await navigator.share({
          title: `Booking: ${entityName}`,
          text: `My booking for ${new Date(booking.startTime).toLocaleDateString()}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  const canCancelBooking = () => {
    if (!booking || ['cancelled', 'completed'].includes(booking.status)) return false;

    const bookingTime = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);

    let minCancellationHours = 2;
    if (!booking.isOfferBooking && booking.entity?.min_cancellation_hours) {
      minCancellationHours = booking.entity.min_cancellation_hours;
    }

    return hoursUntilBooking >= minCancellationHours;
  };

  const canRescheduleBooking = () => {
    if (!booking || ['cancelled', 'completed', 'checked_in'].includes(booking.status)) return false;

    const bookingTime = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);

    return hoursUntilBooking >= 1;
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      checked_in: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // ==================== UI COMPONENTS ====================

  const ErrorDisplay = () => {
    const getErrorIcon = () => {
      switch (errorType) {
        case 'network':
          return <WifiOff className="w-16 h-16 text-orange-500" />;
        case 'server':
          return <Server className="w-16 h-16 text-red-500" />;
        case 'notFound':
          return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
        case 'permission':
          return <Shield className="w-16 h-16 text-red-500" />;
        default:
          return <AlertOctagon className="w-16 h-16 text-gray-500" />;
      }
    };

    const getErrorTitle = () => {
      switch (errorType) {
        case 'network':
          return 'Connection Problem';
        case 'server':
          return 'Server Error';
        case 'notFound':
          return 'Booking Not Found';
        case 'permission':
          return 'Access Denied';
        default:
          return 'Something Went Wrong';
      }
    };

    const getErrorActions = () => {
      switch (errorType) {
        case 'network':
          return (
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <p className="text-sm text-gray-500">Check your internet connection</p>
            </div>
          );
        case 'server':
          return (
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {retrying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry</span>
                  </>
                )}
              </button>
              {retryCount > 0 && (
                <p className="text-sm text-gray-500">
                  Retry attempt {retryCount}/3 {retryCount < 3 && '- Auto-retrying...'}
                </p>
              )}
            </div>
          );
        case 'notFound':
          return (
            <button
              onClick={handleGoToBookings}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              View All Bookings
            </button>
          );
        case 'permission':
          return (
            <div className="space-y-2">
              <button
                onClick={handleGoToBookings}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to My Bookings
              </button>
              <p className="text-sm text-gray-500">Contact support if you believe this is an error</p>
            </div>
          );
        default:
          return (
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={handleGoToBookings}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors ml-2"
              >
                View All Bookings
              </button>
            </div>
          );
      }
    };

    return (
      <div className="text-center">
        {getErrorIcon()}
        <h1 className="text-2xl font-bold text-gray-900 mb-2 mt-4">{getErrorTitle()}</h1>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
        {getErrorActions()}
      </div>
    );
  };

  const CancelModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Cancel Booking</h3>
          <button
            onClick={() => {
              setShowCancelModal(false);
              setCancelReason('');
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="font-medium">
            {booking.entity?.title || booking.entity?.name || 'Booking'}
          </div>
          <div className="text-sm text-gray-600">
            {new Date(booking.startTime).toLocaleString()}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Let us know why you're cancelling..."
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => {
              setShowCancelModal(false);
              setCancelReason('');
            }}
            disabled={actionLoading}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={handleCancelBooking}
            disabled={actionLoading}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            {actionLoading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Cancel Booking</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const RescheduleModal = () => {
    const generateTimeSlots = () => {
      const slots = [];
      const now = new Date();
      
      for (let day = 1; day <= 7; day++) {
        const date = new Date(now);
        date.setDate(now.getDate() + day);
        
        for (let hour = 9; hour <= 18; hour++) {
          const slotDate = new Date(date);
          slotDate.setHours(hour, 0, 0, 0);
          
          slots.push({
            value: slotDate.toISOString().slice(0, 19),
            label: `${slotDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })} at ${slotDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}`
          });
        }
      }
      
      return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Reschedule Booking</h3>
            <button
              onClick={() => {
                setShowRescheduleModal(false);
                setRescheduleData({
                  newStartTime: '',
                  newStaffId: '',
                  reason: ''
                });
                setError(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="font-medium">
              {booking.entity?.title || booking.entity?.name || 'Booking'}
            </div>
            <div className="text-sm text-gray-600">
              Current: {new Date(booking.startTime).toLocaleString()}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Date & Time *
              </label>
              <select
                value={rescheduleData.newStartTime}
                onChange={(e) => setRescheduleData(prev => ({
                  ...prev,
                  newStartTime: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select new time...</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rescheduling (optional)
              </label>
              <textarea
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Let us know why you're rescheduling..."
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Rescheduling Policy</div>
                  <div className="text-xs text-blue-700">
                    Subject to availability. Original booking terms still apply.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => {
                setShowRescheduleModal(false);
                setRescheduleData({
                  newStartTime: '',
                  newStaffId: '',
                  reason: ''
                });
                setError(null);
              }}
              disabled={actionLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRescheduleBooking}
              disabled={actionLoading || !rescheduleData.newStartTime}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                <span>Reschedule Booking</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" />
            <span className="text-gray-600">Loading booking details...</span>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">Retry attempt {retryCount}</p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/profile/bookings"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to My Bookings
            </Link>

            {retrying && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Retrying...</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center min-h-[60vh]">
            <ErrorDisplay />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const entity = booking.entity;
  const store = booking.store;
  const service = booking.service;
  const isOffer = booking.isOfferBooking;
  const bookingTime = new Date(booking.startTime);
  const endTime = booking.endTime ? new Date(booking.endTime) : null;
  const isUpcoming = bookingTime > new Date();

  const displayName = entity?.title || entity?.name || 'Service Booking';
  const storeName = store?.name || 'Service Location';
  const storeLocation = store?.location || store?.address || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/profile/bookings"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to My Bookings
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRetry}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
              title="Refresh booking details"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={shareBooking}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {booking && retryCount > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-600">Booking details loaded successfully!</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-8 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {isOffer ? (
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Zap className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-lg font-medium text-orange-600">Offer Booking</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-lg font-medium text-blue-600">
                        {entity?.type === 'dynamic' ? 'Custom Service Booking' : 'Service Booking'}
                      </span>
                    </div>
                  )}

                  {entity?.featured && (
                    <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm">
                      <Star className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {displayName}
                </h1>

                {isOffer && service && (
                  <p className="text-gray-600 mb-3">Service: {service.name}</p>
                )}
              </div>

              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                {booking.status === 'checked_in' ? 'Checked In' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Date & Time</h3>
                <p className="text-gray-600">
                  {bookingTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600">
                  {bookingTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {endTime && ` - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Service Location</h3>
                <p className="text-gray-600">{storeName}</p>
                {storeLocation && (
                  <p className="text-gray-500 text-sm">{storeLocation}</p>
                )}
                {booking.branch && booking.branch.name !== storeName && (
                  <p className="text-gray-500 text-sm">Branch: {booking.branch.name}</p>
                )}
              </div>
            </div>

            {booking.staff && (
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Staff Member</h3>
                  <p className="text-gray-600">{booking.staff.name}</p>
                  {booking.staff.role && (
                    <p className="text-gray-500 text-sm">{booking.staff.role}</p>
                  )}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isOffer ? 'Offer Details' : 'Service Details'}
              </h3>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {displayName}
                </h4>

                {entity?.description && (
                  <p className="text-gray-600 text-sm mb-3">{entity.description}</p>
                )}

                {isOffer && (
                  <div className="space-y-2">
                    {entity?.discount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-medium text-red-600">{entity.discount}% OFF</span>
                      </div>
                    )}

                    {booking.accessFee && booking.accessFee > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Platform Access Fee:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">KES {parseFloat(booking.accessFee).toLocaleString()}</span>
                          {booking.accessFeePaid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock4 className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    )}

                    {(entity?.offerPrice || entity?.discounted_price) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Discounted Price:</span>
                        <span className="text-sm font-medium text-green-600">
                          KES {parseFloat(entity.offerPrice || entity.discounted_price).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {(entity?.originalPrice || entity?.original_price) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Original Price:</span>
                        <span className="text-sm text-gray-400 line-through">
                          KES {parseFloat(entity.originalPrice || entity.original_price).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {!isOffer && entity && (
                  <div className="space-y-2">
                    {entity.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="text-sm font-medium">
                          KES {parseFloat(entity.price).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {entity.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="text-sm">{entity.duration} minutes</span>
                      </div>
                    )}

                    {entity.type && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Service Type:</span>
                        <span className="text-sm capitalize">{entity.type}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {booking.payment && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {booking.payment.amount && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="text-sm font-medium">KES {parseFloat(booking.payment.amount).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.payment.method && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Method:</span>
                      <span className="text-sm uppercase">{booking.payment.method}</span>
                    </div>
                  )}
                  {booking.payment.status && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        booking.payment.status === 'completed' || booking.payment.status === 'successful'
                          ? 'bg-green-100 text-green-700'
                          : booking.payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {booking.payment.status.charAt(0).toUpperCase() + booking.payment.status.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(booking.notes || booking.specialRequests) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {booking.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{booking.notes}</p>
                    </div>
                  )}
                  {booking.specialRequests && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Special Requests:</span>
                      <p className="text-sm text-gray-600 mt-1">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(store?.phone_number || store?.phone || store?.email) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {(store.phone_number || store.phone) && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {store.phone_number || store.phone}
                      </span>
                    </div>
                  )}
                  {store.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">{store.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isUpcoming && ['confirmed', 'pending'].includes(booking.status) && (
              <div className="border-t pt-6">
                <div className="flex space-x-4">
                  {canCancelBooking() && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel Booking</span>
                    </button>
                  )}

                  {canRescheduleBooking() && (
                    <button
                      onClick={() => setShowRescheduleModal(true)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Reschedule</span>
                    </button>
                  )}
                </div>

                {!canCancelBooking() && booking.status === 'confirmed' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-yellow-900">Cancellation Not Available</div>
                        <div className="text-xs text-yellow-700">
                          This booking cannot be cancelled due to the cancellation policy. Contact the service provider for assistance.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {booking.status === 'completed' && (
              <div className="border-t pt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Booking Completed</span>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Thank you for using our service! We hope you had a great experience.
                  </p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    Leave a Review
                  </button>
                </div>
              </div>
            )}

            {booking.status === 'cancelled' && (
              <div className="border-t pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Booking Cancelled</span>
                  </div>
                  <p className="text-sm text-red-700">
                    This booking has been cancelled. If you need assistance, please contact support.
                  </p>
                  {booking.cancelReason && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-red-700">Reason:</span>
                      <p className="text-sm text-red-600">{booking.cancelReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showCancelModal && <CancelModal />}
        {showRescheduleModal && <RescheduleModal />}
      </div>

      <Footer />
    </div>
  );
};

export default BookingDetails;