import React, { useState, useEffect } from 'react';
import { User, Tag, Gift, Store, MapPin, Settings, LogOut, Heart, Star, Users, DollarSign, Clock, Copy, Wallet, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import authService from '../services/authService';
import api from '../config/api';

// Service Requests Component with API integration
const ServiceRequestsPage = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceRequests();
    fetchOffers();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      const response = await api.get('/service-requests');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await api.get('/service-requests/offers');
      setOffers(response.data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-32 rounded-lg"></div>
          <div className="bg-gray-200 h-32 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
      
      {/* My Requests */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">My Requests</h2>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No service requests yet</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Create Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{request.service}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Posted: {new Date(request.createdAt).toLocaleDateString()}</span>
                  <span>{request.offers || 0} offers received</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Store Offers */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Store Offers</h2>
        {offers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No offers available</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer) => (
              <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{offer.store?.name}</h3>
                    <p className="text-sm text-gray-600">{offer.service?.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">${offer.price}</div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {offer.store?.rating || '4.5'}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{offer.description}</p>
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Accept Offer
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// My Bookings Component with API integration
const MyBookingsPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/users/bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['All', 'Completed', 'Cancelled'];
  
  const filteredBookings = activeTab === 'All' 
    ? bookings 
    : bookings.filter(booking => booking.status.toLowerCase() === activeTab.toLowerCase());

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
      
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No bookings found</p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Browse Services
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-xl">
                  {booking.offer?.service?.image || '🎯'}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {booking.offer?.service?.store?.name}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {booking.offer?.discount}% OFF
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {booking.offer?.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-500 text-sm font-medium">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Expires: {new Date(booking.offer?.expiration_date).toLocaleDateString()}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Favourites Component with API integration
const FavouritesPage = ({ user }) => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    try {
      const response = await api.get('/users/favorites');
      setFavourites(response.data.favorites || []);
    } catch (error) {
      console.error('Error fetching favourites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavourite = async (itemId) => {
    try {
      await api.delete(`/services/${itemId}/favorite`);
      setFavourites(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing favourite:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Favourites</h1>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Favourites</h1>
        <span className="text-sm text-gray-500">{favourites.length} items</span>
      </div>
      
      {favourites.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No favourites yet</p>
          <p className="text-sm">Start exploring and add your favorite services!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
                <button
                  onClick={() => removeFavourite(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{item.service?.store?.name}</h3>
              <p className="text-blue-600 font-medium mb-2">{item.service?.name}</p>
              <p className="text-gray-600 text-sm mb-3">{item.service?.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600">{item.service?.store?.rating || '4.5'}</span>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {item.service?.category}
                </span>
              </div>
              
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Service
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Profile & Settings Component with API integration
const ProfileSettingsPage = ({ user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    location: '',
    notifications: true,
    emailUpdates: false,
    smsAlerts: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      });

      if (response.data.user) {
        onUserUpdate(response.data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
      
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Profile Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                title="Email cannot be changed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Profile Page Component with authentication
const CouponProfilePage = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('My Bookings');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchUser();
  }, []);

  const checkAuthAndFetchUser = async () => {
    try {
      if (!authService.isAuthenticated()) {
        navigate('/accounts/sign-in');
        return;
      }

      const result = await authService.getCurrentUser();
      if (result.success) {
        setUser(result.data.user);
      } else {
        navigate('/accounts/sign-in');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/accounts/sign-in');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/accounts/sign-in');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const menuItems = [
    { icon: Store, label: 'My Bookings' },
    { icon: Tag, label: 'Service Requests' },
    { icon: Heart, label: 'Favourites' },
    { icon: MapPin, label: 'Followed Stores' },
    { icon: Gift, label: 'Earn' },
    { icon: Settings, label: 'Profile & Settings' },
  ];

  const renderContent = () => {
    switch (activeMenuItem) {
      case 'Service Requests':
        return <ServiceRequestsPage user={user} />;
      case 'Earn':
        return <EarnPage />;
      case 'Favourites':
        return <FavouritesPage user={user} />;
      case 'Followed Stores':
        return <FollowedStoresPage />;
      case 'My Bookings':
        return <MyBookingsPage user={user} />;
      case 'Profile & Settings':
        return <ProfileSettingsPage user={user} onUserUpdate={handleUserUpdate} />;
      default:
        return <MyBookingsPage user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Profile */}
          <div className="w-full md:w-80">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600 text-sm mb-1">{user?.email}</p>
                <p className="text-gray-600 text-sm">{user?.phoneNumber}</p>
                
                {/* Verification Status */}
                <div className="flex justify-center gap-2 mt-3">
                  {user?.isEmailVerified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Email Verified
                    </span>
                  )}
                  {user?.isPhoneVerified && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Phone Verified
                    </span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              
              <button 
                onClick={() => setActiveMenuItem('Profile & Settings')}
                className="w-full text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Edit Profile
              </button>
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setActiveMenuItem(item.label)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                    activeMenuItem === item.label 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Keep the original components that don't need API integration
const EarnPage = () => {
  // ... keep your existing EarnPage component code
  return <div>Earn Page - Original implementation</div>;
};

const FollowedStoresPage = () => {
  // ... keep your existing FollowedStoresPage component code  
  return <div>Followed Stores Page - Original implementation</div>;
};

export default CouponProfilePage;