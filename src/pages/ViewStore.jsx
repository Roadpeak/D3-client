
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Grid3X3,
  List,
  Star,
  Facebook,
  Twitter,
  Instagram,
  Globe,
  Users,
  Copy,
  Check,
  MapPin,
  Clock,
  Phone,
  Calendar,
  Send,
  ArrowLeft,
  Loader2
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StoreService from '../services/storeService';
import chatService from '../services/chatService'; // Add chat service import
import authService from '../services/authService'; // Add auth service import

const StoreViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Get store ID from URL params

  // State management
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [copiedCode, setCopiedCode] = useState('');
  const [activeSection, setActiveSection] = useState('offers');
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toggleFollowLoading, setToggleFollowLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false); // Add chat loading state

  // Get current user from localStorage/context (adjust based on your auth implementation)
  const getCurrentUser = () => {
    const token = StoreService.getAuthToken();
    if (!token) return { isLoggedIn: false };

    try {
      // You might decode the JWT or get user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return {
        isLoggedIn: true,
        name: `${userInfo.first_name || 'User'} ${userInfo.last_name?.charAt(0) || 'U'}.`,
        id: userInfo.id
      };
    } catch {
      return { isLoggedIn: false };
    }
  };

  const currentUser = getCurrentUser();

  // Fetch store data from backend using StoreService
  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await StoreService.getStoreById(id);
      setStoreData(data.store);
      setIsFollowing(data.store.following || false);
    } catch (err) {
      console.error('Error fetching store:', err);
      if (err.message.includes('404')) {
        setError('Store not found');
      } else {
        setError('Failed to fetch store data');
      }
    } finally {
      setLoading(false);
    }
  };

 // Updated handleChatClick function for StoreViewPage
const handleChatClick = async () => {
  try {
    console.log('=== CHAT BUTTON CLICKED ===');
    
    // Debug: Check authentication state
    console.log('🔍 Checking authentication...');
    const token = localStorage.getItem('access_token') || 
                 localStorage.getItem('authToken') ||
                 getCookieValue('authToken');
    
    console.log('🎫 Token found:', token ? `Yes (${token.substring(0, 20)}...)` : 'No');
    
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      navigate('/accounts/sign-in', { 
        state: { from: { pathname: location.pathname } }
      });
      return;
    }

    setStartingChat(true);
    setError(null);

    // Test the auth first
    console.log('🔍 Testing authentication with profile endpoint...');
    const profileTest = await fetch('http://localhost:4000/api/v1/users/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    console.log('📡 Profile test response:', profileTest.status);
    
    if (!profileTest.ok) {
      throw new Error('Authentication failed. Please log in again.');
    }

    // Now test chat service
    console.log('🔍 Testing chat service...');
    const conversationsResponse = await chatService.getConversations('customer');
    
    console.log('📡 Chat service response:', conversationsResponse);
    
    if (conversationsResponse.success) {
      console.log('✅ Chat service working! Found conversations:', conversationsResponse.data.length);
      
      // Look for existing conversation with this store
      const existingConversation = conversationsResponse.data.find(
        conv => conv.store && conv.store.id === parseInt(id)
      );

      if (existingConversation) {
        console.log('✅ Found existing conversation:', existingConversation.id);
        // Navigate to existing conversation
        navigate('/chat', { 
          state: { 
            selectedConversation: existingConversation,
            storeData: storeData
          }
        });
      } else {
        console.log('🆕 No existing conversation, starting new one...');
        // Start new conversation
        const newConversationResponse = await chatService.startConversation(
          parseInt(id),
          `Hi! I'm interested in ${storeData.name}. Could you help me with some information?`
        );

        if (newConversationResponse.success) {
          console.log('✅ New conversation started:', newConversationResponse.data.conversationId);
          // Navigate to chat with new conversation
          navigate('/chat', { 
            state: { 
              newConversationId: newConversationResponse.data.conversationId,
              storeData: storeData
            }
          });
        } else {
          throw new Error('Failed to start conversation: ' + newConversationResponse.message);
        }
      }
    } else {
      throw new Error('Failed to load conversations: ' + conversationsResponse.message);
    }

  } catch (error) {
    console.error('❌ Chat error:', error);
    
    // More specific error handling
    if (error.message.includes('Authentication required')) {
      setError('Please log in to start chatting.');
      // Clear invalid tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('authToken');
      navigate('/accounts/login', { 
        state: { from: { pathname: location.pathname } }
      });
    } else if (error.message.includes('CORS')) {
      setError('Connection error. Please refresh the page and try again.');
    } else {
      setError(`Failed to start chat: ${error.message}`);
    }
  } finally {
    setStartingChat(false);
  }
};

// Helper function to get cookie value
const getCookieValue = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return '';
};

  // Toggle follow status
  const toggleFollow = async () => {
    if (!currentUser.isLoggedIn) {
      alert('Please log in to follow stores.');
      return;
    }

    try {
      setToggleFollowLoading(true);
      
      // Use the correct base URL
      const response = await fetch(`http://localhost:4000/api/v1/stores/${id}/toggle-follow`, {
        method: 'POST',
        headers: StoreService.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to toggle follow status');
      }

      const data = await response.json();
      setIsFollowing(data.following);
      setStoreData(prev => ({
        ...prev,
        followers: data.followers
      }));
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('Failed to update follow status. Please try again.');
    } finally {
      setToggleFollowLoading(false);
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser.isLoggedIn) {
      alert('Please log in to submit a review.');
      return;
    }

    if (!newReview.rating || !newReview.comment.trim()) {
      alert('Please provide both a rating and a comment.');
      return;
    }

    try {
      setSubmittingReview(true);

      // Use the correct base URL
      const response = await fetch(`http://localhost:4000/api/v1/stores/${id}/reviews`, {
        method: 'POST',
        headers: StoreService.getHeaders(),
        body: JSON.stringify({
          rating: newReview.rating,
          comment: newReview.comment.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      const data = await response.json();

      // Add new review to the beginning of reviews array
      setStoreData(prev => ({
        ...prev,
        rating: data.storeRating,
        totalReviews: data.totalReviews,
        reviews: [
          {
            ...data.review,
            name: currentUser.name
          },
          ...prev.reviews
        ]
      }));

      // Reset form
      setNewReview({ rating: 0, comment: '' });
      setHoverRating(0);
      alert('Thank you for your review!');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Copy promo code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  useEffect(() => {
    fetchStoreData();
  }, [id]); // Add id as dependency

  // Stars component
  const renderStars = (rating, interactive = false, onRate = null, onHover = null) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${interactive ? 'cursor-pointer' : ''} transition-colors ${i < (interactive ? (hoverRating || rating) : Math.floor(rating))
            ? 'fill-yellow-400 text-yellow-400'
            : interactive ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-300'
          }`}
        onClick={interactive ? () => onRate(i + 1) : undefined}
        onMouseEnter={interactive ? () => onHover(i + 1) : undefined}
        onMouseLeave={interactive ? () => onHover(0) : undefined}
      />
    ));
  };

  // Deal Card Component
  const DealCard = ({ deal, isListView = false }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow ${isListView ? 'flex gap-6' : ''}`}>
      <div className={`${isListView ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`text-center ${isListView ? 'mr-4' : 'mb-4'}`}>
            <div className="text-3xl font-bold text-red-500">{deal.discount}</div>
            <div className="text-sm text-gray-600">{deal.label}</div>
          </div>
          <div className={`${isListView ? 'flex-1' : ''}`}>
            <h3 className="font-semibold text-gray-900 mb-2">{deal.title}</h3>
            <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{deal.description}</p>
            {deal.expiryDate && (
              <p className="text-xs text-red-500 mb-3">Expires {deal.expiryDate}</p>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-3 ${isListView ? 'justify-end' : 'justify-between'}`}>
          {deal.code && (
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                {deal.code}
              </span>
              <button
                onClick={() => handleCopyCode(deal.code)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                {copiedCode === deal.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
          <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
            {deal.buttonText}
          </button>
        </div>
      </div>
    </div>
  );

  // Service Card Component
  const ServiceCard = ({ service }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{service.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{service.duration}</span>
            </div>
            <div className="font-medium text-red-500">{service.price}</div>
          </div>
        </div>
      </div>
      <button
        className={`w-full px-6 py-2 rounded-lg transition-colors ${service.available
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        disabled={!service.available}
      >
        <Calendar className="w-4 h-4 inline mr-2" />
        {service.available ? 'Book Appointment' : 'Currently Unavailable'}
      </button>
    </div>
  );

  // Outlet Card Component
  const OutletCard = ({ outlet }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={outlet.image}
        alt={outlet.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = '/images/store-placeholder.png'; // Fallback image
        }}
      />
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{outlet.name}</h3>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{outlet.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{outlet.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{outlet.hours}</span>
          </div>
          <div className="text-red-500 font-medium">{outlet.distance}</div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
            View Deals
          </button>
          <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
            <a href={`tel:${outlet.phone}`}>Call Store</a>
          </button>
        </div>
      </div>
    </div>
  );

  // Map View Component
  const MapView = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Interactive Map</p>
          <p className="text-sm">Showing {storeData?.outlets?.length || 0} store locations</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storeData?.outlets?.map((outlet) => (
          <div key={outlet.id} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{outlet.name}</h4>
            <p className="text-sm text-gray-600 mb-1">{outlet.address}</p>
            <p className="text-sm text-red-500 font-medium">{outlet.distance}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Render content based on active section
  const renderActiveSection = () => {
    if (!storeData) return null;

    switch (activeSection) {
      case 'offers':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Current Deals</h2>
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-red-500 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
              {storeData.deals?.map((deal) => (
                <DealCard key={deal.id} deal={deal} isListView={viewMode === 'list'} />
              ))}
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Our Services</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {storeData.services?.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        );

      case 'map':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Store Locations</h2>
            </div>
            <MapView />
          </div>
        );

      case 'outlets':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Our Outlets</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {storeData.outlets?.map((outlet) => (
                <OutletCard key={outlet.id} outlet={outlet} />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading store information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/stores')}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  // No store data
  if (!storeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No store data available</p>
          <button
            onClick={() => navigate('/stores')}
            className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/stores')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </button>

        {/* Store Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Store Logo and Basic Info */}
            <div className="flex items-start gap-4">
              <img
                src={storeData.logo || storeData.logo_url}
                alt={storeData.name}
                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = '/images/store-placeholder.png';
                }}
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {storeData.name}
                </h1>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(storeData.rating || 0)}</div>
                    <span className="text-sm font-medium">{storeData.rating || 0}</span>
                    <span className="text-sm text-gray-500">({storeData.totalReviews?.toLocaleString() || 0})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{storeData.followers?.toLocaleString() || 0} followers</span>
                  </div>
                </div>

                {/* Store Category and Location */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  {storeData.category && (
                    <span className="bg-gray-100 px-2 py-1 rounded">{storeData.category}</span>
                  )}
                  {storeData.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{storeData.location}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {storeData.description && (
                  <p className="text-gray-600 mb-4">{storeData.description}</p>
                )}

                {/* Social Links */}
                <div className="flex items-center gap-3 mb-4">
                  {storeData.socialLinks?.facebook && (
                    <a href={storeData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {storeData.socialLinks?.twitter && (
                    <a href={storeData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-600">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {storeData.socialLinks?.instagram && (
                    <a href={storeData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {storeData.socialLinks?.website && (
                    <a href={storeData.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-700">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:ml-auto">
              <button
                onClick={toggleFollow}
                disabled={toggleFollowLoading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg border transition-colors disabled:opacity-50 ${isFollowing
                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                    : 'bg-white text-red-500 border-red-500 hover:bg-red-50'
                  }`}
              >
                {toggleFollowLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                )}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button 
                onClick={handleChatClick}
                disabled={startingChat}
                className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {startingChat ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                {startingChat ? 'Starting Chat...' : 'Chat'}
              </button>
            </div>
          </div>

          {/* Store Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setActiveSection('offers')}
              className={`text-center p-2 rounded-lg transition-colors ${activeSection === 'offers' ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                }`}
            >
              <div className="text-sm text-gray-500">Offers</div>
              <div className="text-xl font-bold text-red-500">{storeData.deals?.length || 0}</div>
            </button>
            <button
              onClick={() => setActiveSection('services')}
              className={`text-center p-2 rounded-lg transition-colors ${activeSection === 'services' ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                }`}
            >
              <div className="text-sm text-gray-500">Services</div>
              <div className="text-xl font-bold text-gray-900">{storeData.services?.length || 0}</div>
            </button>
            <button
              onClick={() => setActiveSection('map')}
              className={`text-center p-2 rounded-lg transition-colors ${activeSection === 'map' ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                }`}
            >
              <div className="text-sm text-gray-500">Map</div>
              <div className="text-xl font-bold text-gray-900">1</div>
            </button>
            <button
              onClick={() => setActiveSection('outlets')}
              className={`text-center p-2 rounded-lg transition-colors ${activeSection === 'outlets' ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                }`}
            >
              <div className="text-sm text-gray-500">Outlets</div>
              <div className="text-xl font-bold text-gray-900">{storeData.outlets?.length || 0}</div>
            </button>
          </div>
        </div>

        {/* Dynamic Content Based on Active Section */}
        {renderActiveSection()}

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(storeData.rating || 0)}</div>
              <span className="font-medium">{storeData.rating || 0} out of 5</span>
              <span className="text-gray-500">({storeData.totalReviews || 0} reviews)</span>
            </div>
          </div>
          {/* Add Review Form */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
              {currentUser.isLoggedIn && (
                <div className="text-sm text-gray-600">
                  Reviewing as <span className="font-medium text-gray-900">{currentUser.name}</span>
                </div>
              )}
            </div>

            {!currentUser.isLoggedIn ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium mb-2">Please log in to write a review</p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {renderStars(
                      newReview.rating,
                      true,
                      (rating) => setNewReview({ ...newReview, rating }),
                      setHoverRating
                    )}
                    <span className="ml-2 text-sm text-gray-600">
                      {newReview.rating > 0 && `${newReview.rating} out of 5`}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Share your experience..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {storeData.reviews && storeData.reviews.length > 0 ? (
              storeData.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900">{review.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium mb-2">No reviews yet</p>
                <p className="text-sm">Be the first to share your experience!</p>
              </div>
            )}
          </div>

          {/* Load More Reviews Button */}
          {storeData.reviews && storeData.reviews.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full sm:w-auto bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
                View All Reviews ({storeData.totalReviews || 0})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Button - Fixed Position */}
      <button className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-colors z-50">
        <MessageCircle className="w-6 h-6" />
      </button>

      <Footer />
    </div>
  );
};

export default StoreViewPage;