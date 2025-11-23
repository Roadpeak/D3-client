// ProfileLayout.jsx - Shared layout for all profile pages with dark mode
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Gift, Store, MapPin, Settings, LogOut, Heart } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import authService from '../services/authService';

const ProfileLayout = ({ children, pageTitle }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
        } else {
          navigate('/accounts/sign-in');
        }
      } catch (error) {
        navigate('/accounts/sign-in');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/accounts/sign-in');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const menuItems = [
    { icon: Store, label: 'My Bookings', path: '/profile/bookings' },
    { icon: Heart, label: 'Favourites', path: '/profile/favourites' },
    { icon: MapPin, label: 'Followed Stores', path: '/profile/followed-stores' },
    { icon: Gift, label: 'Earn', path: '/profile/earn' },
    { icon: Settings, label: 'Profile & Settings', path: '/profile/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Profile */}
          <div className="w-full md:w-80">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{user?.email}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{user?.phoneNumber}</p>

                {/* Verification Status */}
                <div className="flex justify-center gap-2 mt-3">
                  {user?.isEmailVerified && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                      Email Verified
                    </span>
                  )}
                  {user?.isPhoneVerified && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                      Phone Verified
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-600 dark:bg-red-700 text-white py-3 rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

              <Link
                to="/profile/settings"
                className="w-full text-blue-600 dark:text-blue-400 py-2 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors block text-center"
              >
                Edit Profile
              </Link>
            </div>

            {/* Menu Items */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              {React.cloneElement(children, { user })}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileLayout;