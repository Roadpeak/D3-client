// pages/Reels.jsx - TikTok-inspired Reels Page for Professional Services
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReelVideo from '../components/reels/ReelVideo';
import authService from '../services/authService';
import reelService from '../services/reelsService';
import chatService from '../services/chatService';
import { getTokenFromCookie, BASE_URL } from '../config/api';
import { X, Check } from 'lucide-react';

// Fisher-Yates shuffle algorithm for randomizing reels order
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const Reels = () => {
    const [reels, setReels] = useState([]);
    const [filteredReels, setFilteredReels] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false); // ✅ Track if auth is checked
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Helper function to get API headers with auth
    const getApiHeaders = (includeAuth = false) => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (process.env.REACT_APP_API_KEY) {
            headers['x-api-key'] = process.env.REACT_APP_API_KEY;
        }

        if (includeAuth) {
            const token = getTokenFromCookie() || localStorage.getItem('access_token') || localStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    };

    // Fetch follow status for stores
    const fetchFollowStatus = async (storeIds) => {
        // ✅ Only check authentication, not user state
        if (!authService.isAuthenticated() || storeIds.length === 0) {
            return {};
        }

        try {
            console.log('Fetching follow status for stores:', storeIds);

            const followStatusMap = {};

            await Promise.all(
                storeIds.map(async (storeId) => {
                    try {
                        const response = await fetch(
                            `${BASE_URL}/stores/${storeId}`,
                            {
                                headers: getApiHeaders(true)
                            }
                        );

                        if (response.ok) {
                            const data = await response.json();
                            if (data.success && data.store) {
                                followStatusMap[storeId] = data.store.following || false;
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching follow status for store ${storeId}:`, error);
                    }
                })
            );

            console.log('Follow status map:', followStatusMap);
            return followStatusMap;
        } catch (error) {
            console.error('Error fetching follow statuses:', error);
            return {};
        }
    };

    // ✅ Check auth first, then load reels
    useEffect(() => {
        const initializeReels = async () => {
            await checkAuth();
            await loadReels();
        };

        initializeReels();
    }, []);

    // Extract unique categories from reels
    useEffect(() => {
        if (reels.length > 0) {
            const uniqueCategories = [...new Set(reels.map(reel => reel.service?.category).filter(Boolean))];
            setCategories(uniqueCategories);
        }
    }, [reels]);

    // Filter reels when category changes
    useEffect(() => {
        if (selectedCategory) {
            const filtered = reels.filter(reel => reel.service?.category === selectedCategory);
            setFilteredReels(filtered);
        } else {
            setFilteredReels(reels);
        }
        setCurrentIndex(0);
    }, [selectedCategory, reels]);

    const checkAuth = async () => {
        try {
            if (authService.isAuthenticated()) {
                const result = await authService.getCurrentUser();
                if (result.success) {
                    const userData = result.data?.user || result.user || result.data;
                    setUser(userData);
                    console.log('✅ User authenticated:', userData?.id);
                } else {
                    setUser(null);
                    console.log('❌ User not authenticated');
                }
            } else {
                setUser(null);
                console.log('❌ No authentication');
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setUser(null);
        } finally {
            setAuthChecked(true);
        }
    };

    const loadReels = async (offset = 0) => {
        try {
            if (offset === 0) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            console.log('📱 Loading reels feed...', { offset, authenticated: authService.isAuthenticated() });

            const response = await reelService.getReelsFeed({
                limit: 10,
                offset: offset,
                sort: 'recent'
            });

            console.log('📋 Reels API response:', response);

            let reelsData = [];

            if (response && response.success && response.data) {
                reelsData = Array.isArray(response.data) ? response.data : (response.data.reels || []);
            } else if (response && Array.isArray(response.data)) {
                reelsData = response.data;
            } else if (Array.isArray(response)) {
                reelsData = response;
            }

            console.log('✅ Reels data extracted:', reelsData.length, 'reels');

            const newReels = reelsData.map(reel => ({
                id: reel.id,
                videoUrl: reel.videoUrl || reel.video_url,
                thumbnail: reel.thumbnail || reel.thumbnail_url || reel.videoUrl || reel.video_url,
                store: {
                    id: reel.store?.id,
                    name: reel.store?.name || 'Unknown Store',
                    avatar: reel.store?.avatar || reel.store?.logo_url || reel.store?.avatar_url || '/default-avatar.png',
                    verified: reel.store?.verified || false
                },
                service: {
                    id: reel.service?.id,
                    name: reel.service?.name || 'Service',
                    price: reel.service?.price || 0,
                    duration: reel.service?.duration || 'N/A',
                    category: reel.service?.category || 'General'
                },
                description: reel.description || reel.caption || reel.title || '',
                likes: reel.likes || reel.likes_count || 0,
                comments: reel.comments || reel.comments_count || 0,
                shares: reel.shares || reel.shares_count || 0,
                views: reel.views || reel.views_count || 0,
                isLiked: reel.isLiked || reel.is_liked || false,
                isFollowing: false, // ✅ Always start with false, fetch real status below
                createdAt: reel.createdAt || formatTimeAgo(reel.created_at)
            }));

            console.log('✅ Formatted reels:', newReels.length);

            if (offset === 0) {
                // Shuffle reels on initial load for randomized appearance
                setReels(shuffleArray(newReels));
            } else {
                // Shuffle only the new reels before appending
                setReels(prev => [...prev, ...shuffleArray(newReels)]);
            }

            // ✅ ALWAYS fetch follow status if user is authenticated
            if (authService.isAuthenticated() && newReels.length > 0) {
                console.log('🔍 Fetching follow status for all stores...');
                const storeIds = [...new Set(newReels.map(reel => reel.store?.id).filter(Boolean))];
                const followStatusMap = await fetchFollowStatus(storeIds);

                console.log('📊 Follow status received:', followStatusMap);

                if (Object.keys(followStatusMap).length > 0) {
                    // Update all reels with correct follow status
                    setReels(prevReels =>
                        prevReels.map(reel => ({
                            ...reel,
                            isFollowing: followStatusMap[reel.store?.id] || false
                        }))
                    );

                    console.log('✅ Follow status updated for all reels');
                } else {
                    console.log('⚠️ No follow status data received');
                }
            } else if (!authService.isAuthenticated()) {
                console.log('👤 User not authenticated - all follow buttons will show');
            }

            const hasMoreReels = response?.pagination?.hasMore ||
                response?.data?.pagination?.hasMore ||
                newReels.length === 10;

            setHasMore(hasMoreReels);

            setLoading(false);
            setIsLoadingMore(false);

            if (newReels.length === 0 && offset === 0) {
                console.log('ℹ️ No reels found');
            }
        } catch (error) {
            console.error('💥 Error loading reels:', error);
            setLoading(false);
            setIsLoadingMore(false);

            if (error.message) {
                console.error('Error details:', error.message);
            }
        }
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Recently';

        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now - then) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return `${Math.floor(seconds / 604800)}w ago`;
    };

    const handleScroll = (e) => {
        const container = containerRef.current;
        if (!container) return;

        const scrollTop = container.scrollTop;
        const clientHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;
        const newIndex = Math.round(scrollTop / clientHeight);

        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < filteredReels.length) {
            setCurrentIndex(newIndex);

            if (filteredReels[newIndex]) {
                reelService.trackView(filteredReels[newIndex].id, 0).catch(err => {
                    console.error('Error tracking view:', err);
                });
            }
        }

        if (scrollTop + clientHeight >= scrollHeight - clientHeight && hasMore && !isLoadingMore) {
            loadReels(reels.length);
        }
    };

    const handleLike = async (reelId) => {
        if (!user) {
            alert('Please log in to like reels');
            navigate('/login');
            return;
        }

        try {
            setReels(prevReels =>
                prevReels.map(reel =>
                    reel.id === reelId
                        ? {
                            ...reel,
                            isLiked: !reel.isLiked,
                            likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1
                        }
                        : reel
                )
            );

            const response = await reelService.toggleLike(reelId);

            console.log('Like response:', response);

            if (response && response.success && response.data) {
                setReels(prevReels =>
                    prevReels.map(reel =>
                        reel.id === reelId
                            ? {
                                ...reel,
                                isLiked: response.data.isLiked,
                                likes: response.data.totalLikes || reel.likes
                            }
                            : reel
                    )
                );
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            setReels(prevReels =>
                prevReels.map(reel =>
                    reel.id === reelId
                        ? {
                            ...reel,
                            isLiked: !reel.isLiked,
                            likes: reel.isLiked ? reel.likes + 1 : reel.likes - 1
                        }
                        : reel
                )
            );

            alert('Failed to like reel. Please try again.');
        }
    };

    const handleFollow = async (storeId, reelId) => {
        if (!user || !authService.isAuthenticated()) {
            alert('Please log in to follow stores');
            navigate('/login');
            return;
        }

        try {
            console.log('Following store:', storeId);

            // Optimistic update - update ALL reels from this store
            setReels(prevReels =>
                prevReels.map(reel =>
                    reel.store?.id === storeId
                        ? {
                            ...reel,
                            isFollowing: !reel.isFollowing
                        }
                        : reel
                )
            );

            const response = await fetch(`${BASE_URL}/stores/${storeId}/toggle-follow`, {
                method: 'POST',
                headers: getApiHeaders(true),
                credentials: 'include'  // Send HttpOnly cookies with requests
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Your session has expired. Please log in again.');
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to toggle follow status');
            }

            const data = await response.json();
            console.log('Follow response:', data);

            // Update with server response for ALL reels from this store
            setReels(prevReels =>
                prevReels.map(reel =>
                    reel.store?.id === storeId
                        ? {
                            ...reel,
                            isFollowing: data.following
                        }
                        : reel
                )
            );
        } catch (error) {
            console.error('Error toggling follow:', error);
            // Revert on error
            setReels(prevReels =>
                prevReels.map(reel =>
                    reel.store?.id === storeId
                        ? {
                            ...reel,
                            isFollowing: !reel.isFollowing
                        }
                        : reel
                )
            );
            alert('Failed to follow store. Please try again.');
        }
    };

    const handleChat = async (reel) => {
        if (!user) {
            alert('Please log in to chat with stores');
            navigate('/login');
            return;
        }

        try {
            await reelService.trackChat(reel.id).catch(err => {
                console.error('Error tracking chat:', err);
            });

            const storeId = reel.store.id;
            const conversationsResponse = await chatService.getConversations('customer');

            if (conversationsResponse.success) {
                const existingConversation = conversationsResponse.data.find(
                    conv => conv.store && (conv.store.id === storeId)
                );

                if (existingConversation) {
                    navigate('/chat', {
                        state: {
                            selectedConversation: existingConversation,
                            storeData: reel.store,
                            user: { ...user, userType: 'customer', role: 'customer' },
                            userType: 'customer'
                        }
                    });
                } else {
                    const initialMessage = `Hi! I'm interested in ${reel.service.name}. Could you help me with some information?`;
                    const newConversationResponse = await chatService.startConversation(storeId, initialMessage);

                    if (newConversationResponse.success) {
                        const newConversation = {
                            id: newConversationResponse.data.conversationId,
                            store: {
                                id: storeId,
                                name: reel.store.name,
                                avatar: reel.store.avatar,
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
                                storeData: reel.store,
                                user: { ...user, userType: 'customer', role: 'customer' },
                                userType: 'customer'
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error initiating chat:', error);
            alert('Failed to start chat. Please try again.');
        }
    };

    const handleShare = async (reelId) => {
        try {
            const shareUrl = `${window.location.origin}/reels/${reelId}`;

            if (navigator.share) {
                await navigator.share({
                    title: 'Check out this service on Discoun3ree',
                    text: 'Amazing service deal!',
                    url: shareUrl
                });

                await reelService.trackShare(reelId).catch(err => {
                    console.error('Error tracking share:', err);
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');

                await reelService.trackShare(reelId).catch(err => {
                    console.error('Error tracking share:', err);
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleBook = (reel) => {
        navigate(`/booking/service/${reel.service.id}`, {
            state: {
                reelId: reel.id,
                storeId: reel.store.id
            }
        });
    };

    const handleStoreClick = (storeId) => {
        navigate(`/store/${storeId}`);
    };

    const CategoryFilter = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowCategoryFilter(false)}>
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="text-lg font-bold">Filter by Category</h3>
                    <button onClick={() => setShowCategoryFilter(false)} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto max-h-[60vh] p-4">
                    <button
                        onClick={() => {
                            setSelectedCategory(null);
                            setShowCategoryFilter(false);
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 transition-colors ${!selectedCategory ? 'bg-blue-500 text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                        <span className="font-medium">All Categories</span>
                        {!selectedCategory && <Check className="w-5 h-5" />}
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                setShowCategoryFilter(false);
                            }}
                            className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 transition-colors ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <span className="font-medium">{category}</span>
                            {selectedCategory === category && <Check className="w-5 h-5" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // Skeleton loader for reels page
    const ReelSkeleton = () => (
        <div className="fixed inset-0 bg-black">
            {/* Header skeleton */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                    <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
                    <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                </div>
            </div>

            {/* Main content skeleton */}
            <div className="h-full w-full flex flex-col">
                {/* Video area skeleton */}
                <div className="flex-1 relative bg-gray-900 animate-pulse">
                    {/* Center play button skeleton */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/10" />
                    </div>
                </div>

                {/* Right side actions skeleton */}
                <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
                    {/* Profile */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse" />
                        <div className="w-6 h-6 rounded-full bg-white/20 animate-pulse -mt-3" />
                    </div>
                    {/* Like */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                        <div className="w-8 h-3 bg-white/10 rounded animate-pulse" />
                    </div>
                    {/* Comment */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                        <div className="w-8 h-3 bg-white/10 rounded animate-pulse" />
                    </div>
                    {/* Share */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                        <div className="w-8 h-3 bg-white/10 rounded animate-pulse" />
                    </div>
                </div>

                {/* Bottom info skeleton */}
                <div className="absolute bottom-0 left-0 right-16 p-4">
                    {/* Store name */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
                        <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
                        <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse" />
                    </div>
                    {/* Description */}
                    <div className="space-y-2 mb-3">
                        <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
                    </div>
                    {/* Service card skeleton */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-white/20 rounded" />
                                <div className="h-3 w-16 bg-white/10 rounded" />
                            </div>
                            <div className="h-8 w-20 bg-white/20 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <ReelSkeleton />;
    }

    if (filteredReels.length === 0 && !selectedCategory) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4 text-center px-6">
                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-white text-xl font-semibold">No Reels Available</h2>
                    <p className="text-gray-400">Check back later for new content!</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (filteredReels.length === 0 && selectedCategory) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4 text-center px-6">
                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-white text-xl font-semibold">No Reels in "{selectedCategory}"</h2>
                    <p className="text-gray-400">Try selecting a different category</p>
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all"
                    >
                        View All Reels
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black overflow-hidden">
            <div
                ref={containerRef}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                onScroll={handleScroll}
                style={{
                    scrollSnapType: 'y mandatory',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {filteredReels.map((reel, index) => (
                    <ReelVideo
                        key={reel.id}
                        reel={reel}
                        isActive={index === currentIndex}
                        onLike={handleLike}
                        onFollow={handleFollow}
                        onChat={handleChat}
                        onShare={handleShare}
                        onBook={handleBook}
                        onStoreClick={handleStoreClick}
                        user={user}
                    />
                ))}

                {isLoadingMore && (
                    <div className="h-screen flex items-center justify-center bg-black">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex items-center space-x-3">
                        <span className="text-white font-semibold text-lg">Reels</span>
                        {selectedCategory && (
                            <>
                                <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                                <span className="text-white/80 text-sm">{selectedCategory}</span>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setShowCategoryFilter(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {showCategoryFilter && <CategoryFilter />}

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Reels;