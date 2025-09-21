import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Star, 
  Calendar,
  MapPin,
  DollarSign,
  MessageCircle,
  ArrowLeft,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import authService from '../../services/authService';
import userServiceRequestService from '../../services/userServiceRequestService';

const ServiceRequests = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    requests: { page: 1, limit: 10, hasMore: true },
    offers: { page: 1, limit: 10, hasMore: true }
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user's past requests
  const fetchUserRequests = async (page = 1, reset = false) => {
    try {
      setLoading(true);
      const response = await userServiceRequestService.getUserPastRequests({
        page,
        limit: 10,
        status: statusFilter
      });

      if (response.success) {
        const newRequests = response.data.requests || [];
        setRequests(prev => reset ? newRequests : [...prev, ...newRequests]);
        setPagination(prev => ({
          ...prev,
          requests: {
            ...prev.requests,
            page,
            hasMore: newRequests.length === 10
          }
        }));
      }
    } catch (error) {
      setError('Failed to fetch your service requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's offers
  const fetchUserOffers = async (page = 1, reset = false) => {
    try {
      setLoading(true);
      const response = await userServiceRequestService.getUserOffers({
        page,
        limit: 10,
        status: statusFilter
      });

      if (response.success) {
        const newOffers = response.data.offers || [];
        setOffers(prev => reset ? newOffers : [...prev, ...newOffers]);
        setPagination(prev => ({
          ...prev,
          offers: {
            ...prev.offers,
            page,
            hasMore: newOffers.length === 10
          }
        }));
      }
    } catch (error) {
      setError('Failed to fetch your offers');
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchUserRequests(1, true);
    } else {
      fetchUserOffers(1, true);
    }
  }, [activeTab, statusFilter]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSearchTerm('');
  };

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], page: 1 }
    }));
  };

  // Load more items
  const loadMore = () => {
    const currentPagination = pagination[activeTab];
    if (currentPagination.hasMore && !loading) {
      const nextPage = currentPagination.page + 1;
      if (activeTab === 'requests') {
        fetchUserRequests(nextPage, false);
      } else {
        fetchUserOffers(nextPage, false);
      }
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    const statusConfig = {
      pending: { color: 'text-yellow-600 bg-yellow-50', icon: Clock, label: 'Pending' },
      active: { color: 'text-blue-600 bg-blue-50', icon: Clock, label: 'Active' },
      completed: { color: 'text-green-600 bg-green-50', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'Cancelled' },
      accepted: { color: 'text-green-600 bg-green-50', icon: CheckCircle, label: 'Accepted' },
      rejected: { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'Rejected' }
    };

    return statusConfig[status] || statusConfig.pending;
  };

  // Filter items based on search term
  const filteredItems = (items) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Refresh data
  const refreshData = () => {
    setError(null);
    if (activeTab === 'requests') {
      fetchUserRequests(1, true);
    } else {
      fetchUserOffers(1, true);
    }
  };

  const RequestCard = ({ request }) => {
    const statusDisplay = getStatusDisplay(request.status);
    const StatusIcon = statusDisplay.icon;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{request.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{request.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>KSH {request.budgetMin?.toLocaleString()} - {request.budgetMax?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{request.timeline}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusDisplay.label}
              </span>
              
              <span className="text-xs text-gray-500">
                {request.offersCount || 0} offers received
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate(`/service-request/${request.id}`)}
            className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
          <span>Created {new Date(request.createdAt).toLocaleDateString()}</span>
          <span className="capitalize">{request.category}</span>
        </div>
      </div>
    );
  };

  const OfferCard = ({ offer }) => {
    const statusDisplay = getStatusDisplay(offer.status);
    const StatusIcon = statusDisplay.icon;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{offer.serviceRequest?.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{offer.message}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium text-gray-900">KSH {offer.quotedPrice?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{offer.availability}</span>
              </div>
              {offer.serviceRequest?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{offer.serviceRequest.location}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusDisplay.label}
              </span>
              
              {offer.rating && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{offer.rating}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate(`/service-request/${offer.serviceRequest?.id}`)}
            className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
          <span>Offered {new Date(offer.createdAt).toLocaleDateString()}</span>
          <span className="capitalize">{offer.serviceRequest?.category}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Service Requests</h1>
                <p className="text-gray-500 text-sm">Manage your service requests and offers</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-8 border-b border-gray-200">
              <button
                onClick={() => handleTabChange('requests')}
                className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'requests'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                My Requests ({requests.length})
              </button>
              <button
                onClick={() => handleTabChange('offers')}
                className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'offers'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                My Offers ({offers.length})
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                {activeTab === 'offers' && (
                  <>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-4">
            {loading && (!requests.length && !offers.length) ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex gap-4">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Requests Tab */}
                {activeTab === 'requests' && (
                  <>
                    {filteredItems(requests).length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm || statusFilter !== 'all' ? 'No matching requests' : 'No service requests yet'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filters.'
                            : 'Create your first service request to get started.'
                          }
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                          <button
                            onClick={() => onNavigate && onNavigate('/request-service')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Create Service Request
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {filteredItems(requests).map((request) => (
                          <RequestCard key={request.id} request={request} />
                        ))}
                      </>
                    )}
                  </>
                )}

                {/* Offers Tab */}
                {activeTab === 'offers' && (
                  <>
                    {filteredItems(offers).length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm || statusFilter !== 'all' ? 'No matching offers' : 'No offers yet'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filters.'
                            : 'You haven\'t made any offers yet.'
                          }
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                          <button
                            onClick={() => onNavigate && onNavigate('/request-service')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Browse Service Requests
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {filteredItems(offers).map((offer) => (
                          <OfferCard key={offer.id} offer={offer} />
                        ))}
                      </>
                    )}
                  </>
                )}

                {/* Load More Button */}
                {((activeTab === 'requests' && pagination.requests.hasMore) ||
                  (activeTab === 'offers' && pagination.offers.hasMore)) && (
                  <div className="text-center py-6">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ServiceRequests;