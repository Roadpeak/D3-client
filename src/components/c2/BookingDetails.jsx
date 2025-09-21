// BookingDetails.jsx - Enhanced with better error handling and retry mechanism

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
  const [errorType, setErrorType] = useState(null); // 'network', 'server', 'notFound', 'permission'
  const [retryCount, setRetryCount] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  // Enhanced fetch booking details with retry logic
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

      console.log('Fetching booking details for:', bookingId);
      const result = await enhancedBookingService.getBookingById(bookingId);
      
      if (result.success && result.booking) {
        setBooking(result.booking);
        setRetryCount(0);
        console.log('Booking loaded successfully:', result.booking.id);
      } else {
        // Handle different error types
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
      
      // Categorize error types
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
      }, Math.pow(2, retryCount) * 1000); // Exponential backoff: 1s, 2s, 4s

      return () => clearTimeout(timer);
    }
  }, [errorType, retryCount, fetchBookingDetails]);

  // Initial load
  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, fetchBookingDetails]);

  // Manual retry function
  const handleRetry = () => {
    setRetryCount(0);
    fetchBookingDetails(true);
  };

  // Navigate to booking list
  const handleGoToBookings = () => {
    navigate('/bookings');
  };

  // Cancel booking handler
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
        // Refresh booking data
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

  // Copy booking ID to clipboard
  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopySuccess('Booking ID copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy booking ID:', err);
    }
  };

  // Share booking details
  const shareBooking = async () => {
    if (navigator.share && booking) {
      try {
        await navigator.share({
          title: `Booking: ${booking.isOfferBooking ? booking.Offer?.title : booking.Service?.name}`,
          text: `My booking for ${new Date(booking.startTime).toLocaleDateString()}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  // Check if booking can be cancelled
  const canCancelBooking = () => {
    if (!booking || ['cancelled', 'completed'].includes(booking.status)) return false;
    
    const bookingTime = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
    
    // Use service-specific cancellation policy
    let minCancellationHours = 2; // Default
    if (!booking.isOfferBooking && booking.Service?.min_cancellation_hours) {
      minCancellationHours = booking.Service.min_cancellation_hours;
    }
    
    return hoursUntilBooking >= minCancellationHours;
  };

  // Check if booking can be rescheduled
  const canRescheduleBooking = () => {
    if (!booking || ['cancelled', 'completed', 'checked_in'].includes(booking.status)) return false;
    
    const bookingTime = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
    
    return hoursUntilBooking >= 1;
  };

  // Status color mapping
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

  // Error display component
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

  // Loading state
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

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link 
              to="/bookings" 
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

  const isOffer = booking.isOfferBooking;
  const entity = isOffer ? booking.Offer : booking.Service;
  const store = isOffer ? booking.Offer?.service?.store : booking.Service?.store;
  const service = isOffer ? booking.Offer?.service : booking.Service;
  const bookingTime = new Date(booking.startTime);
  const endTime = booking.endTime ? new Date(booking.endTime) : null;
  const isUpcoming = bookingTime > new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            to="/bookings" 
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

        {/* Success message if booking was recovered */}
        {booking && retryCount > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-600">Booking details loaded successfully!</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Booking Header */}
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
                  {entity?.title || entity?.name}
                </h1>

                {isOffer && service && (
                  <p className="text-gray-600 mb-3">Service: {service.name}</p>
                )}

                {/* Booking ID */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-gray-500">Booking ID:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{booking.id}</code>
                  <button
                    onClick={copyBookingId}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy booking ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copySuccess && <span className="text-green-600 text-xs">{copySuccess}</span>}
                </div>
              </div>

              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                {booking.status === 'checked_in' ? 'Checked In' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </div>
            </div>
          </div>

          {/* Rest of the component remains the same as original */}
          {/* ... (keeping the existing booking details content) ... */}
        </div>

        {/* Cancel Modal remains the same */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* ... (keeping the existing cancel modal) ... */}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BookingDetails;