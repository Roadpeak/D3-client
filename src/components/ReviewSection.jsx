import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Star, Edit2, Save, X } from 'lucide-react';
import reviewService from '../services/reviewService';

const ReviewSection = ({
  storeData,
  storeId,
  onNavigate,
  location,
  onRefreshStore
}) => {
  // Local state for reviews and user management
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Review form state
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Edit review state
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewData, setEditReviewData] = useState({ rating: 0, comment: '' });
  const [updatingReview, setUpdatingReview] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Get current user info
  const getCurrentUser = () => {
    try {
      // Check authentication
      const token = localStorage.getItem('access_token') || 
                   localStorage.getItem('authToken') || 
                   getCookieValue('access_token');
      
      if (!token) {
        return { isLoggedIn: false, error: 'Not authenticated' };
      }

      // Get user info from localStorage
      let userInfo = null;
      const possibleKeys = ['userInfo', 'user', 'userData', 'currentUser'];

      for (const key of possibleKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.id || parsed.userId)) {
              userInfo = parsed;
              console.log(`✅ User info found in localStorage.${key}:`, userInfo);
              break;
            }
          }
        } catch (e) {
          console.log(`⚠️ Failed to parse ${key}:`, e.message);
        }
      }

      if (!userInfo || (!userInfo.id && !userInfo.userId)) {
        console.error('❌ No valid user info found in localStorage');
        return { isLoggedIn: false, error: 'User info not found' };
      }

      // Format display name
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

      return {
        isLoggedIn: true,
        id: userInfo.id || userInfo.userId,
        name: displayName,
        email: userInfo.email || userInfo.email_address,
        userType: 'customer',
        rawUserInfo: userInfo
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { isLoggedIn: false, error: 'Failed to parse user info' };
    }
  };

  // Helper function to get cookie value
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

  // Fetch reviews for the store
  const fetchReviews = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      console.log('📖 Fetching reviews for store:', storeId, 'page:', page);

      const response = await reviewService.getStoreReviews(storeId, {
        page,
        limit: 10,
        sortBy: 'newest'
      });

      console.log('📖 Reviews response:', response);

      if (response.success) {
        const newReviews = response.reviews || [];
        
        if (append) {
          setReviews(prev => [...prev, ...newReviews]);
        } else {
          setReviews(newReviews);
        }
        
        setReviewStats(response.stats);
        setPagination(response.pagination || {
          currentPage: page,
          totalPages: 1,
          hasNextPage: false
        });

        // Update store data if callback provided
        if (onRefreshStore && !append) {
          onRefreshStore(newReviews);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more reviews
  const loadMoreReviews = async () => {
    if (!pagination.hasNextPage || loadingMore) return;
    
    setLoadingMore(true);
    await fetchReviews(pagination.currentPage + 1, true);
  };

  // Initialize component
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (storeId) {
      fetchReviews();
    }
  }, [storeId]);

  // Handle success message timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Stars component
  const renderStars = (rating, interactive = false, onRate = null, onHover = null) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${interactive ? 'cursor-pointer' : ''} transition-colors ${
          i < (interactive ? (hoverRating || rating) : Math.floor(rating))
            ? 'fill-yellow-400 text-yellow-400'
            : interactive ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-300'
        }`}
        onClick={interactive ? () => onRate(i + 1) : undefined}
        onMouseEnter={interactive ? () => onHover(i + 1) : undefined}
        onMouseLeave={interactive ? () => onHover(0) : undefined}
      />
    ));
  };

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!currentUser?.isLoggedIn) {
      setError('Please log in to submit a review.');
      onNavigate('/accounts/sign-in', {
        state: { from: { pathname: location.pathname } }
      });
      return;
    }

    if (!newReview.rating || !newReview.comment.trim()) {
      setError('Please provide both a rating and a comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      setError(null);

      console.log('📝 Submitting review:', {
        store_id: storeId,
        rating: newReview.rating,
        text: newReview.comment.trim()
      });

      const response = await reviewService.createReview({
        store_id: storeId,
        rating: newReview.rating,
        text: newReview.comment.trim()
      });

      console.log('✅ Review submission response:', response);

      if (response.success) {
        setSuccess('Thank you for your review! Your feedback has been submitted successfully.');
        setNewReview({ rating: 0, comment: '' });
        setHoverRating(0);
        
        // Refresh reviews
        await fetchReviews();
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      if (error.message.includes('already reviewed')) {
        setError('You have already reviewed this store. You can edit your existing review instead.');
      } else if (error.message.includes('401') || error.message.includes('Authentication')) {
        setError('Your session has expired. Please log in again.');
        onNavigate('/accounts/sign-in', {
          state: { from: { pathname: location.pathname } }
        });
      } else {
        setError(error.message || 'Failed to submit review. Please try again.');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle review editing
  const startEditingReview = (review) => {
    setEditingReview(review.id);
    setEditReviewData({
      rating: review.rating,
      comment: review.text || review.comment || ''
    });
  };

  const cancelEditingReview = () => {
    setEditingReview(null);
    setEditReviewData({ rating: 0, comment: '' });
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editReviewData.rating || !editReviewData.comment.trim()) {
      setError('Please provide both a rating and a comment.');
      return;
    }

    try {
      setUpdatingReview(true);
      setError(null);

      console.log('✏️ Updating review:', reviewId, editReviewData);

      const response = await reviewService.updateReview(reviewId, {
        rating: editReviewData.rating,
        text: editReviewData.comment.trim()
      });

      if (response.success) {
        setSuccess('Your review has been updated successfully!');
        setEditingReview(null);
        setEditReviewData({ rating: 0, comment: '' });
        
        // Refresh reviews
        await fetchReviews();
      } else {
        throw new Error(response.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setError(error.message || 'Failed to update review. Please try again.');
    } finally {
      setUpdatingReview(false);
    }
  };

  // Check if current user can edit a review
  const canEditReview = (review) => {
    return currentUser?.isLoggedIn && 
           currentUser?.id && 
           (review.user?.id === currentUser.id || review.User?.id === currentUser.id);
  };

  const handleLoginRedirect = () => {
    onNavigate('/accounts/sign-in', {
      state: { from: { pathname: location.pathname } }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex">{renderStars(reviewStats?.averageRating || storeData?.rating || 0)}</div>
          <span className="font-medium">{reviewStats?.averageRating || storeData?.rating || 0} out of 5</span>
          <span className="text-gray-500">
            ({(reviewStats?.totalReviews || storeData?.totalReviews || reviews.length || 0).toLocaleString()} reviews)
          </span>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Add Review Form */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
          {currentUser?.isLoggedIn && (
            <div className="text-sm text-gray-600">
              Reviewing as <span className="font-medium text-gray-900">{currentUser.name}</span>
            </div>
          )}
        </div>

        {!currentUser?.isLoggedIn ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium mb-2">Please log in to write a review</p>
            <button
              onClick={handleLoginRedirect}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Log In
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating <span className="text-red-500">*</span>
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
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Share your experience with this store..."
                required
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {newReview.comment.length}/500 characters
              </div>
            </div>

            <button
              onClick={handleReviewSubmit}
              disabled={submittingReview || !newReview.rating || !newReview.comment.trim()}
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <span className="ml-2 text-gray-600">Loading reviews...</span>
          </div>
        ) : reviews && reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Customer Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {(review.name || review.customerName || 'A').charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {review.name || review.customerName || 'Anonymous Customer'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-500">
                          {review.date || new Date(review.createdAt || review.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit button for own reviews */}
                  {canEditReview(review) && editingReview !== review.id && (
                    <button
                      onClick={() => startEditingReview(review)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                      title="Edit your review"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="ml-13">
                  {editingReview === review.id ? (
                    /* Edit form */
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex items-center gap-1">
                          {renderStars(
                            editReviewData.rating,
                            true,
                            (rating) => setEditReviewData({ ...editReviewData, rating })
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                        <textarea
                          value={editReviewData.comment}
                          onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          maxLength={500}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateReview(review.id)}
                          disabled={updatingReview}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {updatingReview ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save
                        </button>
                        
                        <button
                          onClick={cancelEditingReview}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display review */
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment || review.text || 'No comment provided.'}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            {pagination.hasNextPage && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <button
                  onClick={loadMoreReviews}
                  disabled={loadingMore}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Load More Reviews`
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
            <p className="text-sm">Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;