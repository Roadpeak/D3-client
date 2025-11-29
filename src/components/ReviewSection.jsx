import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Star, Edit2, Save, X, User, ThumbsUp, Flag } from 'lucide-react';
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
  const [editHoverRating, setEditHoverRating] = useState(0);
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
        limit: 3,
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

  // Stars component with yellow/golden color maintained
  const renderStars = (rating, interactive = false, onRate = null, onHover = null, size = 'w-5 h-5', currentHover = 0) => {
    const stars = [...Array(5)].map((_, i) => {
      const starValue = i + 1;
      const isActive = interactive
        ? starValue <= (currentHover || rating)
        : starValue <= Math.floor(rating);

      return (
        <Star
          key={i}
          className={`${size} ${interactive ? 'cursor-pointer touch-none' : ''} transition-colors ${isActive
              ? 'fill-yellow-400 text-yellow-400'
              : interactive ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-300'
            }`}
          onClick={interactive ? () => {
            onRate(starValue);
            // On mobile, reset hover immediately after click
            if ('ontouchstart' in window) {
              onHover(0);
            }
          } : undefined}
          onMouseEnter={interactive ? () => onHover(starValue) : undefined}
          onTouchStart={interactive ? () => onHover(starValue) : undefined}
        />
      );
    });

    // For interactive stars, wrap in a container with onMouseLeave
    if (interactive) {
      return (
        <div
          className="flex gap-1"
          onMouseLeave={() => onHover(0)}
        >
          {stars}
        </div>
      );
    }

    return stars;
  };

  // User Avatar Component
  const UserAvatar = ({ user, size = 'w-10 h-10' }) => {
    if (user?.avatar || user?.profile_picture) {
      return (
        <img
          src={user.avatar || user.profile_picture}
          alt={user.name || 'User'}
          className={`${size} rounded-full object-cover border border-gray-200`}
        />
      );
    }

    return (
      <div className={`${size} rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center`}>
        <User className="w-1/2 h-1/2 text-gray-400 dark:text-gray-500" />
      </div>
    );
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
    setEditHoverRating(0);
  };

  const cancelEditingReview = () => {
    setEditingReview(null);
    setEditReviewData({ rating: 0, comment: '' });
    setEditHoverRating(0);
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

  // Rating Summary Component
  const RatingSummary = () => {
    const avgRating = reviewStats?.averageRating || storeData?.rating || 0;
    const totalReviews = reviewStats?.totalReviews || storeData?.totalReviews || reviews.length || 0;

    // Calculate rating distribution
    const distribution = [5, 4, 3, 2, 1].map(stars => {
      const count = reviews.filter(r => Math.floor(r.rating) === stars).length;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return { stars, count, percentage };
    });

    return (
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Customer Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">{avgRating.toFixed(1)}</span>
              <div>
                <div className="flex">{renderStars(avgRating, false, null, null, 'w-5 h-5')}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Based on {totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {distribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{stars} star</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Review Card Component
  const ReviewCard = ({ review }) => {
    const [helpful, setHelpful] = useState(false);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-sm dark:hover:shadow-gray-900/50">
        <div className="flex items-start gap-4">
          <UserAvatar
            user={{
              avatar: review.user?.avatar || review.user?.profile_picture,
              name: review.name || review.customerName || review.user?.name
            }}
          />

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {review.name || review.customerName || review.user?.name || 'Anonymous User'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.created_at || review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Edit button for own reviews */}
              {canEditReview(review) && editingReview !== review.id && (
                <button
                  onClick={() => startEditingReview(review)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 ml-2 flex-shrink-0"
                  title="Edit your review"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              {renderStars(review.rating, false, null, null, 'w-4 h-4')}
            </div>

            {editingReview === review.id ? (
              /* Edit form */
              <div className="space-y-3 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                  {renderStars(
                    editReviewData.rating,
                    true,
                    (rating) => setEditReviewData({ ...editReviewData, rating }),
                    (rating) => setEditHoverRating(rating),
                    'w-6 h-6',
                    editHoverRating
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review</label>
                  <textarea
                    value={editReviewData.comment}
                    onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent resize-none"
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {editReviewData.comment.length} / 500 characters
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateReview(review.id)}
                    disabled={updatingReview}
                    className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>

                  <button
                    onClick={cancelEditingReview}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Review Content */}
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {review.comment || review.text || 'No comment provided.'}
                </p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {review.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`Review ${idx + 1}`}
                        className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setHelpful(!helpful)}
                    className={`flex items-center gap-2 text-sm transition-colors ${helpful
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${helpful ? 'fill-current' : ''}`} />
                    <span>Helpful {review.helpful_count ? `(${review.helpful_count})` : ''}</span>
                  </button>

                  <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <Flag className="w-4 h-4" />
                    <span>Report</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <RatingSummary />

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Add Review Form */}
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Write Your Review</h3>

        {!currentUser?.isLoggedIn ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
            <p className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Please log in to write a review</p>
            <button
              onClick={handleLoginRedirect}
              className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Log In
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleReviewSubmit(); }}>
            {/* Rating Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Rating <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              {renderStars(
                newReview.rating,
                true,
                (rating) => {
                  console.log('Setting rating to:', rating);
                  setNewReview({ ...newReview, rating });
                  setHoverRating(0); // Reset hover after selection
                },
                (hover) => {
                  console.log('Hover rating:', hover);
                  setHoverRating(hover);
                },
                'w-8 h-8',
                hoverRating
              )}
              {(hoverRating > 0 || newReview.rating > 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {(hoverRating || newReview.rating) === 1 && 'Poor'}
                  {(hoverRating || newReview.rating) === 2 && 'Fair'}
                  {(hoverRating || newReview.rating) === 3 && 'Good'}
                  {(hoverRating || newReview.rating) === 4 && 'Very Good'}
                  {(hoverRating || newReview.rating) === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Review <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience with this store..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent resize-none"
                required
                maxLength={500}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {newReview.comment.length} / 500 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submittingReview || newReview.rating === 0 || !newReview.comment.trim()}
              className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-900 dark:text-gray-100" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading reviews...</span>
          </div>
        ) : reviews && reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {/* Load More Button */}
            {pagination.hasNextPage && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <button
                  onClick={loadMoreReviews}
                  disabled={loadingMore}
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
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
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No reviews yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to review this store!</p>
            {currentUser?.isLoggedIn && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
              >
                Write the First Review
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;