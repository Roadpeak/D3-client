import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Custom SVG Icons
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

const Briefcase = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
  </div>
);

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// Auth helper functions
const getAuthToken = () => localStorage.getItem('authToken');
const isAuthenticated = () => !!getAuthToken();
const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

const api = {
  // Get all service requests (PUBLIC - no auth required)
  getServiceRequests: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value);
      }
    });

    const headers = { 'Content-Type': 'application/json' };
    if (isAuthenticated()) {
      headers['Authorization'] = `Bearer ${getAuthToken()}`;
    }

    const response = await fetch(`${API_BASE_URL}/service-requests?${queryParams}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch service requests');
    return response.json();
  },

  // Get service categories (PUBLIC)
  getServiceCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/service-requests/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // Create new service request (PRIVATE)
  createServiceRequest: async (requestData) => {
    if (!isAuthenticated()) throw new Error('Please login to post a service request');

    const response = await fetch(`${API_BASE_URL}/service-requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create service request');
    }
    return response.json();
  },

  // Get user offers (PRIVATE)
  getUserOffers: async (page = 1, limit = 10) => {
    if (!isAuthenticated()) throw new Error('Please login to view your offers');

    const response = await fetch(`${API_BASE_URL}/service-requests/offers?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch offers');
    return response.json();
  },

  // Get user's past requests (PRIVATE)
  getUserPastRequests: async (page = 1, limit = 10) => {
    if (!isAuthenticated()) throw new Error('Please login to view your past requests');

    const response = await fetch(`${API_BASE_URL}/service-requests/my-requests?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch past requests');
    return response.json();
  },

  // Create offer for a request (PRIVATE)
  createOffer: async (requestId, offerData) => {
    if (!isAuthenticated()) throw new Error('Please login to make an offer');

    const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}/offers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(offerData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create offer');
    }
    return response.json();
  },

  // Accept offer (PRIVATE)
  acceptOffer: async (offerId) => {
    if (!isAuthenticated()) throw new Error('Please login to accept offers');

    const response = await fetch(`${API_BASE_URL}/offers/${offerId}/accept`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to accept offer');
    }
    return response.json();
  },

  // Get platform statistics (PUBLIC)
  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/service-requests/statistics`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  }
};

export default function ServiceRequestPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Authentication state
  const [user, setUser] = useState(getCurrentUser());
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  // Data states
  const [serviceCategories, setServiceCategories] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [userOffers, setUserOffers] = useState([]);
  const [userPastRequests, setUserPastRequests] = useState([]);
  const [statistics, setStatistics] = useState({});

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    budget: 'all',
    timeline: 'all',
    location: '',
    page: 1,
    limit: 10
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

  // Load initial data function
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesRes, statsRes] = await Promise.all([
        api.getServiceCategories().catch(() => ({
          success: true,
          data: [
            { name: 'Home Services', icon: '🏠', count: 45, color: 'bg-blue-100 text-blue-800' },
            { name: 'Auto Services', icon: '🚗', count: 32, color: 'bg-green-100 text-green-800' },
            { name: 'Beauty & Wellness', icon: '💄', count: 28, color: 'bg-pink-100 text-pink-800' },
            { name: 'Tech Support', icon: '💻', count: 15, color: 'bg-purple-100 text-purple-800' },
            { name: 'Event Services', icon: '🎉', count: 22, color: 'bg-yellow-100 text-yellow-800' },
            { name: 'Tutoring', icon: '📚', count: 18, color: 'bg-indigo-100 text-indigo-800' },
            { name: 'Fitness', icon: '💪', count: 12, color: 'bg-orange-100 text-orange-800' },
            { name: 'Photography', icon: '📸', count: 9, color: 'bg-teal-100 text-teal-800' }
          ]
        })),
        api.getStatistics().catch(() => ({
          success: true,
          data: { totalProviders: 2500, completedRequests: 15000, averageRating: 4.8, activeRequests: 500 }
        }))
      ]);

      setServiceCategories(categoriesRes.data || []);
      setStatistics(statsRes.data || {});
      await loadServiceRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load service requests function
  const loadServiceRequests = async () => {
    try {
      setError(null);
      const response = await api.getServiceRequests(filters).catch(() => ({
        success: true,
        data: {
          requests: [
            {
              id: 'demo-1',
              title: "Need house cleaning service",
              description: "Looking for a reliable cleaning service for my 3-bedroom house.",
              category: "Home Services",
              budget: "$100 - $150",
              location: "Nairobi, Kenya",
              timeline: "thisweek",
              postedBy: "John Doe",
              postedTime: "2 hours ago",
              priority: "normal",
              status: "open",
              offers: 3,
              verified: true,
              requirements: ["Insurance", "References"]
            }
          ],
          pagination: { currentPage: 1, totalPages: 1, totalCount: 1, hasNext: false, hasPrev: false }
        }
      }));

      setServiceRequests(response.data.requests || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError(err.message);
    }
  };

  const loadUserOffers = async () => {
    if (!authenticated) return;

    try {
      const response = await api.getUserOffers(filters.page, filters.limit).catch(() => ({
        success: true,
        data: {
          offers: [
            {
              id: 'offer-1',
              providerId: 'provider-1',
              requestId: 'demo-1',
              storeName: 'Mike Johnson Cleaning Services',
              storeId: 'store-1',
              rating: 4.8,
              reviews: 127,
              price: '$120',
              message: 'We provide professional cleaning services with all supplies included. Our team has 5+ years of experience.',
              responseTime: '1 hour ago',
              verified: true,
              requestTitle: 'Need house cleaning service',
              status: 'pending',
              availability: 'This weekend'
            }
          ],
          pagination: { currentPage: 1, totalPages: 1, totalCount: 1, hasNext: false, hasPrev: false }
        }
      }));
      setUserOffers(response.data.offers || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError(err.message);
    }
  };

  const loadUserPastRequests = async () => {
    if (!authenticated) return;

    try {
      const response = await api.getUserPastRequests(filters.page, filters.limit).catch(() => ({
        success: true,
        data: {
          requests: [
            {
              id: 'past-1',
              title: "House cleaning completed",
              description: "Professional cleaning service for 3-bedroom house",
              category: "Home Services",
              budget: "$120",
              location: "Nairobi, Kenya",
              completedDate: "2025-07-10",
              acceptedOffer: {
                storeName: "Mike Johnson Cleaning Services",
                storeId: "store-1",
                price: "$120",
                rating: 5,
                providerName: "Mike Johnson"
              },
              status: "completed"
            }
          ],
          pagination: { currentPage: 1, totalPages: 1, totalCount: 1, hasNext: false, hasPrev: false }
        }
      }));
      setUserPastRequests(response.data.requests || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError(err.message);
    }
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    if (activeTab === 'all') {
      loadServiceRequests();
    } else if (activeTab === 'offers' && authenticated) {
      loadUserOffers();
    } else if (activeTab === 'past' && authenticated) {
      loadUserPastRequests();
    }
  }, [filters, activeTab, authenticated]);

  const handleTabChange = (tab) => {
    if ((tab === 'offers' || tab === 'past') && !authenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleRequestFormShow = () => {
    if (!authenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setShowRequestForm(true);
  };

  const handleOfferFormShow = (requestId) => {
    if (!authenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedRequestId(requestId);
    setShowOfferForm(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleRequestFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createServiceRequest(requestForm);
      setShowRequestForm(false);
      setRequestForm({
        title: '', category: '', description: '', budgetMin: '', budgetMax: '',
        timeline: '', location: '', requirements: [], priority: 'normal'
      });
      await loadServiceRequests();
      alert('Service request posted successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOfferFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createOffer(selectedRequestId, offerForm);
      setShowOfferForm(false);
      setOfferForm({ quotedPrice: '', message: '', availability: '' });
      setSelectedRequestId(null);
      alert('Offer submitted successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      setSubmitting(true);
      await api.acceptOffer(offerId);
      await loadUserOffers();
      alert('Offer accepted successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
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
            Post your service request and get competitive quotes from verified professionals in your area
          </p>
          <button
            onClick={handleRequestFormShow}
            className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Post Service Request</span>
          </button>
        </div>
      </section>

      {/* Service Categories */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Browse Service Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {serviceCategories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleFilterChange('category', category.name)}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-semibold text-sm mb-1 group-hover:text-red-600">{category.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${category.color}`}>
                {category.count} requests
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Bar */}
      <section className="container mx-auto px-4 py-4">
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
              All Requests
            </button>
            {authenticated && (
              <>
                <button
                  onClick={() => handleTabChange('offers')}
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'offers' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  My Offers
                </button>
                <button
                  onClick={() => handleTabChange('past')}
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'past' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Past Requests
                </button>
              </>
            )}
          </div>
        </div>

        {/* All Requests Tab (PUBLIC) */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {serviceRequests.length === 0 ? (
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
                            <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium">
                              View Details
                            </button>
                            <button
                              onClick={() => handleOfferFormShow(request.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                              disabled={request.status !== 'open'}
                            >
                              Make Offer
                            </button>
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

        {/* My Offers Tab (PRIVATE) */}
        {activeTab === 'offers' && authenticated && (
          <div className="space-y-6">
            {userOffers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">No offers yet</div>
                <p className="text-gray-600 mb-6">Start making offers on service requests to see them here!</p>
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
                          <Briefcase className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{offer.storeName}</h3>
                            {offer.verified && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                offer.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {offer.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="font-medium">{offer.rating}</span>
                            </div>
                            <span>({offer.reviews} reviews)</span>
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
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Offer for: <span className="font-medium text-gray-700">{offer.requestTitle}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                          View Store
                        </button>
                        {offer.status === 'pending' && (
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                            disabled={submitting}
                          >
                            {submitting ? 'Accepting...' : 'Accept Offer'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Pagination for offers */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

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

        {/* Past Requests Tab (PRIVATE) */}
        {activeTab === 'past' && authenticated && (
          <div className="space-y-6">
            {userPastRequests.length === 0 ? (
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
                            <span>Completed: {request.completedDate}</span>
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
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {request.category}
                          </span>
                          <div className="flex space-x-2">
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                              View Details
                            </button>
                            {request.status === 'completed' && (
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

            {/* Pagination for past requests */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

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
                {statistics.totalProviders?.toLocaleString() || '2,500+'}
              </div>
              <div className="text-gray-600">Verified Providers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {statistics.completedRequests?.toLocaleString() || '15,000+'}
              </div>
              <div className="text-gray-600">Completed Requests</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {statistics.averageRating?.toFixed(1) || '4.8'}★
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {statistics.activeRequests?.toLocaleString() || '500+'}
              </div>
              <div className="text-gray-600">Active Requests</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
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
            </div>

            <form onSubmit={handleOfferFormSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quoted Price *</label>
                <input
                  type="number"
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
                  placeholder="Describe your offer and experience..."
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
                  placeholder="When can you start?"
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
                  onClick={() => {
                    setShowLoginPrompt(false);
                    window.location.href = '/accounts/sign-in';
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}