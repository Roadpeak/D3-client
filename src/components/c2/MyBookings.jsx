// MyBookingsEnhanced.js - Dark mode enabled version

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, MapPin, User, Phone, Mail,
  Filter, Search, RefreshCw, Edit3, X, AlertTriangle,
  CheckCircle, XCircle, Clock4, Loader2, Eye, MoreVertical,
  CreditCard, Smartphone, Zap, Building2, UserCheck,
  AlertCircle, Shield, Bell, Timer, Tag, Star, Info
} from 'lucide-react';
import moment from 'moment';
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
          return moment.utc(booking.startTime).local().isAfter(moment()) &&
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

    const bookingTime = moment.utc(booking.startTime).local();
    const now = moment();
    const hoursUntilBooking = bookingTime.diff(now, 'hours', true);

    let minCancellationHours = 2; // Default
    if (!booking.isOfferBooking && booking.entity?.min_cancellation_hours) {
      minCancellationHours = booking.entity.min_cancellation_hours;
    }

    return hoursUntilBooking >= minCancellationHours;
  };

  const canRescheduleBooking = (booking) => {
    if (!booking || ['cancelled', 'completed', 'checked_in'].includes(booking.status)) return false;

    const bookingTime = moment.utc(booking.startTime).local();
    const now = moment();
    const hoursUntilBooking = bookingTime.diff(now, 'hours', true);

    return hoursUntilBooking >= 1;
  };

  // ==================== UI COMPONENTS ====================

  const BookingCard = ({ booking }) => {
    if (!booking) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-gray-500 dark:text-gray-400">Invalid booking data</div>
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

    // Parse UTC time and convert to local timezone
    const bookingTime = moment.utc(booking.startTime).local();
    const isUpcoming = bookingTime.isAfter(moment());

    const statusColors = {
      confirmed: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
      completed: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
      cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
      checked_in: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700'
    };

    // Fallback display name
    const displayName = entity?.title || entity?.name || 'Unknown Service';
    const storeName = store?.name || 'Unknown Store';

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group">
        {/* Status Bar - Colored top border */}
        <div className={`h-1.5 ${
          booking.status === 'confirmed' ? 'bg-gradient-to-r from-green-400 to-green-600' :
          booking.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
          booking.status === 'completed' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
          booking.status === 'cancelled' ? 'bg-gradient-to-r from-red-400 to-red-600' :
          booking.status === 'checked_in' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
          'bg-gray-300 dark:bg-gray-600'
        }`} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {isOffer ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg border border-orange-200 dark:border-orange-700">
                  <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-bold text-orange-700 dark:text-orange-300">HOT DEAL</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">SERVICE</span>
                </div>
              )}
            </div>

            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${statusColors[booking.status] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>
              {booking.status === 'checked_in' ? 'CHECKED IN' :
                booking.status.toUpperCase()}
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {displayName}
              </h3>

              {/* Service information */}
              {entity && (
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {!isOffer && entity.price && (
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                      KES {parseFloat(entity.price).toLocaleString()}
                    </span>
                  )}
                  {entity.duration && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <Clock className="w-3 h-3" />
                      {entity.duration}min
                    </span>
                  )}
                </div>
              )}

              {/* Offer information */}
              {isOffer && entity?.discount && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {entity.discount}% OFF
                  </span>
                  {entity.offerPrice && (
                    <span className="text-base font-bold text-green-600 dark:text-green-400">
                      KES {parseFloat(entity.offerPrice).toLocaleString()}
                    </span>
                  )}
                  {entity.originalPrice && (
                    <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                      KES {parseFloat(entity.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Service info for offers */}
            {isOffer && service && (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg">
                <span className="font-medium">Service:</span> {service.name}
              </div>
            )}

            {/* DateTime */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-1">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {bookingTime.format('MMM D, YYYY')}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-1">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {bookingTime.format('hh:mm A')}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="font-medium truncate">{storeName}</span>
              {booking.branch && (
                <span className="text-gray-400 dark:text-gray-500">• {booking.branch.name}</span>
              )}
            </div>

            {/* Staff */}
            {booking.staff && (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg">
                <UserCheck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium">{booking.staff.name}</span>
                {booking.staff.role && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                    {booking.staff.role}
                  </span>
                )}
              </div>
            )}

            {/* Access fee info for offers */}
            {isOffer && booking.accessFee > 0 && (
              <div className="flex items-center justify-between text-sm bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 px-3 py-2 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Access Fee: KES {parseFloat(booking.accessFee).toLocaleString()}
                  </span>
                </div>
                {booking.accessFeePaid ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">PAID</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Clock4 className="w-4 h-4" />
                    <span className="text-xs font-bold">PENDING</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {isUpcoming && ['confirmed', 'pending'].includes(booking.status) && (
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  {canRescheduleBooking(booking) && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowRescheduleModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium transition-colors"
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
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/booking-details/${booking.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          )}

          {/* Completed booking actions */}
          {booking.status === 'completed' && (
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isOffer ? 'Enjoyed your offer?' : 'How was your service?'}
                </span>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg text-sm font-medium transition-all shadow-md">
                    <Star className="w-4 h-4" />
                    <span>Leave Review</span>
                  </button>
                  <button
                    onClick={() => navigate(`/booking-details/${booking.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FilterTabs = () => {
    const tabs = [
      { id: 'all', label: 'All Bookings', count: totalBookings },
      { id: 'upcoming', label: 'Upcoming', count: filteredBookings.filter(b => moment.utc(b.startTime).local().isAfter(moment())).length },
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
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {primaryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-blue-600 dark:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab.id ? 'bg-blue-500 dark:bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reschedule Booking</h3>
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
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {selectedBooking && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="font-medium text-gray-900 dark:text-white">
                {selectedBooking.entity?.title || selectedBooking.entity?.name || 'Booking'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Current: {moment.utc(selectedBooking.startTime).local().format('MMM D, YYYY [at] hh:mm A')}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* New Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Date & Time *
              </label>
              <select
                value={rescheduleData.newStartTime}
                onChange={(e) => setRescheduleData(prev => ({
                  ...prev,
                  newStartTime: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for rescheduling (optional)
              </label>
              <textarea
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Let us know why you're rescheduling..."
              />
            </div>

            {/* Info Notice */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Rescheduling Policy</div>
                  <div className="text-xs text-blue-700 dark:text-blue-400">
                    Subject to availability. Original booking terms still apply.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
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
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRescheduleBooking}
              disabled={actionLoading || !rescheduleData.newStartTime}
              className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Booking</h3>
            <button
              onClick={() => {
                setShowCancelModal(false);
                setSelectedBooking(null);
                setCancelReason('');
                setError(null);
              }}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {selectedBooking && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="font-medium text-gray-900 dark:text-white">
                {selectedBooking.entity?.title || selectedBooking.entity?.name || 'Booking'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {moment.utc(selectedBooking.startTime).local().format('MMM D, YYYY [at] hh:mm A')}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for cancellation (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Let us know why you're cancelling..."
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
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
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={actionLoading}
              className="flex-1 bg-red-600 dark:bg-red-700 text-white py-3 rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="animate-spin w-10 h-10 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">Loading your bookings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/profile"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>

            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Page Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Bookings</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Manage your appointments and track your bookings
              </p>
            </div>

            {totalBookings > 0 && (
              <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalBookings}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Bookings</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6">

            {/* Filters and Search */}
            <div className="space-y-4 mb-6">
              <FilterTabs />

              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                  />
                </div>

                <select
                  value={bookingTypeFilter}
                  onChange={(e) => setBookingTypeFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="offer">Offer Bookings</option>
                  <option value="service">Service Bookings</option>
                </select>
              </div>
            </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-600 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}

            {/* Bookings Grid */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {searchTerm || activeTab !== 'all' ? 'No bookings found' : 'No bookings yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchTerm
                    ? 'Try adjusting your search or filters'
                    : 'Start booking services and offers to see them here'
                  }
                </p>
                {!searchTerm && activeTab === 'all' && (
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button
                      onClick={() => navigate('/hotdeals')}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md font-medium"
                    >
                      <Zap className="w-5 h-5" />
                      <span>Browse Hot Deals</span>
                    </button>
                    <button
                      onClick={() => navigate('/stores')}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md font-medium"
                    >
                      <Building2 className="w-5 h-5" />
                      <span>Explore Services</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
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
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                          ? 'bg-blue-600 dark:bg-blue-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
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
      </div>

      {/* Cancel Modal */}
      {showCancelModal && <CancelModal />}

      {/* Reschedule Modal */}
      {showRescheduleModal && <RescheduleModal />}
    </div>
  );
};

export default MyBookingsEnhanced;