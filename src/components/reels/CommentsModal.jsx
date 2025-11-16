// components/reels/CommentsModal.jsx - Comments Modal for Reels
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, MoreVertical } from 'lucide-react';

const CommentsModal = ({ isOpen, onClose, reel, user }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const inputRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            loadComments();
            // Focus input when modal opens
            setTimeout(() => inputRef.current?.focus(), 100);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const loadComments = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // const response = await reelsService.getComments(reel.id);

            // Mock comments data
            const mockComments = [
                {
                    id: 1,
                    user: {
                        id: 1,
                        name: 'Sarah Johnson',
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
                    },
                    text: 'This looks amazing! Definitely booking next week 🔥',
                    likes: 12,
                    isLiked: false,
                    createdAt: '2h ago',
                    replies: 2
                },
                {
                    id: 2,
                    user: {
                        id: 2,
                        name: 'Michael Chen',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
                    },
                    text: 'How much is the service? Can I book for this weekend?',
                    likes: 5,
                    isLiked: false,
                    createdAt: '4h ago',
                    replies: 1
                },
                {
                    id: 3,
                    user: {
                        id: 3,
                        name: 'Emma Williams',
                        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
                    },
                    text: "I've been here before - totally worth it! ❤️",
                    likes: 8,
                    isLiked: true,
                    createdAt: '1d ago',
                    replies: 0
                }
            ];

            setComments(mockComments);
            setLoading(false);
        } catch (error) {
            console.error('Error loading comments:', error);
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || sending) return;

        try {
            setSending(true);
            // TODO: API call to post comment
            // await reelsService.postComment(reel.id, newComment);

            // Optimistically add comment
            const newCommentObj = {
                id: Date.now(),
                user: {
                    id: user?.id || 999,
                    name: user?.firstName + ' ' + user?.lastName || 'Anonymous',
                    avatar: user?.avatar || null
                },
                text: newComment,
                likes: 0,
                isLiked: false,
                createdAt: 'Just now',
                replies: 0
            };

            setComments(prev => [newCommentObj, ...prev]);
            setNewComment('');
            setSending(false);
        } catch (error) {
            console.error('Error posting comment:', error);
            setSending(false);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            setComments(prev =>
                prev.map(comment =>
                    comment.id === commentId
                        ? {
                            ...comment,
                            isLiked: !comment.isLiked,
                            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                        }
                        : comment
                )
            );
            // TODO: API call to like/unlike comment
            // await reelsService.toggleCommentLike(commentId);
        } catch (error) {
            console.error('Error toggling comment like:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative w-full sm:w-full sm:max-w-lg bg-gradient-to-b from-gray-900 to-black sm:rounded-t-3xl rounded-t-3xl max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-2xl border-t border-gray-800"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/50 backdrop-blur-md rounded-t-3xl">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-white font-semibold text-lg">
                            Comments
                        </h3>
                        <span className="text-gray-400 text-sm">
                            {reel.comments || comments.length}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 text-center">No comments yet.<br />Be the first to comment!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex space-x-3">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {comment.user.avatar ? (
                                        <img
                                            src={comment.user.avatar}
                                            alt={comment.user.name}
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-800"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-800">
                                            <span className="text-white text-sm font-semibold">
                                                {comment.user.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Comment Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 backdrop-blur-sm border border-white/10">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white font-semibold text-sm">
                                                {comment.user.name}
                                            </span>
                                            <button className="text-gray-400 hover:text-white transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-gray-200 text-sm leading-relaxed break-words">
                                            {comment.text}
                                        </p>
                                    </div>

                                    {/* Comment Actions */}
                                    <div className="flex items-center space-x-4 mt-2 px-2">
                                        <span className="text-gray-500 text-xs">
                                            {comment.createdAt}
                                        </span>
                                        <button
                                            onClick={() => handleLikeComment(comment.id)}
                                            className={`flex items-center space-x-1 text-xs transition-colors ${comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                                }`}
                                        >
                                            <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                                            {comment.likes > 0 && <span>{comment.likes}</span>}
                                        </button>
                                        <button className="text-gray-400 hover:text-white text-xs transition-colors">
                                            Reply
                                        </button>
                                        {comment.replies > 0 && (
                                            <button className="text-blue-400 hover:text-blue-300 text-xs transition-colors">
                                                View {comment.replies} {comment.replies === 1 ? 'reply' : 'replies'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Input */}
                <div className="p-4 border-t border-gray-800 bg-black/50 backdrop-blur-md">
                    <form onSubmit={handleSubmitComment} className="flex items-end space-x-3">
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="You"
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-800"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-800">
                                    <span className="text-white text-sm font-semibold">
                                        {user?.firstName?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Input Field */}
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || sending}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                            >
                                {sending ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Send className="w-4 h-4 text-white" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
        @media (max-width: 640px) {
          .modal-container {
            border-radius: 24px 24px 0 0;
          }
        }
      `}</style>
        </div>
    );
};

export default CommentsModal;