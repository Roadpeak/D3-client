// pages/Reels.jsx - TikTok-inspired Reels Page for Professional Services
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReelVideo from '../components/reels/ReelVideo';
import authService from '../services/authService';
import reelService from '../services/reelsService';

const Reels = () => {
    const [reels, setReels] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadReels();
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            if (authService.isAuthenticated()) {
                const result = await authService.getCurrentUser();
                if (result.success) {
                    setUser(result.data?.user || result.user || result.data);
                }
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        }
    };

    const loadReels = async (offset = 0) => {
        try {
            if (offset === 0) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            console.log('📱 Loading reels feed...', { offset });

            const response = await reelService.getReelsFeed({
                limit: 10,
                offset: offset,
                sort: 'recent'
            });

            console.log('📋 Reels API response:', response);

            // ✅ FIXED: Handle the actual response structure from your API
            let reelsData = [];

            if (response && response.success && response.data) {
                // Check if data is directly an array or has a reels property
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
                    duration: reel.service?.duration || 'N/A'
                },
                description: reel.description || reel.caption || reel.title || '',
                likes: reel.likes || reel.likes_count || 0,
                comments: reel.comments || reel.comments_count || 0,
                shares: reel.shares || reel.shares_count || 0,
                views: reel.views || reel.views_count || 0,
                isLiked: reel.isLiked || reel.is_liked || false,
                createdAt: reel.createdAt || formatTimeAgo(reel.created_at)
            }));

            console.log('✅ Formatted reels:', newReels.length);

            if (offset === 0) {
                setReels(newReels);
            } else {
                setReels(prev => [...prev, ...newReels]);
            }

            // Check pagination
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

            // Show user-friendly error message
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

        // Update current index
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
            setCurrentIndex(newIndex);

            // Track view for the current reel
            if (reels[newIndex]) {
                reelService.trackView(reels[newIndex].id, 0).catch(err => {
                    console.error('Error tracking view:', err);
                });
            }
        }

        // Load more reels when near the end
        if (scrollTop + clientHeight >= scrollHeight - clientHeight && hasMore && !isLoadingMore) {
            loadReels(reels.length);
        }
    };

    const handleLike = async (reelId) => {
        // Check if user is authenticated
        if (!user) {
            alert('Please log in to like reels');
            navigate('/login');
            return;
        }

        try {
            // Optimistic update
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

            // API call
            const response = await reelService.toggleLike(reelId);

            console.log('Like response:', response);

            if (response && response.success && response.data) {
                // Update with actual values from server
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
            // Revert optimistic update on error
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

    const handleComment = (reelId) => {
        // Deprecated - replaced with chat functionality
        console.log('Comments deprecated, use chat instead');
    };

    const handleChat = async (reel) => {
        try {
            // Track chat initiation
            await reelService.trackChat(reel.id).catch(err => {
                console.error('Error tracking chat:', err);
            });

            // Navigate to chat with the store
            navigate(`/chat/Store/${reel.store.id}`, {
                state: {
                    reelId: reel.id,
                    reelTitle: reel.service.name,
                    message: `Hi! I'm interested in your service: ${reel.service.name}`
                }
            });
        } catch (error) {
            console.error('Error initiating chat:', error);
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

                // Track share
                await reelService.trackShare(reelId).catch(err => {
                    console.error('Error tracking share:', err);
                });
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');

                // Track share
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

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white text-lg">Loading reels...</p>
                </div>
            </div>
        );
    }

    if (reels.length === 0) {
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

    return (
        <div className="fixed inset-0 bg-black overflow-hidden">
            {/* Reels Container - Snap Scroll */}
            <div
                ref={containerRef}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                onScroll={handleScroll}
                style={{
                    scrollSnapType: 'y mandatory',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {reels.map((reel, index) => (
                    <ReelVideo
                        key={reel.id}
                        reel={reel}
                        isActive={index === currentIndex}
                        onLike={handleLike}
                        onComment={handleComment}
                        onChat={handleChat}
                        onShare={handleShare}
                        onBook={handleBook}
                        onStoreClick={handleStoreClick}
                        user={user}
                    />
                ))}

                {/* Loading More Indicator */}
                {isLoadingMore && (
                    <div className="h-screen flex items-center justify-center bg-black">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {/* Top Header */}
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
                        <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                        <span className="text-white/80 text-sm">Professional Services</span>
                    </div>

                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Progress Indicator
            <div className="fixed top-20 left-0 right-0 z-40 flex justify-center space-x-1 px-4">
                {reels.slice(0, Math.min(10, reels.length)).map((_, index) => (
                    <div
                        key={index}
                        className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white' : 'bg-white/30'
                            }`}
                    ></div>
                ))}
            </div> */}

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