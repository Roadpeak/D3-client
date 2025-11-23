import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import userServiceRequestService from '../services/userServiceRequestService';
import authService from '../services/authService';
import { ChevronLeft, ChevronRight } from 'lucide-react';


// SVG Icons (keeping the same as before)
const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Plus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const Star = ({ className }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const DollarSign = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const MessageSquare = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const Filter = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const ExternalLink = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
  </div>
);

// Skeleton Components
const RequestCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
    {/* Header */}
    <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="flex gap-1">
        <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
    {/* Content */}
    <div className="p-3">
      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      {/* Budget and timeline */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-600 rounded mb-1" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
          <div className="h-3 w-14 bg-gray-200 dark:bg-gray-600 rounded mb-1" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
      </div>
    </div>
    {/* Footer */}
    <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
    </div>
  </div>
);

const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    {/* Hero Section Skeleton */}
    <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center animate-pulse">
            <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-12 w-56 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    </section>

    {/* Filter Section Skeleton */}
    <section className="container mx-auto px-4 py-6">
      <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 animate-pulse">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    </section>

    {/* Main Content Skeleton */}
    <section className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg ml-1" />
          <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg ml-1" />
        </div>
      </div>

      {/* Request Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <RequestCardSkeleton key={i} />
        ))}
      </div>
    </section>
  </div>
);

export default function UserServiceRequestPage() {
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

  // User authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Data states
  const [serviceCategories, setServiceCategories] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [userOffers, setUserOffers] = useState([]);
  const [userPastRequests, setUserPastRequests] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Count states for proper tab counts
  const [offersPagination, setOffersPagination] = useState({});
  const [pastRequestsPagination, setPastRequestsPagination] = useState({});

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Simplified currency formatter since backend now returns KSH
  const formatCurrency = (value) => {
    return value || 'KSH 0'; // Backend already formats it, just return as-is
  };

  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    budget: 'all',
    timeline: 'all',
    location: '',
    page: 1,
    limit: 6
  });

  // Filter visibility state for mobile
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({});

  // Form states
  const [requestForm, setRequestForm] = useState({
    title: '',
    category: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    timeline: '',
    location: '',
    requirements: [],
    priority: 'normal'
  });

  const [offerForm, setOfferForm] = useState({
    quotedPrice: '',
    message: '',
    availability: ''
  });

  // Check authentication state
  const checkAuthState = useCallback(async () => {
    try {
      setIsAuthenticated(userServiceRequestService.isAuthenticated());

      if (userServiceRequestService.isAuthenticated()) {
        const result = await authService.getCurrentUser();
        if (result.success) {
          setCurrentUser(result.data);
          localStorage.setItem('currentUser', JSON.stringify(result.data));
          localStorage.setItem('userType', 'user');
        } else {
          console.warn('Failed to get current user:', result.message);
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  // Load initial data (NO DUMMY DATA FALLBACKS)
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading initial data...');

      const [categoriesRes, statsRes] = await Promise.all([
        userServiceRequestService.getServiceCategories(),
        userServiceRequestService.getPlatformStatistics()
      ]);

      console.log('Initial data loaded:', {
        categories: categoriesRes.data?.length || 0,
        stats: !!statsRes.data
      });

      setServiceCategories(categoriesRes.data || []);
      setStatistics(statsRes.data || {});
      await loadServiceRequests();
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load service requests (NO DUMMY DATA FALLBACKS)
  const loadServiceRequests = async () => {
    try {
      setLoadingRequests(true);
      setError(null);

      console.log('Loading service requests with filters:', filters);

      const response = await userServiceRequestService.getPublicServiceRequests(filters);

      console.log('Service requests loaded:', {
        count: response.data?.requests?.length || 0,
        pagination: response.data?.pagination
      });

      setServiceRequests(response.data?.requests || []);
      setPagination(response.data?.pagination || {});
    } catch (err) {
      console.error('Error loading service requests:', err);
      setError(err.message);
      setServiceRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load user offers 
  const loadUserOffers = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingOffers(true);
      setError(null);

      console.log('Loading user offers...');

      const response = await userServiceRequestService.getUserOffers(filters);

      console.log('User offers loaded:', {
        count: response.data?.offers?.length || 0,
        pagination: response.data?.pagination
      });

      setUserOffers(response.data?.offers || []);
      setOffersPagination(response.data?.pagination || {});
    } catch (err) {
      console.error('Error loading user offers:', err);
      setError(err.message);
      setUserOffers([]);
      setOffersPagination({});
    } finally {
      setLoadingOffers(false);
    }
  };

  // Load user past requests 
  const loadUserPastRequests = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingRequests(true);
      setError(null);

      console.log('Loading user past requests...');

      const response = await userServiceRequestService.getUserPastRequests(filters);

      console.log('User past requests loaded:', {
        count: response.data?.requests?.length || 0,
        pagination: response.data?.pagination
      });

      setUserPastRequests(response.data?.requests || []);
      setPastRequestsPagination(response.data?.pagination || {});
    } catch (err) {
      console.error('Error loading user past requests:', err);
      setError(err.message);
      setUserPastRequests([]);
      setPastRequestsPagination({});
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load initial data and authenticated user's counts
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load counts for authenticated tabs on initial load
  useEffect(() => {
    if (isAuthenticated) {
      // Load counts for offers and past requests on initial load
      loadUserOffers();
      loadUserPastRequests();
    }
  }, [isAuthenticated]);

  // Load data when filters or tab changes
  useEffect(() => {
    if (activeTab === 'all') {
      loadServiceRequests();
    } else if (activeTab === 'offers' && isAuthenticated) {
      loadUserOffers();
    } else if (activeTab === 'past' && isAuthenticated) {
      loadUserPastRequests();
    }
  }, [filters, activeTab, isAuthenticated]);

  // Get accurate counts for tabs
  const getOffersCount = () => {
    // Use pagination total count if available, otherwise fall back to array length
    return offersPagination.totalCount || userOffers.length || 0;
  };

  const getPastRequestsCount = () => {
    // Use pagination total count if available, otherwise fall back to array length
    return pastRequestsPagination.totalCount || userPastRequests.length || 0;
  };

  // Event handlers
  const handleTabChange = (tab) => {
    if ((tab === 'offers' || tab === 'past') && !isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleRequestFormShow = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setShowRequestForm(true);
  };

  const handleOfferFormShow = (requestId) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedRequestId(requestId);
    setShowOfferForm(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // New function to handle view details
  const handleViewDetails = (request) => {
    setSelectedRequestDetails(request);
    setShowDetailsModal(true);
  };

  const handleRequestFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Validate form data
      const validationErrors = userServiceRequestService.validateServiceRequestData(requestForm);
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n${validationErrors.join('\n')}`);
        return;
      }

      await userServiceRequestService.createServiceRequest(requestForm);

      setShowRequestForm(false);
      setRequestForm({
        title: '', category: '', description: '', budgetMin: '', budgetMax: '',
        timeline: '', location: '', requirements: [], priority: 'normal'
      });

      await loadServiceRequests();
      alert('Service request posted successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOfferFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Validate form data
      const validationErrors = userServiceRequestService.validateOfferData(offerForm);
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n${validationErrors.join('\n')}`);
        return;
      }

      await userServiceRequestService.createIndividualOffer(selectedRequestId, offerForm);

      setShowOfferForm(false);
      setOfferForm({ quotedPrice: '', message: '', availability: '' });
      setSelectedRequestId(null);

      alert('Offer submitted successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Fixed accept offer with proper request ID
  const handleAcceptOffer = async (offerId, requestId) => {
    setConfirmMessage('Are you sure you want to accept this offer? This action cannot be undone and will reject all other offers.');
    setConfirmAction(() => async () => {
      try {
        setSubmitting(true);
        await userServiceRequestService.acceptOffer(offerId, requestId);
        await loadUserOffers();
        alert('Offer accepted successfully! The service provider has been notified.');
      } catch (err) {
        alert(`Error: ${err.message}`);
      } finally {
        setSubmitting(false);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // Fixed reject offer with proper request ID
  const handleRejectOffer = async (offerId, requestId, reason = '') => {
    try {
      setSubmitting(true);
      await userServiceRequestService.rejectOffer(offerId, requestId, reason);
      await loadUserOffers();
      alert('Offer rejected successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // FIXED: Handle view store functionality with navigation
  const handleViewStore = (storeDetails) => {
    if (!storeDetails || !storeDetails.id) {
      alert('Store information not available');
      return;
    }

    // Navigate to store page instead of opening in new tab
    navigate(`/Store/${storeDetails.id}`);
  };

  const handleRequirementChange = (requirement, checked) => {
    setRequestForm(prev => ({
      ...prev,
      requirements: checked
        ? [...prev.requirements, requirement]
        : prev.requirements.filter(req => req !== requirement)
    }));
  };

  const getTimelineLabel = (timeline) => {
    const timelineMap = {
      'urgent': 'ASAP/Urgent', 'thisweek': 'This Week', 'nextweek': 'Next Week',
      'thismonth': 'This Month', 'flexible': 'Flexible'
    };
    return timelineMap[timeline] || timeline;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertCircle },
      'accepted': { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleLogin = () => {
    window.location.href = '/accounts/sign-in';
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
            <button onClick={loadInitialData} className="mt-2 bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-700">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Modern Compact Hero Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center px-4 sm:px-0">
              <button
                onClick={handleRequestFormShow}
                className="bg-red-600 dark:bg-red-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 w-full sm:w-auto text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Post Service Request</span>
              </button>

              <a
                href="/search"
                className="bg-yellow-400 dark:bg-yellow-500 text-gray-900 dark:text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-yellow-500 dark:hover:bg-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 w-full sm:w-auto text-sm sm:text-base"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Browse Discounted Services</span>
              </a>
            </div>

            {/* Auth status for development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
                User Auth: {isAuthenticated ? `Logged in (${currentUser?.firstName || 'Unknown'})` : 'Not logged in'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile-Friendly Filter Bar */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-200">
          {/* Filter Header - Always Visible */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">Filters</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full transition-colors duration-200">
                {pagination.totalCount || 0} requests
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <span className="text-sm font-medium">
                  {showFilters ? 'Hide' : 'Show'} Filters
                </span>
                <div className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Filter Options - Collapsible on Mobile, Always Visible on Desktop */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block border-t border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200`}>
            <div className="flex flex-col lg:flex-row gap-4">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
              >
                <option value="all">All Categories</option>
                {serviceCategories.map((cat, index) => (
                  <option key={index} value={cat.name}>{cat.name}</option>
                ))}
              </select>

              <select
                value={filters.budget}
                onChange={(e) => handleFilterChange('budget', e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
              >
                <option value="all">All Budgets</option>
                <option value="0-1000">KSH 0 - 1000</option>
                <option value="1000-10000">KSH 1000 - 10000</option>
                <option value="10000-50000">KSH 10000 - 50000</option>
                <option value="50000+">KSH 50000+</option>
              </select>

              <select
                value={filters.timeline}
                onChange={(e) => handleFilterChange('timeline', e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
              >
                <option value="all">All Timelines</option>
                <option value="urgent">ASAP/Urgent</option>
                <option value="thisweek">This Week</option>
                <option value="nextweek">Next Week</option>
                <option value="thismonth">This Month</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Requests</h2>

          {/* Modern Tab Navigation with Fixed Counts */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 transition-colors duration-200">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'all'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
              All ({serviceRequests.length})
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => handleTabChange('offers')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'offers'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                >
                  My Offers ({getOffersCount()})
                </button>
                <button
                  onClick={() => handleTabChange('past')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'past'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                >
                  Past ({getPastRequestsCount()})
                </button>
              </>
            )}
          </div>
        </div>

        {/* All Requests Tab - Updated with social post style */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {loadingRequests ? (
              <LoadingSpinner />
            ) : serviceRequests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">No service requests found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Be the first to post a service request!</p>
                <button
                  onClick={handleRequestFormShow}
                  className="bg-blue-600 dark:bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 font-medium transition-colors text-sm"
                >
                  Post Request
                </button>
              </div>
            ) : (
              serviceRequests.map((request) => (
                <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
                  {/* Header with user info */}
                  <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      {request.postedBy?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{request.postedBy}</h4>
                        {request.verified && (
                          <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span className="text-[10px]">Verified</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 flex-wrap">
                        <span>{request.postedTime}</span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full inline-block"></span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{request.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-auto flex items-center gap-1 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${request.priority === 'urgent'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                        }`}>
                        {request.priority}
                      </span>

                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                        {request.category}
                      </span>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="p-3">
                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-1">{request.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{request.description}</p>

                    {/* Requirements tags */}
                    {request.requirements && request.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {request.requirements.map((req, index) => (
                          <span key={index} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs rounded-md flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {req}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Budget and timeline info */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-0.5 text-xs">
                          <DollarSign className="w-3 h-3" />
                          <span>Budget</span>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{request.budget}</div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-0.5 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Timeline</span>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{getTimelineLabel(request.timeline)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer with actions */}
                  <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-xs font-medium">{request.offers} offers</span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Star className="w-3 h-3 text-amber-400 dark:text-amber-500" />
                        <span className="text-xs">{request.status}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetails(request)}
                      className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Modern Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={!pagination.hasPrev}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + Math.max(1, pagination.currentPage - 2);
                  return pageNum <= pagination.totalPages ? (
                    <button
                      key={pageNum}
                      onClick={() => handleFilterChange('page', pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${pageNum === pagination.currentPage
                        ? 'bg-blue-600 dark:bg-blue-700 text-white'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ) : null;
                })}

                <button
                  onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, filters.page + 1))}
                  disabled={!pagination.hasNext}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* My Offers Tab with View Store functionality */}
        {activeTab === 'offers' && isAuthenticated && (
          <div className="space-y-4">
            {loadingOffers ? (
              <LoadingSpinner />
            ) : userOffers.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No offers yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Offers from service providers will appear here when they respond to your requests.</p>
                <button
                  onClick={() => handleTabChange('all')}
                  className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-800 font-medium transition-colors"
                >
                  Browse Requests
                </button>
              </div>
            ) : (
              userOffers.map((offer) => (
                <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                  <div className="p-4">
                    {/* Mobile-optimized header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{offer.storeName || offer.providerName}</h3>
                            {offer.verified && (
                              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                            {getStatusBadge(offer.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-amber-400 dark:text-amber-500 mr-1" />
                              <span className="font-medium">{offer.rating || 0}</span>
                              <span className="ml-1">({offer.reviews || 0})</span>
                            </div>
                            {offer.responseTime && (
                              <>
                                <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
                                <span>{offer.responseTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{offer.price}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Quoted Price</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-3">
                      <p className="text-gray-700 dark:text-gray-300 italic mb-2 text-sm">"{offer.message}"</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {offer.availability && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400"><span className="font-medium">Available:</span> {offer.availability}</span>
                          </div>
                        )}
                        {offer.estimatedDuration && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400"><span className="font-medium">Duration:</span> {offer.estimatedDuration}</span>
                          </div>
                        )}
                        {offer.includesSupplies && (
                          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-500 col-span-full">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium text-sm">Includes supplies and materials</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Offer for: <span className="font-medium text-gray-700 dark:text-gray-300">{offer.requestTitle}</span>
                      </div>
                    </div>

                    {/* BUTTON LAYOUT */}
                    <div className="space-y-2">
                      {/* Row 1: View Store (if available) */}
                      {offer.storeDetails && (
                        <button
                          onClick={() => handleViewStore(offer.storeDetails)}
                          className="w-full px-3 py-2.5 border border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium flex items-center justify-center space-x-2 transition-colors text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View Store</span>
                        </button>
                      )}

                      {/* Row 2: Reject + Accept (only if pending) */}
                      {offer.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleRejectOffer(offer.id, offer.requestId)}
                            className="w-full px-3 py-2.5 border border-red-500 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 font-medium transition-colors text-sm"
                            disabled={submitting}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAcceptOffer(offer.id, offer.requestId)}
                            className="w-full px-3 py-2.5 bg-emerald-600 dark:bg-emerald-700 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-800 font-medium transition-colors text-sm"
                            disabled={submitting}
                          >
                            {submitting ? 'Accepting...' : 'Accept'}
                          </button>
                        </div>
                      )}

                      {/* Accepted status badge (full width if accepted) */}
                      {offer.status === 'accepted' && (
                        <div className="w-full px-3 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-lg font-medium text-center text-sm">
                          Accepted
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Past Requests Tab - NO DUMMY DATA */}
        {activeTab === 'past' && isAuthenticated && (
          <div className="space-y-4">
            {loadingRequests ? (
              <LoadingSpinner />
            ) : userPastRequests.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No past requests</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Your completed and cancelled service requests will appear here.</p>
                <button
                  onClick={() => handleTabChange('all')}
                  className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-800 font-medium transition-colors"
                >
                  Browse Requests
                </button>
              </div>
            ) : (
              userPastRequests.map((request) => (
                <div key={request.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{request.title}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{request.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{request.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <DollarSign className="w-4 h-4" />
                            <span>{request.budget}</span>
                          </div>
                        </div>

                        {request.acceptedOffer && (
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mb-4">
                            <h4 className="font-medium text-emerald-800 dark:text-emerald-400 mb-2">Accepted Offer</h4>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-emerald-700 dark:text-emerald-400 font-medium">{request.acceptedOffer.storeName}</p>
                                <p className="text-emerald-600 dark:text-emerald-500 text-sm">Final Price: {request.acceptedOffer.price}</p>
                              </div>
                              {request.acceptedOffer.rating && (
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-amber-400 dark:text-amber-500 mr-1" />
                                  <span className="text-sm font-medium">{request.acceptedOffer.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                              {request.category}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {request.offers} offer{request.offers !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Details Modal */}
      {showDetailsModal && selectedRequestDetails && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Request Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedRequestDetails.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedRequestDetails.priority === 'urgent'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                    }`}>
                    {selectedRequestDetails.priority}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                    {selectedRequestDetails.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedRequestDetails.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Service Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">Category:</span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                        {selectedRequestDetails.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-500 dark:text-gray-400">Location:</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedRequestDetails.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedRequestDetails.budget}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-500 dark:text-gray-400">Timeline:</span>
                      <span className="text-gray-900 dark:text-gray-100">{getTimelineLabel(selectedRequestDetails.timeline)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Request Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-500 dark:text-gray-400">Posted by:</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedRequestDetails.postedBy}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-500 dark:text-gray-400">Posted:</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedRequestDetails.postedTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-500 dark:text-gray-400">Offers received:</span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {selectedRequestDetails.offers || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequestDetails.requirements && selectedRequestDetails.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequestDetails.requirements.map((req, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequestDetails.acceptedOffer && (
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Accepted Offer</h4>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-700 dark:text-emerald-400 font-medium">{selectedRequestDetails.acceptedOffer.storeName}</p>
                        <p className="text-emerald-600 dark:text-emerald-500 text-sm">Final Price: {selectedRequestDetails.acceptedOffer.price}</p>
                      </div>
                      {selectedRequestDetails.acceptedOffer.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-amber-400 dark:text-amber-500 mr-1" />
                          <span className="text-sm font-medium">{selectedRequestDetails.acceptedOffer.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Post a Service Request</h2>
                <button onClick={() => setShowRequestForm(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors">
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleRequestFormSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Service Category *</label>
                <select
                  value={requestForm.category}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                  required
                >
                  <option value="">Select a category</option>
                  {serviceCategories.map((cat, index) => (
                    <option key={index} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Service Title *</label>
                <input
                  type="text"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Briefly describe what service you need"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Description *</label>
                <textarea
                  rows="4"
                  value={requestForm.description}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed description of your requirements..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Min Budget (KSH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={requestForm.budgetMin}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, budgetMin: e.target.value }))}
                    placeholder="Minimum budget"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Max Budget (KSH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={requestForm.budgetMax}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, budgetMax: e.target.value }))}
                    placeholder="Maximum budget"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Timeline *</label>
                <select
                  value={requestForm.timeline}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, timeline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                  required
                >
                  <option value="">When do you need this?</option>
                  <option value="urgent">ASAP/Urgent</option>
                  <option value="thisweek">This Week</option>
                  <option value="nextweek">Next Week</option>
                  <option value="thismonth">This Month</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Location *</label>
                <input
                  type="text"
                  value={requestForm.location}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter your location"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Priority</label>
                <select
                  value={requestForm.priority}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Special Requirements</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Licensed', 'Insurance', 'References', 'Portfolio'].map((req) => (
                    <label key={req} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={requestForm.requirements.includes(req)}
                        onChange={(e) => handleRequirementChange(req, e.target.checked)}
                        className="mr-2 text-indigo-600 dark:text-indigo-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{req} required</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-800 dark:hover:to-purple-800 disabled:opacity-50 transition-colors"
                  disabled={submitting}
                >
                  {submitting ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Form Modal */}
      {showOfferForm && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Make an Offer</h2>
                <button onClick={() => setShowOfferForm(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors">
                  ×
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">You're making an individual offer as a service provider</p>
            </div>

            <form onSubmit={handleOfferFormSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quoted Price (KSH) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={offerForm.quotedPrice}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, quotedPrice: e.target.value }))}
                  placeholder="Enter your price quote"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Message *</label>
                <textarea
                  rows="4"
                  value={offerForm.message}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your offer, experience, and why you're the best choice..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Availability *</label>
                <input
                  type="text"
                  value={offerForm.availability}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, availability: e.target.value }))}
                  placeholder="When can you start? (e.g., Tomorrow, This weekend, Next week)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-300 dark:focus:border-indigo-600 transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowOfferForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-800 dark:hover:to-purple-800 disabled:opacity-50 transition-colors"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl transition-colors duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Login Required</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please login to access this feature and manage your service requests.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl transition-colors duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Confirm Action</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{confirmMessage}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-700 dark:to-pink-700 text-white rounded-xl hover:from-red-700 hover:to-pink-700 dark:hover:from-red-800 dark:hover:to-pink-800 transition-colors"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}