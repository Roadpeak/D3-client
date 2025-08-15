import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import userServiceRequestService from '../services/userServiceRequestService';
import authService from '../services/authService';

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
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
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

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    budget: 'all',
    timeline: 'all',
    location: '',
    page: 1,
    limit: 6 // Changed to 6 items per page
  });

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

  // ✅ Load initial data (NO DUMMY DATA FALLBACKS)
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading initial data...');

      const [categoriesRes, statsRes] = await Promise.all([
        userServiceRequestService.getServiceCategories(),
        userServiceRequestService.getPlatformStatistics()
      ]);

      console.log('✅ Initial data loaded:', {
        categories: categoriesRes.data?.length || 0,
        stats: !!statsRes.data
      });

      setServiceCategories(categoriesRes.data || []);
      setStatistics(statsRes.data || {});
      await loadServiceRequests();
    } catch (err) {
      console.error('❌ Error loading initial data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load service requests (NO DUMMY DATA FALLBACKS)
  const loadServiceRequests = async () => {
    try {
      setLoadingRequests(true);
      setError(null);
      
      console.log('🔄 Loading service requests with filters:', filters);
      
      const response = await userServiceRequestService.getPublicServiceRequests(filters);
      
      console.log('✅ Service requests loaded:', {
        count: response.data?.requests?.length || 0,
        pagination: response.data?.pagination
      });

      setServiceRequests(response.data?.requests || []);
      setPagination(response.data?.pagination || {});
    } catch (err) {
      console.error('❌ Error loading service requests:', err);
      setError(err.message);
      setServiceRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  // ✅ Load user offers 
  const loadUserOffers = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingOffers(true);
      setError(null);

      console.log('🔄 Loading user offers...');
      
      const response = await userServiceRequestService.getUserOffers(filters);
      
      console.log('✅ User offers loaded:', {
        count: response.data?.offers?.length || 0,
        pagination: response.data?.pagination
      });

      setUserOffers(response.data?.offers || []);
      setPagination(response.data?.pagination || {});
    } catch (err) {
      console.error('❌ Error loading user offers:', err);
      setError(err.message);
      setUserOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  };

  // ✅ Load user past requests 
  const loadUserPastRequests = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingRequests(true);
      setError(null);

      console.log('🔄 Loading user past requests...');
      
      const response = await userServiceRequestService.getUserPastRequests(filters);
      
      console.log('✅ User past requests loaded:', {
        count: response.data?.requests?.length || 0,
        pagination: response.data?.pagination
      });

      setUserPastRequests(response.data?.requests || []);
      setPagination(response.data?.pagination || {});
    } catch (err) {
      console.error('❌ Error loading user past requests:', err);
      setError(err.message);
      setUserPastRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

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

  // ✅ Fixed accept offer with proper request ID
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

  // ✅ Fixed reject offer with proper request ID
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

  // ✅ FIXED: Handle view store functionality with navigation
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
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      'accepted': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800', icon: XCircle }
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
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner />
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
            <button onClick={loadInitialData} className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-red-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Need a Service?</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Post your service request and get competitive quotes from verified professional service providers in your area
          </p>
          <button
            onClick={handleRequestFormShow}
            className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Post Service Request</span>
          </button>

          {/* Auth status for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-sm opacity-75">
              User Auth: {isAuthenticated ? `Logged in (${currentUser?.firstName || 'Unknown'})` : 'Not logged in'}
            </div>
          )}
        </div>
      </section>

      {/* Filter Bar */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-gray-200 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              {serviceCategories.map((cat, index) => (
                <option key={index} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select
              value={filters.budget}
              onChange={(e) => handleFilterChange('budget', e.target.value)}
              className="border border-gray-200 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Budgets</option>
              <option value="0-100">$0 - $100</option>
              <option value="100-300">$100 - $300</option>
              <option value="300-500">$300 - $500</option>
              <option value="500+">$500+</option>
            </select>
            <select
              value={filters.timeline}
              onChange={(e) => handleFilterChange('timeline', e.target.value)}
              className="border border-gray-200 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Timelines</option>
              <option value="urgent">ASAP/Urgent</option>
              <option value="thisweek">This Week</option>
              <option value="nextweek">Next Week</option>
              <option value="thismonth">This Month</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{pagination.totalCount || 0}</span> active requests
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Service Requests</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'all' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All Requests ({serviceRequests.length})
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => handleTabChange('offers')}
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'offers' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  My Offers ({userOffers.length})
                </button>
                <button
                  onClick={() => handleTabChange('past')}
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'past' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Past Requests ({userPastRequests.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* All Requests Tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {loadingRequests ? (
              <LoadingSpinner />
            ) : serviceRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">No service requests found</div>
                <p className="text-gray-600 mb-6">Be the first to post a service request!</p>
                <button onClick={handleRequestFormShow} className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-medium">
                  Post First Request
                </button>
              </div>
            ) : (
              serviceRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold">{request.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {request.priority}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {request.status.toUpperCase()}
                          </span>
                          {request.verified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Verified User
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{request.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{request.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{request.budget}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{getTimelineLabel(request.timeline)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>by {request.postedBy}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{request.postedTime}</span>
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-red-600">
                                {request.offers} offer{request.offers !== 1 ? 's' : ''} received
                              </span>
                            </div>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {request.category}
                            </span>
                          </div>

                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewDetails(request)}
                              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium"
                            >
                              View Details
                            </button>
                            {/* Removed Make Offer button */}
                          </div>
                        </div>
                      </div>
                    </div>

                    {request.requirements && request.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-600 mr-2">Requirements:</span>
                        {request.requirements.map((req, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + Math.max(1, pagination.currentPage - 2);
                    return pageNum <= pagination.totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => handleFilterChange('page', pageNum)}
                        className={`px-3 py-2 rounded-lg ${pageNum === pagination.currentPage
                          ? 'bg-red-500 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  })}
                </div>

                <button
                  onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, filters.page + 1))}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* ✅ FIXED: My Offers Tab with View Store functionality */}
        {activeTab === 'offers' && isAuthenticated && (
          <div className="space-y-6">
            {loadingOffers ? (
              <LoadingSpinner />
            ) : userOffers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">No offers yet</div>
                <p className="text-gray-600 mb-6">Offers from service providers will appear here when they respond to your requests.</p>
                <button onClick={() => handleTabChange('all')} className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-medium">
                  Browse Requests
                </button>
              </div>
            ) : (
              userOffers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{offer.storeName || offer.providerName}</h3>
                            {offer.verified && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                            )}
                            {getStatusBadge(offer.status)}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="font-medium">{offer.rating || 0}</span>
                            </div>
                            <span>({offer.reviews || 0} reviews)</span>
                            <span className="text-gray-400">•</span>
                            <span>{offer.responseTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{offer.price}</div>
                        <div className="text-sm text-gray-500">Quoted Price</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 italic">"{offer.message}"</p>
                      {offer.availability && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Availability:</span> {offer.availability}
                        </div>
                      )}
                      {offer.estimatedDuration && (
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Duration:</span> {offer.estimatedDuration}
                        </div>
                      )}
                      {offer.includesSupplies && (
                        <div className="mt-1 text-sm text-green-600">
                          ✓ Includes supplies and materials
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Offer for: <span className="font-medium text-gray-700">{offer.requestTitle}</span>
                      </div>
                      <div className="flex space-x-2">
                        {/* ✅ FIXED: View Store Button with navigation */}
                        {offer.storeDetails && (
                          <button
                            onClick={() => handleViewStore(offer.storeDetails)}
                            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 font-medium flex items-center space-x-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View Store</span>
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleViewDetails(offer)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          View Details
                        </button>
                        
                        {offer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleRejectOffer(offer.id, offer.requestId)}
                              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium"
                              disabled={submitting}
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAcceptOffer(offer.id, offer.requestId)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                              disabled={submitting}
                            >
                              {submitting ? 'Accepting...' : 'Accept Offer'}
                            </button>
                          </>
                        )}
                        
                        {offer.status === 'accepted' && (
                          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                            ✓ Accepted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ✅ FIXED: Past Requests Tab - NO DUMMY DATA */}
        {activeTab === 'past' && isAuthenticated && (
          <div className="space-y-6">
            {loadingRequests ? (
              <LoadingSpinner />
            ) : userPastRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">No past requests</div>
                <p className="text-gray-600 mb-6">Your completed and cancelled service requests will appear here.</p>
                <button onClick={() => handleTabChange('all')} className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-medium">
                  Browse Requests
                </button>
              </div>
            ) : (
              userPastRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold">{request.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{request.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{request.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{request.budget}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Completed: {request.completedAt ? new Date(request.completedAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>

                        {request.acceptedOffer && (
                          <div className="bg-green-50 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-green-800 mb-2">Accepted Offer</h4>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-green-700 font-medium">{request.acceptedOffer.storeName}</p>
                                <p className="text-green-600 text-sm">Final Price: {request.acceptedOffer.price}</p>
                              </div>
                              {request.acceptedOffer.rating && (
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                  <span className="text-sm font-medium">{request.acceptedOffer.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {request.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {request.offers} offer{request.offers !== 1 ? 's' : ''} received
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewDetails(request)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                              View Details
                            </button>
                            {request.status === 'completed' && !request.finalRating && (
                              <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 font-medium">
                                Rate & Review
                              </button>
                            )}
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

      {/* Statistics Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with verified service providers and get the best deals for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {statistics.totalProviders?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-600">Verified Providers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {statistics.completedRequests?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-600">Completed Requests</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {statistics.averageRating?.toFixed(1) || '0'}★
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {statistics.activeRequests?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-600">Active Requests</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Details Modal */}
      {showDetailsModal && selectedRequestDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Request Details</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-semibold">{selectedRequestDetails.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedRequestDetails.priority === 'urgent' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedRequestDetails.priority}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedRequestDetails.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600">{selectedRequestDetails.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Service Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Category:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {selectedRequestDetails.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Location:</span>
                      <span>{selectedRequestDetails.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Budget:</span>
                      <span>{selectedRequestDetails.budget}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Timeline:</span>
                      <span>{getTimelineLabel(selectedRequestDetails.timeline)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Request Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Posted by:</span>
                      <span>{selectedRequestDetails.postedBy}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Posted:</span>
                      <span>{selectedRequestDetails.postedTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Offers received:</span>
                      <span className="font-medium text-red-600">
                        {selectedRequestDetails.offers || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequestDetails.requirements && selectedRequestDetails.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequestDetails.requirements.map((req, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequestDetails.acceptedOffer && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Accepted Offer</h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-700 font-medium">{selectedRequestDetails.acceptedOffer.storeName}</p>
                        <p className="text-green-600 text-sm">Final Price: {selectedRequestDetails.acceptedOffer.price}</p>
                      </div>
                      {selectedRequestDetails.acceptedOffer.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{selectedRequestDetails.acceptedOffer.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Post a Service Request</h2>
                <button onClick={() => setShowRequestForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleRequestFormSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Category *</label>
                <select
                  value={requestForm.category}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                >
                  <option value="">Select a category</option>
                  {serviceCategories.map((cat, index) => (
                    <option key={index} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Title *</label>
                <input
                  type="text"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Briefly describe what service you need"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  rows="4"
                  value={requestForm.description}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed description of your requirements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={requestForm.budgetMin}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, budgetMin: e.target.value }))}
                    placeholder="Minimum budget"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={requestForm.budgetMax}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, budgetMax: e.target.value }))}
                    placeholder="Maximum budget"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeline *</label>
                <select
                  value={requestForm.timeline}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, timeline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={requestForm.location}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter your location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={requestForm.priority}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                <div className="space-y-2">
                  {['Licensed', 'Insurance', 'References', 'Portfolio'].map((req) => (
                    <label key={req} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={requestForm.requirements.includes(req)}
                        onChange={(e) => handleRequirementChange(req, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">{req} required</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Form Modal (for individual service providers) */}
      {showOfferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Make an Offer</h2>
                <button onClick={() => setShowOfferForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ×
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-1">You're making an individual offer as a service provider</p>
            </div>

            <form onSubmit={handleOfferFormSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quoted Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={offerForm.quotedPrice}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, quotedPrice: e.target.value }))}
                  placeholder="Enter your price quote"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  rows="4"
                  value={offerForm.message}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your offer, experience, and why you're the best choice..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability *</label>
                <input
                  type="text"
                  value={offerForm.availability}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, availability: e.target.value }))}
                  placeholder="When can you start? (e.g., Tomorrow, This weekend, Next week)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowOfferForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">
                Please login to access this feature and manage your service requests.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Confirm Action</h2>
              <p className="text-gray-600 mb-6">{confirmMessage}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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