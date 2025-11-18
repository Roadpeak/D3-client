import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Navigation,
  Linkedin,
  Youtube,
  ChevronDown,
  ChevronUp,
  Play,
  Volume2,
  VolumeX,
  Share2
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import ReviewSection from '../components/ReviewSection';
import StoreService from '../services/storeService';
import serviceAPI from '../services/serviceService';
import chatService from '../services/chatService';
import authService from '../services/authService';
import reelService from '../services/reelsService';
import { getTokenFromCookie } from '../config/api';


const getApiHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Only add API key if it exists in environment
  if (process.env.REACT_APP_API_KEY) {
    headers['x-api-key'] = process.env.REACT_APP_API_KEY;
  }

  // Add authentication token if required
  if (includeAuth) {
    const token = getTokenFromCookie() || localStorage.getItem('access_token') || localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// FIXED: Stable fallback images using data URLs (these will never fail)
const STORE_LOGO_FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iOCIgZmlsbD0iIzk0QTNCOCIvPgo8cGF0aCBkPSJNMjQgMzJINTZWMzdINTZWNDRINTZ2MjJIMjRWMzJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjQgNTZINTZWNjBIMjRWNTZaIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';

const OFFER_IMAGE_FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjEwMCIgeT0iNjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIHJ4PSI4IiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9IjEzMCIgY3k9Ijg1IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIxNzAiIGN5PSI4NSIgcj0iOCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEzMCAxMDVIMTcwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8dGV4dCB4PSIxNTAiIHk9IjE2MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9mZmVyIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

const SMALL_LOGO_FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iMTAiIGZpbGw9IiM5NEEzQjgiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgOCA4IiBmaWxsPSJ3aGl0ZSI+CjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IndoaXRlIi8+CjwvZXN2Zz4KPC9zdmc+';

// Enhanced API services with better error handling
const offerAPI = {
  getOffersByStore: async (storeId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/offers/store/${storeId}`, {
        headers: getApiHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    } catch (error) {
      console.warn('Offers API error:', error);
      return { offers: [] };
    }
  }
};

// Public branch API (no authentication required for public store view)
const branchAPI = {
  getBranchesByStore: async (storeId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/stores/${storeId}/branches`, {
        headers: getApiHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      const protectedResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/branches/store/${storeId}`, {
        headers: getApiHeaders()
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

  // Ref for scrolling to content section
  const contentSectionRef = React.useRef(null);

  // State management
  const [storeData, setStoreData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [copiedCode, setCopiedCode] = useState('');
  const [activeSection, setActiveSection] = useState('offers');
  const [toggleFollowLoading, setToggleFollowLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // FIXED: Enhanced Image Component with stable error handling
  const StableImage = React.memo(({
    src,
    fallbackSrc,
    alt,
    className,
    onError: customOnError,
    ...props
  }) => {
    const [imageError, setImageError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    useEffect(() => {
      if (src !== currentSrc) {
        setImageError(false);
        setCurrentSrc(src);
      }
    }, [src, currentSrc]);

    const handleImageError = useCallback((e) => {
      if (!imageError) {
        console.log('Image failed to load:', src);
        setImageError(true);

        if (fallbackSrc && e.target.src !== fallbackSrc) {
          e.target.src = fallbackSrc;
        }

        if (customOnError) {
          customOnError(e);
        }
      }
    }, [imageError, src, fallbackSrc, customOnError]);

    const handleImageLoad = useCallback(() => {
      setImageError(false);
    }, []);

    const imageSrc = imageError ? fallbackSrc : (src || fallbackSrc);

    return (
      <img
        {...props}
        src={imageSrc}
        alt={alt}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    );
  });

  // Function to check if offer is expired
  const isOfferExpired = (expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  // Enhanced getCurrentUser function
  const getCurrentUser = () => {
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
      return {
        isLoggedIn: false,
        error: 'Not authenticated'
      };
    }

    try {
      let userInfo = null;
      const possibleKeys = ['userInfo', 'user', 'userData', 'currentUser'];

      for (const key of possibleKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.id || parsed.userId)) {
              userInfo = parsed;
              console.log(`User info found in localStorage.${key}:`, userInfo);
              break;
            }
          }
        } catch (e) {
          console.log(`Failed to parse ${key}:`, e.message);
        }
      }

      if (!userInfo || (!userInfo.id && !userInfo.userId)) {
        console.error('No valid user info found in localStorage');
        return {
          isLoggedIn: false,
          error: 'User info not found'
        };
      }

      let displayName = 'User';
      const firstNameCandidates = [
        userInfo.firstName,
        userInfo.first_name,
        userInfo.fname,
        userInfo.name?.split(' ')[0]
      ].filter(Boolean);

      const lastNameCandidates = [
        userInfo.lastName,
        userInfo.last_name,
        userInfo.lname,
        userInfo.name?.split(' ')[1]
      ].filter(Boolean);

      const firstName = firstNameCandidates[0];
      const lastName = lastNameCandidates[0];

      if (firstName) {
        displayName = lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName;
      }

      console.log('User display name calculated:', displayName);

      return {
        isLoggedIn: true,
        id: userInfo.id || userInfo.userId,
        name: displayName,
        email: userInfo.email || userInfo.email_address,
        userType: 'customer',
        role: 'customer',
        rawUserInfo: userInfo
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        isLoggedIn: false,
        error: 'Failed to parse user info'
      };
    }
  };

  const getAuthenticationStatus = () => {
    try {
      const isAuthenticated = authService.isAuthenticated();
      const token = getTokenFromCookie() || localStorage.getItem('access_token') || localStorage.getItem('authToken');

      return {
        isAuthenticated: isAuthenticated && !!token,
        hasToken: !!token,
        tokenType: token ? 'found' : 'missing'
      };
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return {
        isAuthenticated: false,
        hasToken: false,
        tokenType: 'error',
        error: error.message
      };
    }
  };

  const handleOfferClick = useCallback((offerId) => {
    navigate(`/offer/${offerId}`);
  }, [navigate]);

  const currentUser = getCurrentUser();

  // Fetch store data
  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching store data for ID:', id);

      const data = await StoreService.getStoreById(id);
      console.log('Store data received:', data);

      if (data.success && data.store) {
        setStoreData(data.store);
        setIsFollowing(data.store.following || false);
      } else {
        throw new Error(data.message || 'Failed to fetch store data');
      }
    } catch (err) {
      console.error('Error fetching store:', err);
      if (err.message.includes('404')) {
        setError('Store not found');
      } else {
        setError('Failed to fetch store data: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch offers for the store with expiration filtering
  const fetchOffers = async () => {
    try {
      setOffersLoading(true);
      const response = await offerAPI.getOffersByStore(id);

      const allOffers = response.offers || [];
      const activeOffers = allOffers.filter(offer => !isOfferExpired(offer.expiration_date));

      console.log(`Store offers - Total: ${allOffers.length}, Active: ${activeOffers.length}`);

      setOffers(activeOffers);
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
      console.log('Fetching branches for store:', id);

      const data = await branchAPI.getBranchesByStore(id);
      console.log('Branches response:', data);

      if (data.success && data.branches && data.branches.length > 0) {
        setBranches(data.branches);
      } else if (data.branches && data.branches.length > 0) {
        setBranches(data.branches);
      } else {
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
            latitude: storeData.latitude || null,
            longitude: storeData.longitude || null
          };
          setBranches([mainBranch]);
        } else {
          setBranches([]);
        }
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
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

  // Fetch reels for the store
  const fetchReels = async () => {
    try {
      setReelsLoading(true);
      console.log('Fetching reels for store:', id);

      const response = await reelService.getStoreReels(id, { limit: 20, offset: 0 });

      if (response.success && response.reels) {
        setReels(response.reels);
        console.log(`Store reels - Total: ${response.reels.length}`);
      } else {
        setReels([]);
      }
    } catch (err) {
      console.error('Error fetching reels:', err);
      setReels([]);
    } finally {
      setReelsLoading(false);
    }
  };

  const handleChatClick = async () => {
    try {
      console.log('=== CHAT BUTTON CLICKED ===');

      if (!storeData || !id) {
        console.error('Missing store data or ID:', { storeData: !!storeData, id });
        setError('Store information not available. Please refresh the page.');
        return;
      }

      const authStatus = getAuthenticationStatus();
      const currentUser = getCurrentUser();

      console.log('Auth Status:', authStatus);
      console.log('Current User:', currentUser);

      if (!authStatus.isAuthenticated || !currentUser.isLoggedIn) {
        console.log('Authentication failed, redirecting to login');
        setError(`Please log in to chat with ${storeData.name}`);
        navigate('/accounts/sign-in', {
          state: { from: { pathname: location.pathname } }
        });
        return;
      }

      setStartingChat(true);
      setError(null);

      try {
        console.log('Starting chat process...');
        console.log('Store ID:', id, 'Store Name:', storeData.name);
        console.log('User:', currentUser.name, 'ID:', currentUser.id);

        const storeId = id; // Keep as string UUID

        const chatToken = chatService.getAuthToken();
        console.log('Chat service token:', chatToken ? 'Found' : 'Not found');

        console.log('Fetching customer conversations...');
        const conversationsResponse = await chatService.getConversations('customer');
        console.log('Conversations response:', conversationsResponse);

        if (conversationsResponse.success) {
          const existingConversation = conversationsResponse.data.find(
            conv => conv.store && (conv.store.id === storeId || conv.store.id === id)
          );

          console.log('Existing conversation found:', !!existingConversation);

          if (existingConversation) {
            console.log('Using existing conversation:', existingConversation.id);
            navigate('/chat', {
              state: {
                selectedConversation: existingConversation,
                storeData: storeData,
                user: {
                  ...currentUser,
                  userType: 'customer',
                  role: 'customer'
                },
                userType: 'customer'
              }
            });
          } else {
            console.log('Creating new conversation...');

            const initialMessage = `Hi! I'm interested in ${storeData.name}. Could you help me with some information?`;

            const newConversationResponse = await chatService.startConversation(
              storeId,
              initialMessage
            );

            console.log('New conversation response:', newConversationResponse);

            if (newConversationResponse.success) {
              console.log('New conversation created:', newConversationResponse.data.conversationId);

              const newConversation = {
                id: newConversationResponse.data.conversationId,
                store: {
                  id: storeId,
                  name: storeData.name,
                  avatar: storeData.logo || storeData.logo_url,
                  category: storeData.category,
                  online: true
                },
                lastMessage: initialMessage,
                lastMessageTime: 'now',
                unreadCount: 0
              };

              navigate('/chat', {
                state: {
                  selectedConversation: newConversation,
                  newConversationId: newConversationResponse.data.conversationId,
                  storeData: storeData,
                  user: {
                    ...currentUser,
                    userType: 'customer',
                    role: 'customer'
                  },
                  userType: 'customer'
                }
              });

              console.log('Chat started successfully!');
            } else {
              throw new Error(newConversationResponse.message || 'Failed to start conversation');
            }
          }
        } else {
          throw new Error(conversationsResponse.message || 'Failed to load conversations');
        }

      } catch (apiError) {
        console.error('Chat API Error:', apiError);

        if (apiError.message.includes('Authentication') ||
          apiError.message.includes('401') ||
          apiError.message.includes('403') ||
          apiError.message.includes('token')) {

          setError('Your session has expired. Please log in again to chat.');

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
      console.error('General Chat error:', error);
      setError(`Failed to start chat: ${error.message}`);
    } finally {
      setStartingChat(false);
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
        title={!currentUser.isLoggedIn ? 'Please log in to chat' : `Chat with ${storeData?.name || 'store'} as customer`}
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
    if (!authService.isAuthenticated()) {
      setError('Please log in to follow stores.');
      navigate('/accounts/sign-in', {
        state: { from: { pathname: location.pathname } }
      });
      return;
    }

    try {
      setToggleFollowLoading(true);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/stores/${id}/toggle-follow`, {
        method: 'POST',
        headers: getApiHeaders(true)
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
          navigate('/accounts/sign-in', {
            state: { from: { pathname: location.pathname } }
          });
          return;
        }
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
      setError('Failed to update follow status. Please try again.');
    } finally {
      setToggleFollowLoading(false);
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

  useEffect(() => {
    if (!storeData) return;

    fetchOffers();
    fetchServices();
    fetchBranches();
    fetchReels();
  }, [storeData]);

  useEffect(() => {
    if (!storeData) return;

    switch (activeSection) {
      case 'offers':
        if (offers.length === 0) fetchOffers();
        break;
      case 'services':
        if (services.length === 0) fetchServices();
        break;
      case 'reels':
        if (reels.length === 0) fetchReels();
        break;
      case 'outlets':
      case 'map':
        if (branches.length === 0) fetchBranches();
        break;
      default:
        break;
    }

    // Scroll to content section when tab changes
    if (contentSectionRef.current) {
      contentSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [activeSection]);

  const fetchSocialLinksForStore = async (storeId) => {
    try {
      console.log('Frontend: Fetching social links for store:', storeId);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/socials/store/${storeId}`, {
        method: 'GET',
        headers: getApiHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Frontend: Socials response:', data);
        return data.success ? (data.socials || []) : [];
      } else if (response.status === 404) {
        console.log('Frontend: No social links found for store');
        return [];
      } else {
        console.error('Frontend: Socials fetch failed:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Frontend: Error fetching social links:', error);
      return [];
    }
  };

  useEffect(() => {
    if (storeData && storeData.id) {
      if (!storeData.socialLinksRaw || storeData.socialLinksRaw.length === 0) {
        fetchSocialLinksForStore(storeData.id).then(socials => {
          if (socials.length > 0) {
            setStoreData(prev => ({
              ...prev,
              socialLinksRaw: socials,
              socialLinks: {
                ...prev.socialLinks,
                ...socials.reduce((acc, social) => {
                  acc[social.platform] = social.link;
                  return acc;
                }, {})
              }
            }));
          }
        });
      }
    }
  }, [storeData]);

  // Stars component
  const renderStars = (rating, interactive = false, onRate = null, onHover = null) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${interactive ? 'cursor-pointer' : ''} transition-colors ${i < Math.floor(rating)
          ? 'fill-yellow-400 text-yellow-400'
          : 'text-gray-300'
          }`}
      />
    ));
  };

  // FIXED: Enhanced Offer Card Component with stable images
  const OfferCard = React.memo(({ offer, isListView = false }) => {
    const expired = isOfferExpired(offer.expiration_date);

    if (expired) {
      return null;
    }

    const originalPrice = offer.service?.price || offer.original_price || 0;
    const discountValue = offer.discount_value || offer.discount || 0;
    const discountedPrice = originalPrice > 0 && discountValue > 0
      ? (originalPrice * (1 - discountValue / 100)).toFixed(2)
      : 0;

    return (
      <div className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group ${isListView ? 'flex flex-col sm:flex-row' : ''}`}>
        <div className={`relative ${isListView ? 'sm:w-1/3' : ''}`}>
          <StableImage
            src={offer.image_url || offer.service?.image_url}
            fallbackSrc={OFFER_IMAGE_FALLBACK}
            alt={offer.title || offer.description}
            className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${isListView ? 'h-48 sm:h-full' : 'h-48'}`}
          />

          <button
            className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Heart size={16} className="text-gray-600" />
          </button>

          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
              {offer.service?.category || offer.category || 'Special Offer'}
            </span>
          </div>

          {offer.featured && (
            <div className="absolute top-3 left-3">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                FEATURED
              </span>
            </div>
          )}
        </div>

        <div className={`p-4 ${isListView ? 'sm:flex-1' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
              <StableImage
                src={storeData?.logo || storeData?.logo_url}
                fallbackSrc={SMALL_LOGO_FALLBACK}
                alt="Store logo"
                className="w-5 h-5 rounded-full object-cover"
              />
            </div>

            <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-blue-400">
              <span>{storeData?.name || 'Store'}</span>
            </div>
          </div>

          <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
            {offer.title || offer.service?.name || offer.description || 'Special Offer'}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {offer.description || offer.service?.description || 'Get exclusive offers with this amazing deal'}
          </p>

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

          {offer.expiry_date && (
            <div className="mt-2 text-xs text-gray-500">
              Expires: {new Date(offer.expiry_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  });

  // Reel Card Component
  const ReelCard = React.memo(({ reel }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = React.useRef(null);

    const handlePlayPause = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    const handleMuteToggle = (e) => {
      e.stopPropagation();
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    const handleReelClick = async () => {
      try {
        // Track view
        await reelService.trackView(reel.id);

        // Navigate to full reel view or open in modal
        navigate(`/reels/${reel.id}`);
      } catch (error) {
        console.error('Error tracking reel view:', error);
      }
    };

    const handleLike = async (e) => {
      e.stopPropagation();
      try {
        await reelService.toggleLike(reel.id);
        // Update local state or refetch reels
        fetchReels();
      } catch (error) {
        console.error('Error liking reel:', error);
        if (error.message.includes('Authentication required')) {
          setError('Please log in to like reels');
          navigate('/accounts/sign-in', {
            state: { from: { pathname: location.pathname } }
          });
        }
      }
    };

    const formatCount = (count) => {
      if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
      return count.toString();
    };

    return (
      <div
        className="relative bg-black rounded-xl overflow-hidden cursor-pointer group aspect-[9/16] max-h-[600px]"
        onClick={handleReelClick}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={reel.video_url}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          poster={reel.thumbnail_url}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Play/Pause button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {!isPlaying && (
            <div className="bg-white/30 backdrop-blur-sm rounded-full p-6">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          )}
        </button>

        {/* Mute/Unmute button */}
        <button
          onClick={handleMuteToggle}
          className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Content info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {/* Title and description */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
              {reel.title || 'Check out this reel!'}
            </h3>
            {reel.description && (
              <p className="text-sm text-gray-200 line-clamp-2">
                {reel.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                <span>{formatCount(reel.views || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className={`w-4 h-4 ${reel.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{formatCount(reel.likes || 0)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition-colors ${reel.isLiked
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white/20 hover:bg-white/30'
                  }`}
              >
                <Heart className={`w-5 h-5 ${reel.isLiked ? 'fill-white' : ''}`} />
              </button>

              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await reelService.trackChat(reel.id);
                    handleChatClick();
                  } catch (error) {
                    console.error('Error tracking chat:', error);
                  }
                }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category badge */}
        {reel.category && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
              {reel.category}
            </span>
          </div>
        )}
      </div>
    );
  });

  const getSocialIcon = (platform) => {
    const platformLower = platform.toLowerCase();

    switch (platformLower) {
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'twitter':
      case 'x':
        return <Twitter className="w-5 h-5 text-blue-400" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-blue-700" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-600" />;
      case 'website':
      case 'web':
        return <Globe className="w-5 h-5 text-gray-600" />;
      case 'tiktok':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        );
      case 'whatsapp':
        return (
          <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        );
      default:
        return <Globe className="w-5 h-5 text-gray-600" />;
    }
  };

  // Enhanced Outlet Card Component
  const OutletCard = React.memo(({ branch }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{branch.name}</h3>
        {branch.isMainBranch && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
            Main Branch
          </span>
        )}
      </div>

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
  ));

  // Google Maps Component
  const GoogleMap = ({ branches, center }) => {
    const mapRef = React.useRef(null);
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [mapError, setMapError] = React.useState(null);

    React.useEffect(() => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      setMapError('Google Maps API key required');
    }, []);

    const initializeMap = () => {
      try {
        if (!mapRef.current || !window.google) return;

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
    const getMapCenter = () => {
      if (branches.length === 0) return null;

      if (branches.length === 1) {
        const branch = branches[0];
        if (branch.latitude && branch.longitude) {
          return {
            lat: parseFloat(branch.latitude),
            lng: parseFloat(branch.longitude)
          };
        }
        return { lat: -1.2921, lng: 36.8219 };
      }

      const validCoords = branches.filter(b => b.latitude && b.longitude);
      if (validCoords.length > 0) {
        const avgLat = validCoords.reduce((sum, b) => sum + parseFloat(b.latitude), 0) / validCoords.length;
        const avgLng = validCoords.reduce((sum, b) => sum + parseFloat(b.longitude), 0) / validCoords.length;
        return { lat: avgLat, lng: avgLng };
      }

      return { lat: -1.2921, lng: 36.8219 };
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Store Locations</h3>
          <p className="text-gray-600">
            {branches.length} {branches.length === 1 ? 'location' : 'locations'} available
          </p>
        </div>

        <div className="p-6">
          <GoogleMap branches={branches} center={getMapCenter()} />
        </div>

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
              <h2 className="text-2xl font-bold text-gray-900">Active Offers</h2>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No active offers available</h3>
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
                  <ServiceCard key={service.id} service={service} storeId={id} />
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

      case 'reels':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Store Reels</h2>
              <span className="text-sm text-gray-500">
                {reels.length} {reels.length === 1 ? 'reel' : 'reels'}
              </span>
            </div>

            {reelsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="ml-2 text-gray-600">Loading reels...</span>
              </div>
            ) : reels.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {reels.map((reel) => (
                  <ReelCard key={reel.id} reel={reel} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Play className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reels available</h3>
                <p className="text-gray-600">This store hasn't posted any reels yet. Check back later!</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
        {/* Store Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8">
          {/* Logo and Name Row - Mobile Optimized */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <StableImage
              src={storeData.logo || storeData.logo_url}
              fallbackSrc={STORE_LOGO_FALLBACK}
              alt={storeData.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-gray-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
                {storeData.name}
              </h1>

              {/* Rating and Followers - Mobile Friendly */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3">
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

              {/* Category and Location - Stacked on Mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                {storeData.category && (
                  <span className="bg-gray-100 px-2 py-1 rounded inline-block w-fit">{storeData.category}</span>
                )}
                {storeData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{storeData.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description with Show More/Less */}
          {storeData.description && (
            <div className="mb-4">
              <div className={`text-gray-600 text-sm sm:text-base ${descriptionExpanded ? '' : 'line-clamp-2'}`}>
                {storeData.description}
              </div>
              {storeData.description.length > 100 && (
                <button
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium mt-1 flex items-center"
                >
                  {descriptionExpanded ? (
                    <>
                      Show less <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Social Links - Scrollable on Mobile */}
          {((storeData.socialLinksRaw && storeData.socialLinksRaw.length > 0) ||
            storeData.website_url ||
            (storeData.socialLinks && Object.keys(storeData.socialLinks).length > 0)) && (
              <div className="mb-4 overflow-x-auto">
                <div className="flex items-center gap-2 sm:gap-3 pb-2">
                  {storeData.socialLinksRaw && storeData.socialLinksRaw.length > 0 ? (
                    <>
                      {storeData.socialLinksRaw.map((social) => (
                        <a
                          key={social.id}
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110 transform duration-200 flex-shrink-0"
                          title={`Visit our ${social.platform} page`}
                        >
                          {getSocialIcon(social.platform)}
                        </a>
                      ))}

                      {storeData.website_url && (
                        <a
                          href={storeData.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110 transform duration-200 flex-shrink-0"
                          title="Visit our website"
                        >
                          <Globe className="w-5 h-5 text-gray-600" />
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      {storeData.socialLinks?.facebook && (
                        <a href={storeData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110 transform duration-200 flex-shrink-0">
                          <Facebook className="w-5 h-5 text-blue-600" />
                        </a>
                      )}
                      {storeData.socialLinks?.twitter && (
                        <a href={storeData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110 transform duration-200 flex-shrink-0">
                          <Twitter className="w-5 h-5 text-sky-500" />
                        </a>
                      )}
                      {storeData.socialLinks?.instagram && (
                        <a href={storeData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110 transform duration-200 flex-shrink-0">
                          <Instagram className="w-5 h-5 text-pink-600" />
                        </a>
                      )}
                      {storeData.socialLinks?.linkedin && (
                        <a href={storeData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110 transform duration-200 flex-shrink-0">
                          <Linkedin className="w-5 h-5 text-blue-700" />
                        </a>
                      )}
                      {storeData.socialLinks?.youtube && (
                        <a href={storeData.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110 transform duration-200 flex-shrink-0">
                          <Youtube className="w-5 h-5 text-red-600" />
                        </a>
                      )}
                      {storeData.socialLinks?.website && (
                        <a href={storeData.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110 transform duration-200 flex-shrink-0">
                          <Globe className="w-5 h-5 text-gray-600" />
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

          {/* Action Buttons - Full Width on Mobile */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={toggleFollow}
              disabled={toggleFollowLoading}
              className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg border transition-colors disabled:opacity-50 ${isFollowing
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
              className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {startingChat ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              {startingChat ? 'Starting Chat...' : 'Chat'}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveSection('offers')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeSection === 'offers'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Tag className="w-4 h-4" />
                <span>Offers</span>
                {!offersLoading && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeSection === 'offers' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                    {offers.length || storeData.deals?.length || 0}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSection('services')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeSection === 'services'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Camera className="w-4 h-4" />
                <span>Services</span>
                {!servicesLoading && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeSection === 'services' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                    {services.length || storeData.services?.length || 0}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSection('reels')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeSection === 'reels'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Play className="w-4 h-4" />
                <span>Reels</span>
                {!reelsLoading && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeSection === 'reels' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                    {reels.length || 0}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSection('outlets')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeSection === 'outlets'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Outlets</span>
                {!branchesLoading && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeSection === 'outlets' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                    {branches.length || storeData.outlets?.length || 0}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSection('map')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeSection === 'map'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Navigation className="w-4 h-4" />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Based on Active Section */}
        <div ref={contentSectionRef}>
          {renderActiveSection()}
        </div>

        {/* Reviews Section */}
        <ReviewSection
          storeData={storeData}
          storeId={id}
          onNavigate={navigate}
          location={location}
          onRefreshStore={(newReviews) => {
            setStoreData(prev => ({
              ...prev,
              reviews: newReviews
            }));
          }}
        />
      </div>

      <Footer />
    </div>
  );
};

export default StoreViewPage;