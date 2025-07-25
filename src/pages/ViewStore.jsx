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
  Loader2,
  DollarSign,
  Tag,
  Camera,
  ExternalLink,
  Navigation
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StoreService from '../services/storeService';
import chatService from '../services/chatService';
import authService from '../services/authService';

// Enhanced API services with better error handling
const offerAPI = {
  getOffersByStore: async (storeId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/offers/store/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    } catch (error) {
      console.warn('Offers API error:', error);
      return { offers: [] };
    }
  }
};

const serviceAPI = {
  getServices: async (params = {}) => {
    try {
      // Try multiple endpoints for services
      let url;
      if (params.storeId) {
        // First try the store-specific endpoint
        url = `http://localhost:4000/api/v1/services/store/${params.storeId}`;
      } else {
        url = 'http://localhost:4000/api/v1/services';
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Services API error:', error);

      // If store-specific endpoint fails, try general endpoint with filter
      if (params.storeId) {
        try {
          const response = await fetch(`http://localhost:4000/api/v1/services?storeId=${params.storeId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            return response.json();
          }
        } catch (fallbackError) {
          console.warn('Fallback services API also failed:', fallbackError);
        }
      }

      return { services: [] };
    }
  }
};

// Public branch API (no authentication required for public store view)
const branchAPI = {
  getBranchesByStore: async (storeId) => {
    try {
      // Try public endpoint first (for store view)
      const response = await fetch(`http://localhost:4000/api/v1/stores/${storeId}/branches`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      // If public endpoint doesn't exist, try the protected one without auth
      const protectedResponse = await fetch(`http://localhost:4000/api/v1/branches/store/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (protectedResponse.ok) {
        return protectedResponse.json();
      }

      throw new Error('No branch endpoints available');
    } catch (error) {
      console.warn('Branch API error:', error);
      return { branches: [] };
    }
  }
};

const StoreViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // State management
  const [storeData, setStoreData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [copiedCode, setCopiedCode] = useState('');
  const [activeSection, setActiveSection] = useState('offers');
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toggleFollowLoading, setToggleFollowLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const getAuthenticationStatus = () => {
    try {
      // Check multiple token sources (matching your chatService approach)
      const tokenSources = {
        localStorage_access_token: localStorage.getItem('access_token'),
        localStorage_authToken: localStorage.getItem('authToken'),
        localStorage_token: localStorage.getItem('token'),
        cookie_authToken: getCookieValue('authToken'),
        cookie_access_token: getCookieValue('access_token'),
        cookie_token: getCookieValue('token')
      };

      const token = tokenSources.localStorage_access_token ||
        tokenSources.localStorage_authToken ||
        tokenSources.localStorage_token ||
        tokenSources.cookie_authToken ||
        tokenSources.cookie_access_token ||
        tokenSources.cookie_token;

      console.log('🔍 Token sources check:', Object.keys(tokenSources).filter(key => tokenSources[key]));
      console.log('🔍 Selected token:', token ? `Found (${token.substring(0, 20)}...)` : 'Not found');

      // Check user info in localStorage
      let userInfo = null;
      const possibleKeys = ['userInfo', 'user', 'userData', 'currentUser'];

      for (const key of possibleKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.id || parsed.userId)) {
              userInfo = parsed;
              console.log(`✅ User info found in localStorage.${key}`);
              break;
            }
          }
        } catch (e) {
          console.log(`⚠️ Failed to parse ${key}:`, e.message);
        }
      }

      return {
        isAuthenticated: !!(token && userInfo),
        token,
        userInfo,
        tokenSources
      };
    } catch (error) {
      console.error('Authentication check error:', error);
      return {
        isAuthenticated: false,
        token: null,
        userInfo: null,
        error: error.message
      };
    }
  };

  // Enhanced getCurrentUser function
  const getCurrentUser = () => {
    const authStatus = getAuthenticationStatus();

    if (!authStatus.isAuthenticated) {
      return {
        isLoggedIn: false,
        error: 'Not authenticated',
        debug: authStatus
      };
    }

    try {
      const userInfo = authStatus.userInfo;
      return {
        isLoggedIn: true,
        id: userInfo.id || userInfo.userId,
        name: `${userInfo.firstName || userInfo.first_name || 'User'} ${(userInfo.lastName || userInfo.last_name || 'U').charAt(0)}.`,
        email: userInfo.email,
        userType: userInfo.userType || userInfo.role || 'customer',
        rawUserInfo: userInfo
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        isLoggedIn: false,
        error: 'Failed to parse user info',
        debug: authStatus
      };
    }
  };

  const handleOfferClick = (offerId) => {
    navigate(`/offer/${offerId}`);
  };

  const currentUser = getCurrentUser();

  // Fetch store data
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

  // Fetch offers for the store
  const fetchOffers = async () => {
    try {
      setOffersLoading(true);
      const response = await offerAPI.getOffersByStore(id);
      setOffers(response.offers || []);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  // Fetch services for the store
  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await serviceAPI.getServices({ storeId: id });
      setServices(response.services || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch branches for the store
  const fetchBranches = async () => {
    try {
      setBranchesLoading(true);
      console.log('🏢 Fetching branches for store:', id);

      const data = await branchAPI.getBranchesByStore(id);
      console.log('✅ Branches response:', data);

      if (data.success && data.branches && data.branches.length > 0) {
        setBranches(data.branches);
      } else if (data.branches && data.branches.length > 0) {
        setBranches(data.branches);
      } else {
        // Fallback: create main branch from store data
        if (storeData) {
          const mainBranch = {
            id: `store-${storeData.id}`,
            name: `${storeData.name} - Main Branch`,
            address: storeData.location,
            phone: storeData.phone_number || storeData.primary_email,
            email: storeData.primary_email,
            status: 'Active',
            openingTime: storeData.opening_time,
            closingTime: storeData.closing_time,
            workingDays: storeData.working_days || [],
            isMainBranch: true,
            isStoreMainBranch: true,
            // Add coordinates if available
            latitude: storeData.latitude || null,
            longitude: storeData.longitude || null
          };
          setBranches([mainBranch]);
        } else {
          setBranches([]);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching branches:', err);
      // Fallback: use store data as main branch
      if (storeData) {
        const mainBranch = {
          id: `store-${storeData.id}`,
          name: `${storeData.name} - Main Branch`,
          address: storeData.location,
          phone: storeData.phone_number || storeData.primary_email,
          email: storeData.primary_email,
          status: 'Active',
          openingTime: storeData.opening_time,
          closingTime: storeData.closing_time,
          workingDays: storeData.working_days || [],
          isMainBranch: true,
          isStoreMainBranch: true,
          // Add coordinates if available
          latitude: storeData.latitude || null,
          longitude: storeData.longitude || null
        };
        setBranches([mainBranch]);
      } else {
        setBranches([]);
      }
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleChatClick = async () => {
    try {
      console.log('=== CHAT BUTTON CLICKED ===');
  
      // Use enhanced authentication check
      const authStatus = getAuthenticationStatus();
      const currentUser = getCurrentUser();
  
      console.log('🔐 Auth Status:', authStatus);
      console.log('👤 Current User:', currentUser);
  
      if (!authStatus.isAuthenticated || !currentUser.isLoggedIn) {
        console.log('❌ Authentication failed, redirecting to login');
        setError(`Please log in to chat with ${storeData.name}`);
        navigate('/accounts/sign-in', {
          state: { from: { pathname: location.pathname } }
        });
        return;
      }
  
      setStartingChat(true);
      setError(null);
  
      try {
        console.log('🚀 Starting chat process...');
        console.log('Store ID:', id, 'Store Name:', storeData.name);
        console.log('User:', currentUser.name, 'ID:', currentUser.id, 'Type:', currentUser.userType);
  
        // First, check if chatService has valid auth
        const chatToken = chatService.getAuthToken();
        console.log('💬 Chat service token:', chatToken ? `Found (${chatToken.substring(0, 20)}...)` : 'Not found');
  
        if (!chatToken) {
          console.log('⚠️ Chat service has no token, this might cause issues');
        }
  
        // Get existing conversations
        console.log('📋 Fetching existing conversations...');
        const conversationsResponse = await chatService.getConversations('customer');
        console.log('📋 Conversations response:', conversationsResponse);
  
        if (conversationsResponse.success) {
          // Look for existing conversation with this store
          const existingConversation = conversationsResponse.data.find(
            conv => conv.store && (conv.store.id === id || conv.store.id === parseInt(id))
          );
  
          console.log('🔍 Existing conversation found:', !!existingConversation);
  
          if (existingConversation) {
            console.log('✅ Using existing conversation:', existingConversation.id);
  
            // Navigate to CUSTOMER chat page with existing conversation
            navigate('/chat', {
              state: {
                selectedConversation: existingConversation,
                storeData: storeData,
                user: currentUser,
                userType: 'customer' // Explicitly set as customer
              }
            });
          } else {
            console.log('🆕 Creating new conversation...');
  
            // Start new conversation with a friendly initial message
            const initialMessage = `Hi! I'm interested in ${storeData.name}. Could you help me with some information?`;
  
            const newConversationResponse = await chatService.startConversation(
              parseInt(id),
              initialMessage
            );
  
            console.log('🆕 New conversation response:', newConversationResponse);
  
            if (newConversationResponse.success) {
              console.log('✅ New conversation created:', newConversationResponse.data.conversationId);
  
              // Create a conversation object for navigation
              const newConversation = {
                id: newConversationResponse.data.conversationId,
                store: {
                  id: parseInt(id),
                  name: storeData.name,
                  avatar: storeData.logo || storeData.logo_url,
                  category: storeData.category,
                  online: true
                },
                lastMessage: initialMessage,
                lastMessageTime: 'now',
                unreadCount: 0
              };
  
              // Navigate to CUSTOMER chat page with new conversation
              navigate('/chat', {
                state: {
                  selectedConversation: newConversation,
                  newConversationId: newConversationResponse.data.conversationId,
                  storeData: storeData,
                  user: currentUser,
                  userType: 'customer' // Explicitly set as customer
                }
              });
  
              // Show success message
              console.log('🎉 Chat started successfully! Customer will see messages in customer interface.');
            } else {
              throw new Error(newConversationResponse.message || 'Failed to start conversation');
            }
          }
        } else {
          throw new Error(conversationsResponse.message || 'Failed to load conversations');
        }
  
      } catch (apiError) {
        console.error('❌ Chat API Error:', apiError);
  
        // Handle specific error cases
        if (apiError.message.includes('Authentication') ||
          apiError.message.includes('401') ||
          apiError.message.includes('403') ||
          apiError.message.includes('token')) {
          
          setError('Your session has expired. Please log in again to chat.');
  
          // Clear tokens and redirect
          ['access_token', 'authToken', 'token', 'userInfo', 'user', 'userData'].forEach(key => {
            localStorage.removeItem(key);
          });
  
          navigate('/accounts/sign-in', {
            state: {
              from: { pathname: location.pathname },
              message: 'Please log in to chat with stores'
            }
          });
        } else {
          setError(`Unable to start chat: ${apiError.message}`);
        }
      }
  
    } catch (error) {
      console.error('❌ General Chat error:', error);
      setError(`Failed to start chat: ${error.message}`);
    } finally {
      setStartingChat(false);
    }
  };
  // Enhanced getCookieValue function with better error handling
  const getCookieValue = (name) => {
    try {
      if (typeof document === 'undefined') return '';

      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
      }
      return '';
    } catch (error) {
      console.error('Error reading cookie:', error);
      return '';
    }
  };

  // Enhanced Chat Button component with better disabled states
  const ChatButton = ({ className = "", size = "default" }) => {
    const buttonSizes = {
      small: "p-2",
      default: "px-6 py-2",
      large: "px-8 py-3"
    };

    const iconSizes = {
      small: "w-4 h-4",
      default: "w-4 h-4",
      large: "w-5 h-5"
    };

    const currentUser = getCurrentUser();
    const isDisabled = startingChat || !currentUser.isLoggedIn;

    return (
      <button
        onClick={handleChatClick}
        disabled={isDisabled}
        className={`flex items-center gap-2 rounded-lg transition-colors ${isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${buttonSizes[size]} ${className}`}
        title={!currentUser.isLoggedIn ? 'Please log in to chat' : ''}
      >
        {startingChat ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <MessageCircle className={iconSizes[size]} />
        )}
        {size !== "small" && (
          <span>
            {startingChat
              ? 'Starting Chat...'
              : !currentUser.isLoggedIn
                ? 'Login to Chat'
                : 'Chat'
            }
          </span>
        )}
      </button>
    );
  };


  // Toggle follow status
  const toggleFollow = async () => {
    if (!currentUser.isLoggedIn) {
      alert('Please log in to follow stores.');
      return;
    }

    try {
      setToggleFollowLoading(true);

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
  const handleReviewSubmit = async () => {
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
  }, [id]);

  // Fetch all data when store data is loaded (for stats and initial display)
  useEffect(() => {
    if (!storeData) return;

    // Fetch all data for stats display
    fetchOffers();
    fetchServices();
    fetchBranches();
  }, [storeData]);

  // Fetch specific data when section changes (if not already loaded)
  useEffect(() => {
    if (!storeData) return;

    switch (activeSection) {
      case 'offers':
        if (offers.length === 0) fetchOffers();
        break;
      case 'services':
        if (services.length === 0) fetchServices();
        break;
      case 'outlets':
      case 'map':
        if (branches.length === 0) fetchBranches();
        break;
      default:
        break;
    }
  }, [activeSection]);

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

  // Enhanced Offer Card Component (matching deals page design)
  const OfferCard = ({ offer, isListView = false }) => {
    // Calculate prices if available
    const originalPrice = offer.service?.price || offer.original_price || 0;
    const discountValue = offer.discount_value || offer.discount || 0;
    const discountedPrice = originalPrice > 0 && discountValue > 0
      ? (originalPrice * (1 - discountValue / 100)).toFixed(2)
      : 0;

    return (
      <div className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group ${isListView ? 'flex flex-col sm:flex-row' : ''}`}>
        <div className={`relative ${isListView ? 'sm:w-1/3' : ''}`}>
          <img
            src={offer.image_url || offer.service?.image_url || '/api/placeholder/300/200'}
            alt={offer.title || offer.description}
            className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${isListView ? 'h-48 sm:h-full' : 'h-48'
              }`}
            onError={(e) => {
              e.target.src = '/api/placeholder/300/200';
            }}
          />

          {/* Favorite Button */}
          <button
            className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite logic here
            }}
          >
            <Heart size={16} className="text-gray-600" />
          </button>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
              {offer.service?.category || offer.category || 'Special Offer'}
            </span>
          </div>

          {/* Featured Badge */}
          {offer.featured && (
            <div className="absolute top-3 left-3">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                FEATURED
              </span>
            </div>
          )}
        </div>

        <div className={`p-4 ${isListView ? 'sm:flex-1' : ''}`}>
          {/* Store Info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
              <img
                src={storeData?.logo || storeData?.logo_url || '/api/placeholder/20/20'}
                alt="Store logo"
                className="w-5 h-5 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/20/20';
                }}
              />
            </div>

            {/* Store Pill */}
            <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-blue-400">
              <span>{storeData?.name || 'Store'}</span>
            </div>
          </div>

          {/* Offer Title */}
          <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
            {offer.title || offer.service?.name || offer.description || 'Special Offer'}
          </h3>

          {/* Offer Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {offer.description || offer.service?.description || 'Get exclusive offers with this amazing deal'}
          </p>

          {/* Price Display */}
          {originalPrice > 0 && discountedPrice > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg font-bold text-black">
                KES {discountedPrice}
              </span>
              <span className="text-sm text-gray-500 line-through">
                KES {originalPrice}
              </span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700">
              {offer.discount_value || offer.discount || '20'}% OFF
            </span>

            <button
              className="px-6 py-2 rounded text-sm font-medium transition-colors bg-red-500 hover:bg-red-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleOfferClick(offer.id);
              }}
            >
              Get Offer
            </button>
          </div>

          {/* Expiry Date */}
          {offer.expiry_date && (
            <div className="mt-2 text-xs text-gray-500">
              Expires: {new Date(offer.expiry_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced Service Card Component
  const ServiceCard = ({ service }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Service Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback gradient background */}
        <div className={`absolute inset-0 flex items-center justify-center ${service.image_url ? 'hidden' : 'flex'}`}>
          <div className="text-center text-white">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-80" />
            <div className="text-lg font-semibold opacity-90">{service.name}</div>
          </div>
        </div>

        {/* Service Type Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${service.type === 'fixed'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
            }`}>
            {service.type === 'fixed' ? 'Fixed Price' : 'Dynamic Price'}
          </span>
        </div>
      </div>

      {/* Service Content */}
      <div className="p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
          {service.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description || 'No description available'}
        </p>

        {service.type === 'fixed' && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center text-green-600 font-semibold">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>KES {service.price}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">{service.duration} mins</span>
            </div>
          </div>
        )}

        {service.category && (
          <div className="mb-4">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
              {service.category}
            </span>
          </div>
        )}

        <button
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          onClick={() => navigate(`/service/${service.id}`)}
        >
          <Calendar className="w-4 h-4" />
          Book Service
        </button>
      </div>
    </div>
  );

  // Enhanced Outlet Card Component
  const OutletCard = ({ branch }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Branch Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{branch.name}</h3>
        {branch.isMainBranch && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
            Main Branch
          </span>
        )}
      </div>

      {/* Branch Details */}
      <div className="p-6">
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{branch.address}</span>
          </div>

          {branch.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 text-sm">{branch.phone}</span>
            </div>
          )}

          {branch.openingTime && branch.closingTime && (
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 text-sm">
                {branch.openingTime} - {branch.closingTime}
              </span>
            </div>
          )}

          {branch.manager && (
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 text-sm">Manager: {branch.manager}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold">
            View Details
          </button>
          {branch.phone && (
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <a href={`tel:${branch.phone}`} className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
              </a>
            </button>
          )}
          {branch.latitude && branch.longitude && (
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Navigation className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Google Maps Component
  const GoogleMap = ({ branches, center }) => {
    const mapRef = React.useRef(null);
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [mapError, setMapError] = React.useState(null);

    React.useEffect(() => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // For demo purposes, we'll show a placeholder
      // In production, add your Google Maps API key
      setMapError('Google Maps API key required');

      // Uncomment below and add your API key to enable Google Maps
      /*
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        initializeMap();
      };
      
      script.onerror = () => {
        setMapError('Failed to load Google Maps');
      };

      document.head.appendChild(script);
      */

    }, []);

    const initializeMap = () => {
      try {
        if (!mapRef.current || !window.google) return;

        // Default center (Nairobi, Kenya)
        const defaultCenter = { lat: -1.2921, lng: 36.8219 };
        const mapCenter = center || defaultCenter;

        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          center: mapCenter,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapRef.current.googleMap = map;
        setMapLoaded(true);
        setMapError(null);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    };

    if (mapError) {
      return (
        <div className="h-96 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Interactive Map</p>
            <p className="text-sm">
              {branches.length > 0
                ? `Showing ${branches.length} ${branches.length === 1 ? 'location' : 'locations'}`
                : 'Locations will appear here'
              }
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              {branches.slice(0, 3).map((branch, index) => (
                <div key={branch.id} className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                  <MapPin className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div ref={mapRef} className="h-96 w-full rounded-lg" />
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
            <div className="text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced Map View Component
  const MapView = () => {
    // Calculate center point from branches
    const getMapCenter = () => {
      if (branches.length === 0) return null;

      // If only one branch, use its coordinates or geocode address
      if (branches.length === 1) {
        const branch = branches[0];
        if (branch.latitude && branch.longitude) {
          return {
            lat: parseFloat(branch.latitude),
            lng: parseFloat(branch.longitude)
          };
        }
        // Default to Nairobi center if no coordinates
        return { lat: -1.2921, lng: 36.8219 };
      }

      // Calculate center from multiple branches
      const validCoords = branches.filter(b => b.latitude && b.longitude);
      if (validCoords.length > 0) {
        const avgLat = validCoords.reduce((sum, b) => sum + parseFloat(b.latitude), 0) / validCoords.length;
        const avgLng = validCoords.reduce((sum, b) => sum + parseFloat(b.longitude), 0) / validCoords.length;
        return { lat: avgLat, lng: avgLng };
      }

      // Default to Nairobi if no coordinates available
      return { lat: -1.2921, lng: 36.8219 };
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Map Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Store Locations</h3>
          <p className="text-gray-600">
            {branches.length} {branches.length === 1 ? 'location' : 'locations'} available
          </p>
        </div>

        {/* Map Container */}
        <div className="p-6">
          <GoogleMap branches={branches} center={getMapCenter()} />
        </div>

        {/* Locations List */}
        {branches.length > 0 ? (
          <div className="p-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-4">All Locations</h4>
            <div className="space-y-4">
              {branches.map((branch, index) => (
                <div key={branch.id || index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">{branch.name}</h5>
                      {branch.isMainBranch && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                          Main Branch
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {branch.address}
                    </p>
                    {branch.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {branch.phone}
                      </p>
                    )}
                    {branch.openingTime && branch.closingTime && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {branch.openingTime} - {branch.closingTime}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {branch.phone && (
                      <button
                        className="text-blue-500 hover:text-blue-600 transition-colors p-1"
                        onClick={() => window.open(`tel:${branch.phone}`)}
                        title="Call this location"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="text-green-500 hover:text-green-600 transition-colors p-1"
                      onClick={() => {
                        // Try to open in maps app
                        const query = encodeURIComponent(branch.address);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                      }}
                      title="Get directions"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No locations available</h3>
              <p className="text-gray-600">Store location information will be displayed here when available.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render content based on active section
  const renderActiveSection = () => {
    if (!storeData) return null;

    switch (activeSection) {
      case 'offers':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Current Offers</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-red-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {offersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <span className="ml-2 text-gray-600">Loading offers...</span>
              </div>
            ) : offers.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
                {offers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} isListView={viewMode === 'list'} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No offers available</h3>
                <p className="text-gray-600">Check back later for exciting deals and offers!</p>
              </div>
            )}
          </div>
        );

      case 'services':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
            </div>

            {servicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading services...</span>
              </div>
            ) : services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No services available</h3>
                <p className="text-gray-600">Services will be listed here when available.</p>
              </div>
            )}
          </div>
        );

      case 'outlets':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Our Outlets</h2>
              <span className="text-sm text-gray-500">
                {branches.length} {branches.length === 1 ? 'outlet' : 'outlets'}
              </span>
            </div>

            {branchesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="ml-2 text-gray-600">Loading outlets...</span>
              </div>
            ) : branches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {branches.map((branch) => (
                  <OutletCard key={branch.id} branch={branch} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No outlets available</h3>
                <p className="text-gray-600">
                  {storeData?.location
                    ? `This store is located at ${storeData.location}`
                    : 'Outlet information will be displayed here when available.'
                  }
                </p>
                {storeData?.location && (
                  <button
                    className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    onClick={() => {
                      const query = encodeURIComponent(storeData.location);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                  >
                    View on Map
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'map':
        return (
          <div className="mb-6">
            {branchesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading map...</span>
              </div>
            ) : (
              <MapView />
            )}
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
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
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
              className={`text-center p-3 rounded-lg transition-colors ${activeSection === 'offers' ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'}`}
            >
              <div className="text-sm text-gray-500">Offers</div>
              <div className="text-xl font-bold text-red-500">
                {offersLoading ? (
                  <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  offers.length || storeData.deals?.length || 0
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveSection('services')}
              className={`text-center p-3 rounded-lg transition-colors ${activeSection === 'services' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
            >
              <div className="text-sm text-gray-500">Services</div>
              <div className="text-xl font-bold text-blue-500">
                {servicesLoading ? (
                  <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  services.length || storeData.services?.length || 0
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveSection('map')}
              className={`text-center p-3 rounded-lg transition-colors ${activeSection === 'map' ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}`}
            >
              <div className="text-sm text-gray-500">Map</div>
              <div className="text-xl font-bold text-green-500">
                {branchesLoading ? (
                  <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  'View'
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveSection('outlets')}
              className={`text-center p-3 rounded-lg transition-colors ${activeSection === 'outlets' ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'}`}
            >
              <div className="text-sm text-gray-500">Outlets</div>
              <div className="text-xl font-bold text-purple-500">
                {branchesLoading ? (
                  <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  branches.length || storeData.outlets?.length || 0
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Content Based on Active Section */}
        {renderActiveSection()}

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(storeData.rating || 0)}</div>
              <span className="font-medium">{storeData.rating || 0} out of 5</span>
              <span className="text-gray-500">({storeData.totalReviews || 0} reviews)</span>
            </div>
          </div>

          {/* Add Review Form */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
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
              <div className="space-y-4">
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
                  onClick={handleReviewSubmit}
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
              </div>
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

      {/* Fixed Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatButton
          size="large"
          className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600"
        />
      </div>

      <Footer />
    </div>
  );
};

export default StoreViewPage;