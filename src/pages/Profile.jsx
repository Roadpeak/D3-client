import React, { useState } from 'react';
import { User, Tag, Gift, Store, MapPin, Settings, LogOut, Heart, Star, Users, DollarSign, Clock, CheckCircle, XCircle, ArrowRight, Copy, Wallet, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Service Requests Component
const ServiceRequestsPage = () => {
  const requests = [
    {
      id: 1,
      service: 'Hair Styling',
      description: 'Looking for professional hair styling for wedding',
      date: '2025-06-05',
      status: 'Active',
      offers: 3
    },
    {
      id: 2,
      service: 'Massage Therapy',
      description: 'Deep tissue massage therapy needed',
      date: '2025-06-03',
      status: 'Completed',
      offers: 5
    }
  ];

  const offers = [
    {
      id: 1,
      store: 'Beauty Studio Pro',
      service: 'Hair Styling',
      price: '$150',
      rating: 4.8,
      description: 'Professional wedding hair styling with 5 years experience'
    },
    {
      id: 2,
      store: 'Relaxation Center',
      service: 'Massage Therapy',
      price: '$80',
      rating: 4.6,
      description: 'Deep tissue massage by certified therapists'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
      
      {/* My Requests */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">My Requests</h2>
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
                <span>Posted: {request.date}</span>
                <span>{request.offers} offers received</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Store Offers */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Store Offers</h2>
        <div className="grid gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{offer.store}</h3>
                  <p className="text-sm text-gray-600">{offer.service}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{offer.price}</div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    {offer.rating}
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
      </div>
    </div>
  );
};

// Earn Component
const EarnPage = () => {
  const [activeEarnTab, setActiveEarnTab] = useState('Overview');
  
  const stats = {
    totalEarnings: '$1,234.50',
    pendingEarnings: '$89.25',
    totalReferrals: 45,
    thisMonth: '$234.80'
  };

  const referrals = [
    { name: 'John Doe', earnings: '$25.00', date: '2025-06-05', status: 'Completed' },
    { name: 'Jane Smith', earnings: '$15.50', date: '2025-06-04', status: 'Pending' },
    { name: 'Mike Johnson', earnings: '$30.00', date: '2025-06-03', status: 'Completed' }
  ];

  const earnTabs = ['Overview', 'Referrals', 'Withdraw'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Earn Money</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold">{stats.totalEarnings}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">This Month</p>
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingEarnings}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Referrals</p>
              <p className="text-2xl font-bold">{stats.totalReferrals}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg">
        {earnTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveEarnTab(tab)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeEarnTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeEarnTab === 'Overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Affiliate Program</h2>
            <p className="text-gray-600 mb-4">
              Earn money by referring friends and family to our platform. Get 15% commission on their first purchase!
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">Your Referral Link</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value="https://d3.com/ref/luisnatasha"
                  readOnly
                  className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeEarnTab === 'Referrals' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Referrals</h2>
          <div className="space-y-4">
            {referrals.map((referral, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{referral.name}</h3>
                  <p className="text-sm text-gray-600">Referred on {referral.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{referral.earnings}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    referral.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {referral.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeEarnTab === 'Withdraw' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Withdraw Earnings</h2>
          <div className="max-w-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Balance</label>
              <div className="text-3xl font-bold text-green-600">{stats.totalEarnings}</div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Bank Transfer</option>
                <option>PayPal</option>
                <option>Mobile Money</option>
              </select>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Wallet className="w-5 h-5" />
              Request Withdrawal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Favourites Component
const FavouritesPage = () => {
  const favourites = [
    {
      id: 1,
      store: 'Walmart',
      offer: '20% Cashback',
      rating: 4.5,
      category: 'Shopping',
      description: 'Get 20% cashback on all purchases'
    },
    {
      id: 2,
      store: 'Pizza Studio',
      offer: 'Buy 1 Get 1 Free',
      rating: 4.8,
      category: 'Food',
      description: 'Buy one pizza and get another absolutely free'
    },
    {
      id: 3,
      store: 'Fitness Plus',
      offer: '25% Off',
      rating: 4.6,
      category: 'Fitness',
      description: 'Get 25% off on all fitness accessories'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Favourites</h1>
        <span className="text-sm text-gray-500">{favourites.length} items</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favourites.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <Heart className="w-5 h-5 text-red-500 fill-current" />
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-1">{item.store}</h3>
            <p className="text-blue-600 font-medium mb-2">{item.offer}</p>
            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm text-gray-600">{item.rating}</span>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {item.category}
              </span>
            </div>
            
            <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Offer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Followed Stores Component
const FollowedStoresPage = () => {
  const stores = [
    {
      id: 1,
      name: 'WellFit Fitness Accessories',
      category: 'Fitness',
      rating: 4.8,
      followers: '12.3K',
      offers: 5,
      image: '🏋️'
    },
    {
      id: 2,
      name: 'Beauty Studio Pro',
      category: 'Beauty & Wellness',
      rating: 4.9,
      followers: '8.7K',
      offers: 3,
      image: '💄'
    },
    {
      id: 3,
      name: 'Pizza Plaza',
      category: 'Food & Dining',
      rating: 4.6,
      followers: '15.2K',
      offers: 7,
      image: '🍕'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Followed Stores</h1>
        <span className="text-sm text-gray-500">{stores.length} stores</span>
      </div>
      
      <div className="grid gap-4">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                  {store.image}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{store.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">{store.category}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {store.rating}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {store.followers}
                    </div>
                    <span>{store.offers} active offers</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Store
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Unfollow
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// My Bookings Component
const MyBookingsPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  
  const bookings = [
    {
      id: 1,
      brand: 'Chicken Saloon',
      logo: '🍗',
      title: '50% OFF',
      description: 'Get 50% OFF On all services',
      expiry: 'Ends 09.15.2020',
      status: 'Active'
    },
    {
      id: 2,
      brand: 'Pizza Massage',
      logo: '🍕',
      title: 'But massage',
      description: 'Get 50% OFF On all services',
      expiry: 'Ends 09.15.2020',
      status: 'Completed'
    },
    {
      id: 3,
      brand: 'Burger Studio',
      logo: '🍔',
      title: 'Free photoshoot',
      description: 'Get 50% OFF On all services',
      expiry: 'Ends 09.15.2020',
      status: 'Cancelled'
    }
  ];

  const tabs = ['All', 'Completed', 'Cancelled'];
  
  const filteredBookings = activeTab === 'All' 
    ? bookings 
    : bookings.filter(booking => booking.status === activeTab);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-xl">
                {booking.logo}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {booking.brand}
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {booking.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {booking.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-500 text-sm font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {booking.expiry}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                booking.status === 'Active' ? 'bg-green-100 text-green-700' :
                booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile & Settings Component
const ProfileSettingsPage = () => {
  const [formData, setFormData] = useState({
    firstName: 'Luis',
    lastName: 'Natasha',
    email: 'luisnatasha@gmail.com',
    phone: '+254 123 456 7789',
    location: 'Nairobi, Kenya',
    notifications: true,
    emailUpdates: false,
    smsAlerts: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
      
      {/* Profile Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-600">Receive notifications about new offers and updates</p>
            </div>
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600"
            />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900">Email Updates</h3>
              <p className="text-sm text-gray-600">Receive weekly email updates about new deals</p>
            </div>
            <input
              type="checkbox"
              name="emailUpdates"
              checked={formData.emailUpdates}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600"
            />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900">SMS Alerts</h3>
              <p className="text-sm text-gray-600">Get SMS alerts for urgent notifications</p>
            </div>
            <input
              type="checkbox"
              name="smsAlerts"
              checked={formData.smsAlerts}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Main Profile Page Component
const CouponProfilePage = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Service Requests');

  const menuItems = [
    { icon: Tag, label: 'Service Requests' },
    { icon: Gift, label: 'Earn' },
    { icon: Store, label: 'Favourites' },
    { icon: MapPin, label: 'Followed Stores' },
    { icon: Store, label: 'My Bookings' },
    { icon: Settings, label: 'Profile & Settings' },
  ];

  const renderContent = () => {
    switch (activeMenuItem) {
      case 'Service Requests':
        return <ServiceRequestsPage />;
      case 'Earn':
        return <EarnPage />;
      case 'Favourites':
        return <FavouritesPage />;
      case 'Followed Stores':
        return <FollowedStoresPage />;
      case 'My Bookings':
        return <MyBookingsPage />;
      case 'Profile & Settings':
        return <ProfileSettingsPage />;
      default:
        return <ServiceRequestsPage />;
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
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Luis Natasha</h2>
                <p className="text-gray-600 text-sm mb-1">luisnatasha@gmail.com</p>
                <p className="text-gray-600 text-sm">+254 123 456 7789</p>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              
              <button className="w-full text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
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

export default CouponProfilePage;