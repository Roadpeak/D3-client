import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/context/AuthContext';
import StarRating from './StarRating';
import { useNavigate } from 'react-router-dom';
import { getReviewsByReviewable, manageReview } from '../utils/api/api';
import Modal from '../elements/Modal';
import { ClipLoader } from 'react-spinners';

const ReviewComponent = ({ reviewableType, reviewableId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editReview, setEditReview] = useState (null);
    const [deleteReview, setDeleteReview] = useState(null);
    const [newRating, setNewRating] = useState(0);
    const [averageRating, setAverageRating] = useState(null);
    const [totalReviews, setTotalReviews] = useState(null);
    const navigate = useNavigate();

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const { reviews, average_rating, total_reviews } = await getReviewsByReviewable(reviewableType, reviewableId);
            setReviews(reviews);
            setAverageRating(average_rating);
            setTotalReviews(total_reviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [reviewableType, reviewableId]);

    const handleInputChange = (e) => {
        setNewReview(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/accounts/sign-in')
            return;
        }

        if (!newReview.trim()) return;

        setIsLoading(true);
        try {
            await manageReview('post', {
                body: newReview,
                rating: newRating,
                reviewable_type: reviewableType,
                reviewable_id: reviewableId
            });

            setNewReview('');
            fetchReviews();
        } catch (error) {
            console.error('Error posting review:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditChange = (e) => {
        if (editReview) {
            setEditReview({ ...editReview, body: e.target.value });
        }
    };

    const handleEditSubmit = async () => {
        if (editReview) {
            setIsLoading(true);
            try {
                await manageReview('put', { id: editReview.id, body: editReview.body });
                setEditReview(null);
                fetchReviews();
            } catch (error) {
                console.error('Error updating review:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeleteSubmit = async () => {
        if (deleteReview) {
            setIsLoading(true);
            try {
                await manageReview('delete', { id: deleteReview.id });
                setDeleteReview(null);
                fetchReviews();
            } catch (error) {
                console.error('Error deleting review:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full shadow-md border border-gray-100 rounded-md p-4">
            <div className="flex w-full flex-col gap-4 md:flex-row">
                <form onSubmit={handleSubmit} className="w-full md:w-1/2 mb-4">
                    <p className="text-gray-600 text-[14px] font-light mb-2">Post a Review</p>
                    <textarea
                        value={newReview}
                        onChange={handleInputChange}
                        placeholder="Write your review..."
                        className="w-full p-2 bg-white outline-none border text-[14px] border-gray-300 rounded-lg"
                    />
                    <div className="mt-2 flex items-center gap-2">
                        <StarRating rating={newRating} onRatingChange={setNewRating} />
                    </div>
                    <button type="submit" className="mt-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 flex items-center gap-2" disabled={isLoading}>
                        {isLoading ? <ClipLoader color="#fff" /> : 'Submit'}
                    </button>
                </form>

                {isLoading ? (
                    <div className="w-full md:w-1/2 flex justify-center items-center">
                        <ClipLoader color="#fff" />
                    </div>
                ) : (
                    <div className="w-full md:w-1/2 mt-4">
                        <div className="mb-4">
                            <p className="text-gray-600 text-[14px]">
                                {averageRating != null ? (
                                    <StarRating rating={averageRating} onRatingChange={() => { }} />
                                ) : 'No ratings'}
                            </p>
                        </div>
                        {reviews.length === 0 ? (
                            <p className='text-gray-600 text-[14px] font-light'>No reviews yet.</p>
                        ) : (
                            reviews.slice(0, 4).map((review) => (
                                <div key={review.id} className="w-full border-b py-2">
                                    <p className="text-gray-700 font-medium text-[14px]">{review.user_name}</p>
                                    <p className="text-gray-600 font-light text-[13px]">{review.body}</p>
                                    <div className="flex items-center gap-1">
                                        <StarRating rating={review.rating} onRatingChange={() => { }} />
                                    </div>
                                    <p className="text-gray-600 font-light text-[12px]">
                                        {new Date(review.created_at).toLocaleString()}
                                    </p>
                                    {user?.id === review.user_id && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                className="text-blue-600 hover:underline"
                                                onClick={() => setEditReview(review)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-red-600 hover:underline"
                                                onClick={() => setDeleteReview(review)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {editReview && (
                    <Modal isOpen={Boolean(editReview)} onClose={() => setEditReview(null)}>
                        <p className="text-[18px] text-gray-700 font-medium mb-2">Edit Review</p>
                        <textarea
                            value={editReview.body}
                            onChange={handleEditChange}
                            className="w-full p-2 bg-white border outline-none border-gray-300 rounded-lg"
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                className="text-primary text-[15px] font-light mr-2"
                                onClick={() => setEditReview(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-1.5 bg-primary text-white rounded-lg"
                                onClick={handleEditSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? <ClipLoader color="#fff" /> : 'Save'}
                            </button>
                        </div>
                    </Modal>
                )}

                {deleteReview && (
                    <Modal isOpen={Boolean(deleteReview)} onClose={() => setDeleteReview(null)}>
                        <h2 className="text-lg font-semibold mb-2">Delete Review</h2>
                        <p>Are you sure you want to delete this review?</p>
                        <div className="flex justify-end mt-4">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded-lg mr-2"
                                onClick={() => setDeleteReview(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-1.5 bg-primary text-white rounded-lg"
                                onClick={handleDeleteSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? <ClipLoader color="#fff" /> : 'Delete'}
                            </button>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default ReviewComponent;
