import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import authService from '../../services/authService';
import api from '../../config/api';

const MyBookingsStandalone = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/accounts/sign-in');
          return;
        }

        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.data.user);
          await fetchBookings();
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

    checkAuth();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/users/bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const tabs = ['All', 'Completed', 'Cancelled'];
  
  const filteredBookings = activeTab === 'All' 
    ? bookings 
    : bookings.filter(booking => booking.status.toLowerCase() === activeTab.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/profile" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
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
                <button 
                  onClick={() => navigate('/offers')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
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
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MyBookingsStandalone;