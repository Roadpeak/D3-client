// MyBookingsEnhanced.js - Updated with enhanced service booking features

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, User, Phone, Mail,
  Filter, Search, RefreshCw, Edit3, X, AlertTriangle,
  CheckCircle, XCircle, Clock4, Loader2, Eye, MoreVertical,
  CreditCard, Smartphone, Zap, Building2, UserCheck,
  AlertCircle, Shield, Bell, Timer, Tag, Star
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import authService from '../../services/authService';
import enhancedBookingService from '../../services/enhancedBookingService';

const MyBookingsEnhanced = () => {
  const navigate = useNavigate();
  
  // ==================== STATE MANAGEMENT ====================
  
  // User and auth
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Bookings data
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  
  // Filters and pagination
  const [activeTab, setActiveTab] = useState('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all'); // all, offer, service
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // UI states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState(null);

  // Constants
  const ITEMS_PER_PAGE = 12;
  
  const statusOptions = [
    { value: 'all', label: 'All Status', count: 0 },
    { value: 'confirmed', label: 'Confirmed', count: 0 },
    { value: 'pending', label: 'Pending', count: 0 },
    { value: 'completed', label: 'Completed', count: 0 },
    { value: 'cancelled', label: 'Cancelled', count: 0 },
    { value: 'checked_in', label: 'Checked In', count: 0 } // NEW: Added check-in status
  ];

  const bookingTypeOptions = [
    { value: 'all', label: 'All Types', count: 0 },
    { value: 'offer', label: 'Offers', count: 0 },
    { value: 'service', label: 'Services', count: 0 }
  ];

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    const initializeBookings = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/accounts/sign-in');
          return;
        }

        const userResult = await authService.getCurrentUser();
        if (userResult.success) {
          setUser(userResult.data.user || userResult.data);
          await fetchBookings();
        } else {
          navigate('/accounts/sign-in');
        }
      } catch (error) {
        console.error('Error initializing bookings:', error);
        setError('Failed to load user information');
        navigate('/accounts/sign-in');
      } finally {
        setLoading(false);
      }
    };

    initializeBookings();
  }, [navigate]);

  // ==================== DATA FETCHING ====================

  const fetchBookings = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(bookingTypeFilter !== 'all' && { bookingType: bookingTypeFilter })
      };

      const result = await enhancedBookingService.getUserBookings(params);
      
      if (result.success) {
        setBookings(result.bookings || []);
        setTotalBookings(result.pagination?.total || 0);
        setTotalPages(result.pagination?.totalPages || 1);
        
        console.log('Bookings loaded:', {
          total: result.bookings?.length || 0,
          offers: result.summary?.offerBookings || 0,
          services: result.summary?.serviceBookings || 0,
          upcoming: result.summary?.upcomingBookings || 0
        });
      } else {
        throw new Error(result.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      if (refresh) setRefreshing(false);
    }
  }, [currentPage, statusFilter, bookingTypeFilter]);

  // ==================== FILTERING AND SEARCH ====================

  useEffect(() => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => {
        const entityName = booking.isOfferBooking 
          ? (booking.Offer?.title || booking.Offer?.service?.name)
          : booking.Service?.name;
        
        const storeName = booking.isOfferBooking
          ? booking.Offer?.service?.store?.name
          : booking.Service?.store?.name;
        
        const staffName = booking.Staff?.name;
        
        return (
          entityName?.toLowerCase().includes(term) ||
          storeName?.toLowerCase().includes(term) ||
          staffName?.toLowerCase().includes(term) ||
          booking.id?.toLowerCase().includes(term)
        );
      });
    }

    // Apply status filter for local filtering
    if (activeTab !== 'all') {
      filtered = filtered.filter(booking => {
        if (activeTab === 'upcoming') {
          return new Date(booking.startTime) > new Date() && 
                 ['confirmed', 'pending', 'checked_in'].includes(booking.status);
        }
        return booking.status === activeTab;
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, activeTab]);

  // Refetch when filters change
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [fetchBookings, user]);

  // ==================== BOOKING ACTIONS ====================

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      setActionLoading(true);
      setError(null);

      const result = await enhancedBookingService.cancelBooking(
        selectedBooking.id, 
        cancelReason,
        selectedBooking.isOfferBooking && selectedBooking.accessFeePaid
      );

      if (result.success) {
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancelReason('');
        await fetchBookings(true);
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

  const handleRescheduleBooking = (booking) => {
    // Navigate to booking page with rescheduling context
    if (booking.isOfferBooking) {
      navigate(`/book-offer/${booking.offerId}?reschedule=${booking.id}`);
    } else {
      navigate(`/booking/service/${booking.serviceId}?reschedule=${booking.id}`);
    }
  };

  const canCancelBooking = (booking) => {
    if (['cancelled', 'completed'].includes(booking.status)) return false;
    
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

  const canRescheduleBooking = (booking) => {
    if (['cancelled', 'completed', 'checked_in'].includes(booking.status)) return false;
    
    const bookingTime = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
    
    return hoursUntilBooking >= 1;
  };

  // Check if early check-in is allowed
  const canCheckInEarly = (booking) => {
    if (booking.isOfferBooking || booking.status !== 'confirmed') return false;
    
    const service = booking.Service;
    if (!service?.allow_early_checkin) return false;
    
    const bookingTime = new Date(booking.startTime);
    const now = new Date();
    const minutesUntilBooking = (bookingTime - now) / (1000 * 60);
    const earlyCheckinWindow = service.early_checkin_minutes || 15;
    
    return minutesUntilBooking <= earlyCheckinWindow && minutesUntilBooking >= -5;
  };

  // ==================== UI COMPONENTS ====================

  const BookingCard = ({ booking }) => {
    const isOffer = booking.isOfferBooking;
    const entity = isOffer ? booking.Offer : booking.Service;
    const store = isOffer ? booking.Offer?.service?.store : booking.Service?.store;
    const service = isOffer ? booking.Offer?.service : booking.Service;
    
    const bookingTime = new Date(booking.startTime);
    const isUpcoming = bookingTime > new Date();
    const isPast = bookingTime < new Date();
    
    const statusColors = {
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      checked_in: 'bg-purple-100 text-purple-700 border-purple-200' // NEW: Check-in status
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        {/* Header with type indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {isOffer ? (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">Offer Booking</span>
                {booking.accessFeePaid && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Paid
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {entity?.type === 'dynamic' ? 'Custom Service' : 'Service Booking'}
                </span>
                {entity?.featured && (
                  <Star className="w-3 h-3 text-yellow-500" />
                )}
              </div>
            )}
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}>
            {booking.status === 'checked_in' ? 'Checked In' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {entity?.title || entity?.name}
            </h3>
            
            {/* Enhanced service information */}
            {!isOffer && entity && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {entity.type === 'fixed' && entity.price && (
                  <span className="text-sm font-medium text-blue-600">
                    KES {entity.price.toLocaleString()}
                  </span>
                )}
                {entity.type === 'dynamic' && (
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {entity.price_range || 'Custom Quote'}
                  </span>
                )}
                {entity.duration && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {entity.duration}min
                  </span>
                )}
              </div>
            )}

            {/* Offer information */}
            {isOffer && entity?.discount && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  {entity.discount}% OFF
                </span>
                <span className="text-sm text-gray-600">
                  {entity.offerPrice || entity.discounted_price}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {entity.originalPrice || entity.original_price}
                </span>
              </div>
            )}
          </div>

          {/* Service info for offers */}
          {isOffer && service && (
            <div className="text-sm text-gray-600">
              Service: {service.name}
            </div>
          )}

          {/* NEW: Enhanced service booking settings display */}
          {!isOffer && entity && (
            <div className="flex flex-wrap gap-1">
              {entity.auto_confirm_bookings && (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Auto-Confirm
                </span>
              )}
              {entity.require_prepayment && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  Prepaid
                </span>
              )}
              {entity.allow_early_checkin && (
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Early Check-in
                </span>
              )}
              {entity.auto_complete_on_duration && (
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  Auto-Complete
                </span>
              )}
            </div>
          )}

          {/* DateTime */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{bookingTime.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Location */}
          {store && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{store.name}</span>
              {booking.Branch && (
                <span className="text-gray-400">• {booking.Branch.name}</span>
              )}
            </div>
          )}

          {/* Staff */}
          {booking.Staff && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <UserCheck className="w-4 h-4" />
              <span>{booking.Staff.name}</span>
              {booking.Staff.role && (
                <span className="text-gray-400">({booking.Staff.role})</span>
              )}
            </div>
          )}

          {/* Access fee info for offers */}
          {isOffer && booking.accessFee > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <CreditCard className="w-4 h-4" />
              <span>Access Fee: KES {booking.accessFee}</span>
              {booking.accessFeePaid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Clock4 className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          )}

          {/* NEW: Booking confirmation status for services */}
          {!isOffer && entity && booking.status === 'pending' && !entity.auto_confirm_bookings && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-yellow-900">Awaiting Confirmation</div>
                  <div className="text-xs text-yellow-700">The store will review and confirm your booking within 24 hours</div>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Check-in information */}
          {!isOffer && booking.status === 'confirmed' && canCheckInEarly(booking) && (
            <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <UserCheck className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-purple-900">Early Check-in Available</div>
                  <div className="text-xs text-purple-700">
                    You can check in up to {entity?.early_checkin_minutes || 15} minutes early
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {isUpcoming && ['confirmed', 'pending'].includes(booking.status) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {canRescheduleBooking(booking) && (
                  <button
                    onClick={() => handleRescheduleBooking(booking)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Reschedule</span>
                  </button>
                )}
                
                {canCancelBooking(booking) && (
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowCancelModal(true);
                    }}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}

                {/* NEW: Check-in button for services */}
                {!isOffer && booking.status === 'confirmed' && canCheckInEarly(booking) && (
                  <button
                    onClick={() => {
                      // Handle check-in logic here
                      console.log('Check in to booking:', booking.id);
                    }}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Check In</span>
                  </button>
                )}
              </div>

                <button
                  onClick={() => navigate(`/booking-details/${booking.id}`)}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  View Details
                </button>
            </div>
          </div>
        )}

        {/* Checked in status */}
        {booking.status === 'checked_in' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-purple-600">
                <UserCheck className="w-4 h-4" />
                <span className="text-sm font-medium">Checked in - Service in progress</span>
              </div>
              <button
                onClick={() => navigate(`/bookings/${booking.id}`)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        )}

        {/* Completed booking actions */}
        {booking.status === 'completed' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {isOffer ? 'Enjoyed your offer?' : 'How was your service?'}
              </span>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Leave Review
                </button>
                <button
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const FilterTabs = () => {
    const tabs = [
      { id: 'all', label: 'All Bookings', count: totalBookings },
      { id: 'upcoming', label: 'Upcoming', count: filteredBookings.filter(b => new Date(b.startTime) > new Date()).length },
      { id: 'confirmed', label: 'Confirmed', count: filteredBookings.filter(b => b.status === 'confirmed').length },
      { id: 'pending', label: 'Pending', count: filteredBookings.filter(b => b.status === 'pending').length },
      { id: 'checked_in', label: 'Checked In', count: filteredBookings.filter(b => b.status === 'checked_in').length },
      { id: 'completed', label: 'Completed', count: filteredBookings.filter(b => b.status === 'completed').length },
      { id: 'cancelled', label: 'Cancelled', count: filteredBookings.filter(b => b.status === 'cancelled').length }
    ];

    return (
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
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
              setSelectedBooking(null);
              setCancelReason('');
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {selectedBooking && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="font-medium">
              {selectedBooking.isOfferBooking 
                ? selectedBooking.Offer?.title 
                : selectedBooking.Service?.name}
            </div>
            <div className="text-sm text-gray-600">
              {new Date(selectedBooking.startTime).toLocaleString()}
            </div>
            {/* NEW: Show cancellation policy */}
            {!selectedBooking.isOfferBooking && selectedBooking.Service?.cancellation_policy && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                <strong>Cancellation Policy:</strong> {selectedBooking.Service.cancellation_policy}
              </div>
            )}
          </div>
        )}

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

        {selectedBooking?.isOfferBooking && selectedBooking?.accessFeePaid && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Refund may be available for cancellations 24+ hours in advance
              </span>
            </div>
          </div>
        )}

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
              setSelectedBooking(null);
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

  // ==================== MAIN RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            <span className="text-gray-600">Loading your bookings...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link 
              to="/profile" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Profile
            </Link>
          </div>
          
          <button
            onClick={() => fetchBookings(true)}
            disabled={refreshing}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Page Title and Summary */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">
                Manage your service appointments and offer bookings
              </p>
            </div>
            
            {totalBookings > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{totalBookings}</div>
                <div className="text-sm text-gray-500">Total Bookings</div>
              </div>
            )}
          </div>

          {/* Filters and Search */}
          <div className="space-y-4 mb-6">
            <FilterTabs />
            
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                value={bookingTypeFilter}
                onChange={(e) => setBookingTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="offer">Offer Bookings</option>
                <option value="service">Service Bookings</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Bookings Grid */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || activeTab !== 'all' ? 'No bookings found' : 'No bookings yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search or filters'
                  : 'Start booking services and offers to see them here'
                }
              </p>
              {!searchTerm && activeTab === 'all' && (
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={() => navigate('/offers')}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Browse Offers
                  </button>
                  <button 
                    onClick={() => navigate('/services')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Book Services
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && <CancelModal />}
      
      <Footer />
    </div>
  );
};

export default MyBookingsEnhanced;