import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Add useLocation
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
  ArrowLeft
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StoreViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [copiedCode, setCopiedCode] = useState('');
  const [activeSection, setActiveSection] = useState('offers'); // 'offers', 'services', 'map', 'outlets'
  const [newReview, setNewReview] = useState({ name: '', rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);

  // Get store data from location state or use default
  const storeFromRoute = location.state?.store;
  
  // Default store data (fallback)
  const defaultStore = {
    name: "Sample Store",
    logo: "/images/tt.png",
    rating: 4.6,
    totalReviews: 2847,
    followers: 12500,
    description: "Official store offering the latest products and deals.",
    socialLinks: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      website: "https://example.com"
    }
  };

  // Use store data from route or default
  const storeData = storeFromRoute ? {
    name: storeFromRoute.name,
    logo: storeFromRoute.logo,
    rating: storeFromRoute.rating || 4.6,
    totalReviews: Math.floor(Math.random() * 5000) + 1000, // Random for demo
    followers: Math.floor(Math.random() * 50000) + 5000, // Random for demo
    cashback: storeFromRoute.cashback,
    category: storeFromRoute.category,
    location: storeFromRoute.location,
    description: `Official ${storeFromRoute.name} store offering the latest products with ${storeFromRoute.cashback} cashback.`,
    socialLinks: {
      facebook: `https://facebook.com/${storeFromRoute.name.toLowerCase().replace(/\s+/g, '')}`,
      twitter: `https://twitter.com/${storeFromRoute.name.toLowerCase().replace(/\s+/g, '')}`,
      instagram: `https://instagram.com/${storeFromRoute.name.toLowerCase().replace(/\s+/g, '')}`,
      website: `https://${storeFromRoute.name.toLowerCase().replace(/\s+/g, '')}.com`
    }
  } : defaultStore;

  const deals = [
    {
      id: 1,
      type: 'cashback',
      title: `${storeData.cashback} Cashback for Purchases at ${storeData.name}`,
      description: `${storeData.cashback} Base Cashback\nValid on all purchases\nNo minimum order value required`,
      discount: storeData.cashback,
      label: 'BACK',
      buttonText: 'Get Reward',
      expiryDate: null,
      terms: 'Cashback is not available if you fail to clean your shopping bag before clicking through to the retailer.'
    },
    {
      id: 2,
      type: 'promo',
      title: `${storeData.name} Products on Sale: Up to 40% Off`,
      description: `Save on the latest ${storeData.name} collection`,
      discount: '40%',
      label: 'OFF',
      buttonText: 'Get Deal',
      expiryDate: 'Jun 18, 2025'
    },
    {
      id: 3,
      type: 'coupon',
      title: `Extra 25% off Select Items with ${storeData.name} Promo Code`,
      description: 'Get additional savings on already discounted items',
      discount: '25%',
      label: 'OFF',
      buttonText: 'Get Code',
      code: 'SAVE25',
      expiryDate: 'Jun 15, 2025'
    },
    {
      id: 4,
      type: 'shipping',
      title: `Free Shipping on All Orders from ${storeData.name}`,
      description: 'Enjoy free shipping on all orders with no minimum purchase',
      discount: 'FREE',
      label: 'SHIPPING',
      buttonText: 'Shop Now',
      expiryDate: null
    }
  ];

  const services = [
    {
      id: 1,
      title: 'Personal Shopping Consultation',
      description: 'Get personalized style advice from our expert consultants',
      duration: '60 minutes',
      price: '$50',
      available: true
    },
    {
      id: 2,
      title: 'Product Fitting Service',
      description: 'Professional fitting service to ensure perfect comfort and performance',
      duration: '30 minutes',
      price: 'Free',
      available: true
    },
    {
      id: 3,
      title: 'Custom Design Consultation',
      description: `Design your own custom ${storeData.name} products with our specialists`,
      duration: '90 minutes',
      price: '$100',
      available: false
    },
    {
      id: 4,
      title: 'Product Recommendation Service',
      description: 'Complete assessment to recommend the best products for your needs',
      duration: '45 minutes',
      price: '$75',
      available: true
    }
  ];

  const outlets = [
    {
      id: 1,
      name: `${storeData.name} Downtown`,
      address: '123 Main Street, Downtown, City 10001',
      phone: '+1 (555) 123-4567',
      hours: 'Mon-Sat: 9AM-9PM, Sun: 11AM-7PM',
      distance: '0.5 miles',
      image: storeData.logo
    },
    {
      id: 2,
      name: `${storeData.name} Mall Central`,
      address: '456 Shopping Center, Mall District, City 10002',
      phone: '+1 (555) 234-5678',
      hours: 'Mon-Sun: 10AM-10PM',
      distance: '2.1 miles',
      image: storeData.logo
    },
    {
      id: 3,
      name: `${storeData.name} Plaza`,
      address: '789 Shopping Ave, Plaza District, City 10003',
      phone: '+1 (555) 345-6789',
      hours: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-7PM',
      distance: '3.7 miles',
      image: storeData.logo
    },
    {
      id: 4,
      name: `${storeData.name} Outlet Store`,
      address: '321 Outlet Plaza, Suburb, City 10004',
      phone: '+1 (555) 456-7890',
      hours: 'Mon-Sun: 9AM-9PM',
      distance: '5.2 miles',
      image: storeData.logo
    }
  ];

  const reviews = [
    {
      id: 1,
      name: "Sarah M.",
      rating: 5,
      date: "2 days ago",
      comment: `Great deals and cashback always works as promised. Love shopping at ${storeData.name}!`
    },
    {
      id: 2,
      name: "Mike R.",
      rating: 4,
      date: "1 week ago",
      comment: `Good selection of products. The ${storeData.cashback} cashback saved me quite a bit on my recent purchase.`
    },
    {
      id: 3,
      name: "Lisa K.",
      rating: 5,
      date: "2 weeks ago",
      comment: `Excellent service and authentic deals. Always my go-to for ${storeData.name} shopping.`
    }
  ];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (newReview.name && newReview.rating && newReview.comment) {
      console.log('New review:', newReview);
      setNewReview({ name: '', rating: 0, comment: '' });
      setHoverRating(0);
      alert('Thank you for your review!');
    }
  };

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

  const DealCard = ({ deal, isListView = false }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow ${isListView ? 'flex gap-6' : ''}`}>
      <div className={`${isListView ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`text-center ${isListView ? 'mr-4' : 'mb-4'}`}>
            <div className="text-3xl font-bold text-red-500">{deal.discount}</div>
            <div className="text-sm text-gray-600">{deal.label}</div>
          </div>
          <div className={`${isListView ? 'flex-1' : ''}`}>
            <h3 className="font-semibold text-gray-900 mb-2">{deal.title}</h3>
            <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{deal.description}</p>
            {deal.expiryDate && (
              <p className="text-xs text-red-500 mb-3">Expires {deal.expiryDate}</p>
            )}
          </div>
        </div>
        
        <div className={`flex items-center gap-3 ${isListView ? 'justify-end' : 'justify-between'}`}>
          {deal.code && (
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                {deal.code}
              </span>
              <button
                onClick={() => handleCopyCode(deal.code)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                {copiedCode === deal.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
          <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
            {deal.buttonText}
          </button>
        </div>
      </div>
    </div>
  );

  const ServiceCard = ({ service }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{service.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{service.duration}</span>
            </div>
            <div className="font-medium text-red-500">{service.price}</div>
          </div>
        </div>
      </div>
      <button 
        className={`w-full px-6 py-2 rounded-lg transition-colors ${
          service.available 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={!service.available}
      >
        <Calendar className="w-4 h-4 inline mr-2" />
        {service.available ? 'Book Appointment' : 'Currently Unavailable'}
      </button>
    </div>
  );

  const OutletCard = ({ outlet }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={outlet.image} 
        alt={outlet.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{outlet.name}</h3>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{outlet.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{outlet.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{outlet.hours}</span>
          </div>
          <div className="text-red-500 font-medium">{outlet.distance} away</div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
            View Deals
          </button>
          <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
            Call Store
          </button>
        </div>
      </div>
    </div>
  );

  const MapView = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Interactive Map</p>
          <p className="text-sm">Showing {outlets.length} store locations</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {outlets.map((outlet) => (
          <div key={outlet.id} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{outlet.name}</h4>
            <p className="text-sm text-gray-600 mb-1">{outlet.address}</p>
            <p className="text-sm text-red-500 font-medium">{outlet.distance} away</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'offers':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Current Deals</h2>
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-red-500 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} isListView={viewMode === 'list'} />
              ))}
            </div>
          </div>
        );
      
      case 'services':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Our Services</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        );
      
      case 'map':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Store Locations</h2>
            </div>
            <MapView />
          </div>
        );
      
      case 'outlets':
        return (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Our Outlets</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {outlets.map((outlet) => (
                <OutletCard key={outlet.id} outlet={outlet} />
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Store Logo and Basic Info */}
            <div className="flex items-start gap-4">
              <img
                src={storeData.logo}
                alt={storeData.name}
                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                   {storeData.name} 
                </h1>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(storeData.rating)}</div>
                    <span className="text-sm font-medium">{storeData.rating}</span>
                    <span className="text-sm text-gray-500">({storeData.totalReviews?.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{storeData.followers?.toLocaleString()} followers</span>
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
                
                {/* Social Links */}
                <div className="flex items-center gap-3 mb-4">
                  <a href={storeData.socialLinks.facebook} className="text-blue-600 hover:text-blue-700">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href={storeData.socialLinks.twitter} className="text-sky-500 hover:text-sky-600">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href={storeData.socialLinks.instagram} className="text-pink-600 hover:text-pink-700">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href={storeData.socialLinks.website} className="text-gray-600 hover:text-gray-700">
                    <Globe className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:ml-auto">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg border transition-colors ${
                  isFollowing
                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                    : 'bg-white text-red-500 border-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
            </div>
          </div>

          {/* Store Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setActiveSection('offers')}
              className={`text-center p-2 rounded-lg transition-colors ${
                activeSection === 'offers' ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-sm text-gray-500">Offers</div>
              <div className="text-xl font-bold text-red-500">{deals.length}</div>
            </button>
            <button
              onClick={() => setActiveSection('services')}
              className={`text-center p-2 rounded-lg transition-colors ${
                activeSection === 'services' ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-sm text-gray-500">Services</div>
              <div className="text-xl font-bold text-gray-900">{services.length}</div>
            </button>
            <button
              onClick={() => setActiveSection('map')}
              className={`text-center p-2 rounded-lg transition-colors ${
                activeSection === 'map' ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-sm text-gray-500">Map</div>
              <div className="text-xl font-bold text-gray-900">1</div>
            </button>
            <button
              onClick={() => setActiveSection('outlets')}
              className={`text-center p-2 rounded-lg transition-colors ${
                activeSection === 'outlets' ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-sm text-gray-500">Outlets</div>
              <div className="text-xl font-bold text-gray-900">{outlets.length}</div>
            </button>
          </div>
        </div>

        {/* Dynamic Content Based on Active Section */}
        {renderActiveSection()}

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(storeData.rating)}</div>
              <span className="font-medium">{storeData.rating} out of 5</span>
              <span className="text-gray-500">({storeData.totalReviews} reviews)</span>
            </div>
          </div>

          {/* Add Review Form */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {renderStars(
                      newReview.rating,
                      true,
                      (rating) => setNewReview({...newReview, rating}),
                      setHoverRating
                    )}
                    <span className="ml-2 text-sm text-gray-600">
                      {newReview.rating > 0 && `${newReview.rating} out of 5`}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                  placeholder="Share your experience..."
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-coral-500 text-white px-6 py-2 rounded-lg hover:bg-coral-600 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Review
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
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
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button className="w-full sm:w-auto bg-coral-500 text-white px-6 py-2 rounded-lg hover:bg-coral-600 transition-colors">
              View All Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Chat Button - Fixed Position */}
      <button className="fixed bottom-6 right-6 bg-coral-500 text-white p-4 rounded-full shadow-lg hover:bg-coral-600 transition-colors z-50">
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Uncomment when you have your components */}
      <Footer />

      <style jsx>{`
        .text-coral-500 { color: #ef4444; }
        .bg-coral-500 { background-color: #ef4444; }
        .border-coral-500 { border-color: #ef4444; }
        .hover\\:bg-coral-600:hover { background-color: #dc2626; }
        .hover\\:text-coral-600:hover { color: #dc2626; }
        .hover\\:bg-coral-50:hover { background-color: #fef2f2; }
        .bg-coral-50 { background-color: #fef2f2; }
        .border-coral-200 { border-color: #fecaca; }
        .ring-coral-500 { --tw-ring-color: #ef4444; }
        .focus\\:ring-coral-500:focus { --tw-ring-color: #ef4444; }
        .focus\\:border-coral-500:focus { border-color: #ef4444; }
      `}</style>
    </div>
  );
};

export default StoreViewPage;       