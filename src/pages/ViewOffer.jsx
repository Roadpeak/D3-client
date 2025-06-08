import React, { useState } from 'react';
import { Share2, Copy, Facebook, Twitter, Instagram, Linkedin, Star, Clock, MapPin, Tag, Users, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const OffersPage = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 0,
    comment: ''
  });
  const [userReviews, setUserReviews] = useState([]);

  // Mock data
  const offerData = {
    title: "Wyndham Garden at Palmas del Mar - Puerto Rico",
    location: "Puerto Rico",
    platform: "Ebay",
    region: "California",
    purchases: "75 Bought",
    originalPrice: "$200.00",
    offerPrice: "$60.00",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Velit harum quidem eaque amet pariatur aspernatur mollitia ratione maxime.",
    urgencyText: "HURRY UP ONLY A FEW DEALS LEFT",
    expiryText: "This offer has expired!",
    offerDuration: "Valid until June 15, 2025",
    images: [
      "/api/placeholder/600/400",
      "/api/placeholder/600/400", 
      "/api/placeholder/600/400",
      "/api/placeholder/600/400",
      "/api/placeholder/600/400"
    ]
  };

  const reviews = [
    { id: 1, name: "John Doe", rating: 5, comment: "Amazing experience! Great value for money.", date: "2 days ago" },
    { id: 2, name: "Sarah Smith", rating: 4, comment: "Good service, would recommend to others.", date: "1 week ago" },
    { id: 3, name: "Mike Johnson", rating: 5, comment: "Exceeded my expectations. Will book again!", date: "2 weeks ago" },
    { id: 4, name: "Emma Wilson", rating: 4, comment: "Nice location and great amenities.", date: "3 weeks ago" }
  ];

  const relatedOffers = [
    { id: 1, title: "Luxury Resort in Bahamas", price: "$89.00", originalPrice: "$250.00", image: "/api/placeholder/300/200", rating: 4.5 },
    { id: 2, title: "Beachfront Hotel Miami", price: "$120.00", originalPrice: "$300.00", image: "/api/placeholder/300/200", rating: 4.2 },
    { id: 3, title: "Mountain Lodge Colorado", price: "$75.00", originalPrice: "$180.00", image: "/api/placeholder/300/200", rating: 4.7 },
    { id: 4, title: "City Center Hotel NYC", price: "$95.00", originalPrice: "$220.00", image: "/api/placeholder/300/200", rating: 4.1 }
  ];

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing offer: ${offerData.title}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      instagram: `https://www.instagram.com/`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const renderInteractiveStars = (rating, onRatingChange) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onRatingChange(i + 1)}
        className={`w-6 h-6 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
      >
        <Star className="w-full h-full" />
      </button>
    ));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (newReview.name && newReview.rating > 0 && newReview.comment) {
      const review = {
        id: Date.now(),
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
        date: 'Just now'
      };
      setUserReviews([review, ...userReviews]);
      setNewReview({ name: '', rating: 0, comment: '' });
      setShowReviewForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                <img 
                  src={offerData.images[selectedImage]} 
                  alt="Main offer "
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                    {Math.round(((parseFloat(offerData.originalPrice.replace('$', '')) - parseFloat(offerData.offerPrice.replace('$', ''))) / parseFloat(offerData.originalPrice.replace('$', ''))) * 100)}% OFF
                  </span>
                </div>
              </div>
              
              {/* Thumbnail Images */}
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {offerData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed">{offerData.description}</p>
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Offer Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{offerData.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Tag className="w-4 h-4 mr-2" />
                    <span>{offerData.platform}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{offerData.purchases}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{offerData.offerDuration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Offer Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{offerData.title}</h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {offerData.platform}
                </span>
                <span>{offerData.region}</span>
                <span>{offerData.purchases}</span>
              </div>

              <p className="text-gray-600 mb-6">{offerData.description}</p>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-red-500 line-through">
                    {offerData.originalPrice}
                  </span>
                  <span className="text-3xl font-bold text-green-500">
                    {offerData.offerPrice}
                  </span>
                </div>
              </div>

              {/* Offer Duration */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center text-blue-800">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{offerData.offerDuration}</span>
                </div>
              </div>

              <Link 
             to="/Booking" 
             className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 mb-4 inline-block text-center no-underline"
              >
             GET OFFER
             </Link>


              {/* Urgency Message */}
              <div className="text-center mb-4">
                <p className="text-red-600 font-medium text-sm">{offerData.urgencyText}</p>
                <div className="flex items-center justify-center text-gray-500 text-sm mt-2">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{offerData.expiryText}</span>
                </div>
              </div>

              {/* Share Options */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Share this offer:</span>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </button>
                </div>
                
                <div className="flex items-center justify-center space-x-3 mt-3">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition duration-200"
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition duration-200"
                  >
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition duration-200"
                  >
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('instagram')}
                    className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-600 transition duration-200"
                  >
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition duration-200"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                
                {copySuccess && (
                  <p className="text-green-600 text-sm text-center mt-2">Link copied to clipboard!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {renderStars(4)}
                </div>
                <span className="text-gray-600">({205 + userReviews.length} reviews)</span>
              </div>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
              >
                Write Review
              </button>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {renderInteractiveStars(newReview.rating, (rating) => 
                      setNewReview({...newReview, rating})
                    )}
                    <span className="ml-2 text-sm text-gray-600">
                      {newReview.rating > 0 ? `${newReview.rating} star${newReview.rating !== 1 ? 's' : ''}` : 'Select rating'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience..."
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setNewReview({ name: '', rating: 0, comment: '' });
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display user reviews first */}
            {userReviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">New</span>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  {renderStars(review.rating)}
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
              </div>
            ))}
            
            {/* Display existing reviews */}
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <div className="flex items-center mb-2">
                  {renderStars(review.rating)}
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Offers Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition duration-200">
                <img src={offer.image} alt={offer.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{offer.title}</h3>
                  <div className="flex items-center mb-2">
                    {renderStars(Math.floor(offer.rating))}
                    <span className="text-sm text-gray-500 ml-2">({offer.rating})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-500">{offer.price}</span>
                    <span className="text-sm text-gray-500 line-through">{offer.originalPrice}</span>
                  </div>
                  <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition duration-200">
                    View Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share this offer</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => { handleShare('facebook'); setShowShareModal(false); }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Share on Facebook</span>
              </button>
              <button
                onClick={() => { handleShare('twitter'); setShowShareModal(false); }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Twitter className="w-5 h-5 text-blue-400" />
                <span>Share on Twitter</span>
              </button>
              <button
                onClick={() => { handleShare('linkedin'); setShowShareModal(false); }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Linkedin className="w-5 h-5 text-blue-700" />
                <span>Share on LinkedIn</span>
              </button>
              <button
                onClick={() => { handleCopyLink(); setShowShareModal(false); }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Copy className="w-5 h-5 text-gray-600" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OffersPage;