// MyBookingsEnhanced.js - Fixed version with proper CancelModal component

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, MapPin, User, Phone, Mail,
  Filter, Search, RefreshCw, Edit3, X, AlertTriangle,
  CheckCircle, XCircle, Clock4, Loader2, Eye, MoreVertical,
  CreditCard, Smartphone, Zap, Building2, UserCheck,
  // Add missing import for Info icon
  AlertCircle, Shield, Bell, Timer, Tag, Star, Info
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import authService from '../../services/authService';
import enhancedBookingService from '../../services/enhancedBookingService';

const MyBookingsEnhanced = () => {
  const navigate = useNavigate();

  // ==================== STATE MANAGEMENT ====================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({
    newStartTime: '',
    newStaffId: '',
    reason: ''
  });
  const [error, setError] = useState(null);

  const ITEMS_PER_PAGE = 12;

  // ==================== HELPER FUNCTIONS ====================
  
  // Enhanced function to determine if booking is an offer booking
  const isOfferBooking = (booking) => {
    if (!booking) return false;
    
    // Multiple ways to detect offer bookings
    return !!(
      booking.isOfferBooking ||
      booking.offerId ||
      booking.Offer ||
      booking.offer ||
      booking.bookingType === 'offer' ||
      booking.type === 'offer'
    );
  };

  // Get entity (offer or service) from booking
  const getBookingEntity = (booking) => {
    if (!booking) return null;
    
    const isOffer = isOfferBooking(booking);
    
    if (isOffer) {
      return booking.Offer || booking.offer || null;
    } else {
      return booking.Service || booking.service || null;
    }
  };

  // Get store information from booking
  const getBookingStore = (booking) => {
    if (!booking) return null;
    
    const entity = getBookingEntity(booking);
    if (!entity) return null;
    
    const isOffer = isOfferBooking(booking);
    
    if (isOffer) {
      // For offers: store is nested under service
      return entity.service?.store || entity.service?.Store || entity.Service?.store || null;
    } else {
      // For services: store is direct property
      return entity.store || entity.Store || null;
    }
  };

  // Get service information (for both offers and direct services)
  const getBookingService = (booking) => {
    if (!booking) return null;
    
    if (isOfferBooking(booking)) {
      const offer = getBookingEntity(booking);
      return offer?.service || offer?.Service || null;
    } else {
      return getBookingEntity(booking);
    }
  };

  // Format booking data for consistent display
  const formatBookingData = (booking) => {
    if (!booking) return null;

    const isOffer = isOfferBooking(booking);
    const entity = getBookingEntity(booking);
    const store = getBookingStore(booking);
    const service = getBookingService(booking);

    return {
      ...booking,
      isOfferBooking: isOffer,
      entity,
      store,
      service,
      // Ensure consistent datetime format
      startTime: booking.startTime || booking.start_time || booking.date,
      endTime: booking.endTime || booking.end_time,
      // Ensure consistent status
      status: booking.status || 'pending',
      // Staff information
      staff: booking.Staff || booking.staff || null,
      // Branch information
      branch: booking.Branch || booking.branch || null,
      // Payment information
      accessFee: booking.accessFee || booking.access_fee || 0,
      accessFeePaid: booking.accessFeePaid || booking.access_fee_paid || false
    };
  };

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

      console.log('Fetching bookings with params:', {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        bookingType: bookingTypeFilter !== 'all' ? bookingTypeFilter : undefined
      });

      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(bookingTypeFilter !== 'all' && { bookingType: bookingTypeFilter })
      };

      const result = await enhancedBookingService.getUserBookings(params);
      console.log('Raw booking API response:', result);

      if (result.success) {
        const rawBookings = result.bookings || result.data || [];
        console.log('Raw bookings array:', rawBookings);
        
        // Format each booking for consistent data structure
        const formattedBookings = rawBookings.map(booking => {
          const formatted = formatBookingData(booking);
          console.log('Original booking:', booking);
          console.log('Formatted booking:', formatted);
          return formatted;
        }).filter(Boolean); // Remove any null results

        setBookings(formattedBookings);
        setTotalBookings(result.pagination?.total || formattedBookings.length);
        setTotalPages(result.pagination?.totalPages || Math.ceil(formattedBookings.length / ITEMS_PER_PAGE));

        console.log('Final processed bookings:', {
          total: formattedBookings.length,
          offerBookings: formattedBookings.filter(b => b.isOfferBooking).length,
          serviceBookings: formattedBookings.filter(b => !b.isOfferBooking).length,
          sample: formattedBookings[0]
        });
      } else {
        console.warn('Booking fetch failed:', result);
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
        const entity = booking.entity;
        const entityName = entity?.title || entity?.name || '';
        const storeName = booking.store?.name || '';
        const staffName = booking.staff?.name || '';
        const bookingId = booking.id || '';

        return (
          entityName.toLowerCase().includes(term) ||
          storeName.toLowerCase().includes(term) ||
          staffName.toLowerCase().includes(term) ||
          bookingId.toLowerCase().includes(term)
        );
      });
    }

    // Apply tab filter
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
    console.log('Filtered bookings:', {
      originalCount: bookings.length,
      filteredCount: filtered.length,
      activeTab,
      searchTerm
    });
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

  const handleRescheduleBooking = async () => {
    if (!selectedBooking || !rescheduleData.newStartTime) return;

    try {
      setActionLoading(true);
      setError(null);

      const result = await enhancedBookingService.rescheduleBooking(
        selectedBooking.id,
        rescheduleData
      );

      if (result.success) {
        setShowRescheduleModal(false);
        setSelectedBooking(null);
        setRescheduleData({
          newStartTime: '',
          newStaffId: '',
          reason: ''
        });
        await fetchBookings(true);
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

  const canCancelBooking = (booking) => {
    if (['cancelled', 'completed'].includes(booking.status)) return false;

    const bookingTime = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);

    let minCancellationHours = 2; // Default
    if (!booking.isOfferBooking && booking.entity?.min_cancellation_hours) {
      minCancellationHours = booking.entity.min_cancellation_hours;
    }

    return hoursUntilBooking >= minCancellationHours;
  };

  const canRescheduleBooking = (booking) => {
    if (!booking || ['cancelled', 'completed', 'checked_in'].includes(booking.status)) return false;

    const bookingTime = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);

    return hoursUntilBooking >= 1;
  };

  // ==================== UI COMPONENTS ====================

  const BookingCard = ({ booking }) => {
    if (!booking) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-gray-500">Invalid booking data</div>
        </div>
      );
    }

    const entity = booking.entity;
    const store = booking.store;
    const service = booking.service;
    const isOffer = booking.isOfferBooking;

    console.log('Rendering BookingCard:', {
      bookingId: booking.id,
      isOffer,
      entity,
      store,
      service,
      status: booking.status
    });

    const bookingTime = new Date(booking.startTime);
    const isUpcoming = bookingTime > new Date();

    const statusColors = {
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      checked_in: 'bg-purple-100 text-purple-700 border-purple-200'
    };

    // Fallback display name
    const displayName = entity?.title || entity?.name || 'Unknown Service';
    const storeName = store?.name || 'Unknown Store';

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {isOffer ? (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">Offer Booking</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">Service Booking</span>
              </div>
            )}
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {booking.status === 'checked_in' ? 'Checked In' : 
             booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {displayName}
            </h3>

            {/* Service information */}
            {entity && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {!isOffer && entity.price && (
                  <span className="text-sm font-medium text-blue-600">
                    KES {parseFloat(entity.price).toLocaleString()}
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
                {entity.offerPrice && (
                  <span className="text-sm text-gray-600">
                    KES {parseFloat(entity.offerPrice).toLocaleString()}
                  </span>
                )}
                {entity.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    KES {parseFloat(entity.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Service info for offers */}
          {isOffer && service && (
            <div className="text-sm text-gray-600">
              Service: {service.name}
            </div>
          )}

          {/* DateTime */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>
                {bookingTime.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {bookingTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{storeName}</span>
            {booking.branch && (
              <span className="text-gray-400">• {booking.branch.name}</span>
            )}
          </div>

          {/* Staff */}
          {booking.staff && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <UserCheck className="w-4 h-4" />
              <span>{booking.staff.name}</span>
              {booking.staff.role && (
                <span className="text-gray-400">({booking.staff.role})</span>
              )}
            </div>
          )}

          {/* Access fee info for offers */}
          {isOffer && booking.accessFee > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <CreditCard className="w-4 h-4" />
              <span>Access Fee: KES {parseFloat(booking.accessFee).toLocaleString()}</span>
              {booking.accessFeePaid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Clock4 className="w-4 h-4 text-yellow-500" />
              )}
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
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowRescheduleModal(true);
                    }}
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
                  onClick={() => navigate(`/booking-details/${booking.id}`)}
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

    // Mobile: Show only primary tabs, others in dropdown
    const primaryTabs = tabs.filter(tab => ['all', 'upcoming', 'confirmed'].includes(tab.id));
    const secondaryTabs = tabs.filter(tab => !['all', 'upcoming', 'confirmed'].includes(tab.id));

    return (
      <div className="space-y-3">
        {/* Primary tabs - always visible */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {primaryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors text-sm ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Secondary tabs - horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max">
            {secondaryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const RescheduleModal = () => {
    // Generate time options for next 7 days
    const generateTimeSlots = () => {
      const slots = [];
      const now = new Date();
      
      for (let day = 1; day <= 7; day++) {
        const date = new Date(now);
        date.setDate(now.getDate() + day);
        
        // Generate slots from 9 AM to 6 PM
        for (let hour = 9; hour <= 18; hour++) {
          const slotDate = new Date(date);
          slotDate.setHours(hour, 0, 0, 0);
          
          slots.push({
            value: slotDate.toISOString().slice(0, 19), // Format: YYYY-MM-DDTHH:mm:ss
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
                setSelectedBooking(null);
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

          {selectedBooking && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">
                {selectedBooking.entity?.title || selectedBooking.entity?.name || 'Booking'}
              </div>
              <div className="text-sm text-gray-600">
                Current: {new Date(selectedBooking.startTime).toLocaleString()}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* New Time Selection */}
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

            {/* Reason */}
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

            {/* Info Notice */}
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
                setSelectedBooking(null);
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

  const CancelModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Cancel Booking</h3>
            <button
              onClick={() => {
                setShowCancelModal(false);
                setSelectedBooking(null);
                setCancelReason('');
                setError(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {selectedBooking && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">
                {selectedBooking.entity?.title || selectedBooking.entity?.name || 'Booking'}
              </div>
              <div className="text-sm text-gray-600">
                {new Date(selectedBooking.startTime).toLocaleString()}
              </div>
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
                setError(null);
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
  };

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
          {/* Page Title */}
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

      {/* Reschedule Modal */}
      {showRescheduleModal && <RescheduleModal />}

      <Footer />
    </div>
  );
};

export default MyBookingsEnhanced; 