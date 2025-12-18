import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userServiceRequestService from '../services/userServiceRequestService';
import authService from '../services/authService';

// SVG Icons
const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Store = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const DollarSign = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const XCircle = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
  </svg>
);

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  useEffect(() => {
    loadUserRequests();
  }, []);

  const loadUserRequests = async () => {
    try {
      setLoading(true);
      const response = await userServiceRequestService.getUserRequests();
      if (response.success) {
        setRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequestOffers = async (requestId) => {
    try {
      setLoadingOffers(true);
      const response = await userServiceRequestService.getRequestOffers(requestId);
      if (response.success) {
        setOffers(response.data.offers || []);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      setOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleViewOffers = async (request) => {
    setSelectedRequest(request);
    await loadRequestOffers(request.id);
  };

  const handleAcceptOffer = async (offer) => {
    if (!window.confirm(`Accept offer from ${offer.storeName} for KSH ${offer.quotedPrice}?`)) {
      return;
    }

    try {
      const response = await userServiceRequestService.acceptOffer(selectedRequest.id, offer.id);
      if (response.success) {
        alert('Offer accepted! The store will contact you soon.');
        loadUserRequests();
        setSelectedRequest(null);
        setOffers([]);
      }
    } catch (error) {
      alert('Failed to accept offer. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      'open': { color: 'bg-green-100 text-green-800', label: 'Open' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'completed': { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    const config = configs[status] || configs['open'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const configs = {
      'IMMEDIATE': { color: 'bg-red-100 text-red-800 border-red-300', label: '🔥 IMMEDIATE' },
      'SCHEDULED': { color: 'bg-blue-100 text-blue-800 border-blue-300', label: '📅 SCHEDULED' },
      'CHECK_LATER': { color: 'bg-gray-100 text-gray-800 border-gray-300', label: '🕐 LATER' }
    };
    const config = configs[urgency] || configs['CHECK_LATER'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
              <p className="text-sm text-gray-600">Track your requests and manage offers</p>
            </div>
            <button
              onClick={() => navigate('/requestservice')}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            >
              + New Request
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-4">No service requests yet</p>
            <button
              onClick={() => navigate('/requestservice')}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            >
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{request.title}</h3>
                        {getUrgencyBadge(request.urgency)}
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-gray-600 mb-3">{request.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{request.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-green-600">
                            KSH {request.budgetMin} - {request.budgetMax}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Offers Summary */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        <strong className="text-red-600 text-lg">{request.offerCount || 0}</strong> offer{request.offerCount !== 1 ? 's' : ''} received
                      </span>
                      {request.urgency === 'IMMEDIATE' && request.offerCount === 0 && (
                        <span className="text-xs text-orange-600 animate-pulse">
                          ⏳ Waiting for offers...
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleViewOffers(request)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                    >
                      View Offers
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offers Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.title}</h2>
                <p className="text-sm text-gray-600">Offers received for this request</p>
              </div>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setOffers([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="p-6">
              {loadingOffers ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading offers...</p>
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">No offers yet</p>
                  <p className="text-sm text-gray-400">
                    {selectedRequest.urgency === 'IMMEDIATE'
                      ? 'Stores are being notified. Offers should arrive soon!'
                      : 'Stores will send offers soon'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <Store className="w-12 h-12 text-red-500" />
                          <div>
                            <h3 className="font-bold text-lg">{offer.storeName}</h3>
                            <p className="text-sm text-gray-600">{offer.storeCategory}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            KSH {offer.quotedPrice}
                          </div>
                          <div className="text-xs text-gray-500">
                            {offer.availability}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 italic">"{offer.message}"</p>

                      {offer.estimatedDuration && (
                        <p className="text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Duration: {offer.estimatedDuration}
                        </p>
                      )}

                      {offer.status === 'pending' && selectedRequest.status === 'open' && (
                        <button
                          onClick={() => handleAcceptOffer(offer)}
                          className="w-full mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                        >
                          <CheckCircle className="w-5 h-5 inline mr-2" />
                          Accept This Offer
                        </button>
                      )}

                      {offer.status === 'accepted' && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-700 font-semibold">
                            <CheckCircle className="w-5 h-5 inline mr-2" />
                            Offer Accepted! The store will contact you.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
