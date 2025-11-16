// components/reels/ReelVideo.jsx - Individual Reel Video Component
import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Calendar, Play, Pause, Volume2, VolumeX, VerifiedIcon as BadgeCheck } from 'lucide-react';

const ReelVideo = ({ reel, isActive, onLike, onComment, onShare, onBook, onStoreClick, onChat, user }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const viewTrackedRef = useRef(false);

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.play().catch(err => console.log('Autoplay prevented:', err));
            setIsPlaying(true);
            viewTrackedRef.current = false;
        } else if (!isActive && videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            setProgress((current / duration) * 100);
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVideoClick = () => {
        togglePlayPause();
        setShowControls(true);

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 2000);
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const formatPrice = (price) => {
        if (!price) return 'KSh 0';
        return `KSh ${price.toLocaleString()}`;
    };

    return (
        <div
            className="relative h-screen w-full snap-start snap-always bg-black"
            style={{ scrollSnapAlign: 'start' }}
        >
            {/* Video Background */}
            <div className="absolute inset-0" onClick={handleVideoClick}>
                {reel.videoUrl ? (
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        src={reel.videoUrl}
                        loop
                        playsInline
                        muted={isMuted}
                        poster={reel.thumbnail}
                        onTimeUpdate={handleTimeUpdate}
                        onError={(e) => {
                            console.error('Video error:', e);
                        }}
                    />
                ) : (
                    // Fallback to thumbnail if video not available
                    <img
                        src={reel.thumbnail}
                        alt={reel.service?.name || 'Service'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = '/default-reel-thumbnail.png';
                        }}
                    />
                )}

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/40 pointer-events-none"></div>
            </div>

            {/* Play/Pause Indicator */}
            {showControls && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
                        {isPlaying ? (
                            <Pause className="w-10 h-10 text-white fill-white" />
                        ) : (
                            <Play className="w-10 h-10 text-white fill-white ml-1" />
                        )}
                    </div>
                </div>
            )}

            {/* Video Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                    className="h-full bg-blue-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end pb-20 pointer-events-none">
                <div className="px-4 space-y-3 pointer-events-auto">
                    {/* Store Info */}
                    <button
                        onClick={() => onStoreClick(reel.store?.id)}
                        className="flex items-center space-x-2 group"
                    >
                        <img
                            src={reel.store?.avatar || '/default-avatar.png'}
                            alt={reel.store?.name || 'Store'}
                            className="w-10 h-10 rounded-full ring-2 ring-white/30 group-hover:ring-blue-400 transition-all"
                            onError={(e) => {
                                e.target.src = '/default-avatar.png';
                            }}
                        />
                        <div className="flex items-center space-x-1">
                            <span className="text-white font-semibold text-sm drop-shadow-lg group-hover:text-blue-400 transition-colors">
                                {reel.store?.name || 'Unknown Store'}
                            </span>
                            {reel.store?.verified && (
                                <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400" />
                            )}
                        </div>
                        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-all">
                            Follow
                        </button>
                    </button>

                    {/* Service Description */}
                    <div className="space-y-1">
                        <p className="text-white text-sm drop-shadow-lg leading-relaxed line-clamp-2">
                            {reel.description || 'Check out this amazing service!'}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-white/90">
                            <span className="drop-shadow-lg">{reel.createdAt}</span>
                            {reel.views > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="drop-shadow-lg">{formatNumber(reel.views)} views</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Service Info Card */}
                    {reel.service && (
                        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold text-sm mb-1">
                                        {reel.service.name}
                                    </h3>
                                    <div className="flex items-center space-x-3 text-xs">
                                        <span className="text-blue-400 font-semibold">
                                            {formatPrice(reel.service.price)}
                                        </span>
                                        {reel.service.duration && (
                                            <>
                                                <span className="text-white/70">•</span>
                                                <span className="text-white/70">{reel.service.duration}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-3 bottom-24 flex flex-col space-y-5 pointer-events-auto">
                {/* Like Button */}
                <button
                    onClick={() => onLike(reel.id)}
                    className="flex flex-col items-center space-y-1 group"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all group-active:scale-90">
                        <Heart
                            className={`w-7 h-7 transition-all ${reel.isLiked
                                    ? 'text-red-500 fill-red-500 scale-110'
                                    : 'text-white group-hover:scale-110'
                                }`}
                        />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-lg">
                        {formatNumber(reel.likes)}
                    </span>
                </button>

                {/* Chat Button (instead of Comments) */}
                <button
                    onClick={() => onChat(reel)}
                    className="flex flex-col items-center space-y-1 group"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all group-active:scale-90">
                        <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-lg">
                        Chat
                    </span>
                </button>

                {/* Share Button */}
                <button
                    onClick={() => onShare(reel.id)}
                    className="flex flex-col items-center space-y-1 group"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all group-active:scale-90">
                        <Share2 className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-lg">
                        {formatNumber(reel.shares)}
                    </span>
                </button>

                {/* Book Now Button */}
                <button
                    onClick={() => onBook(reel)}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50 flex items-center justify-center hover:shadow-blue-500/70 hover:scale-110 transition-all active:scale-95"
                >
                    <Calendar className="w-6 h-6 text-white" />
                </button>

                {/* Mute Button */}
                <button
                    onClick={toggleMute}
                    className="flex flex-col items-center group"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all group-active:scale-90">
                        {isMuted ? (
                            <VolumeX className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                        ) : (
                            <Volume2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                        )}
                    </div>
                </button>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ReelVideo;