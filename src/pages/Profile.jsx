import React, { useState, useEffect } from 'react';
import {
  User, Gift, Store, Settings, LogOut, Heart, Calendar,
  Award, Target, Users,
  Moon, Sun, Star, CheckCircle, Trophy, Bookmark, MessageCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import api from '../config/api';
import { useFavorites } from '../hooks/useFavorites';

// Enhanced Profile Page Component with all original functionality
const EnhancedCouponProfilePage = () => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalBookings: 0,
    totalFavorites: 0,
    followedStores: 0,
    rewardPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Use favorites hook to get real-time favorites count
  const { getFavoritesCount, loading: favoritesLoading } = useFavorites();

  // Calculate user badges based on activity
  const getUserBadges = () => {
    const badges = [];
    if (userStats.totalBookings >= 10) badges.push({ label: 'Regular Customer', color: 'blue', icon: Star });
    if (userStats.totalFavorites >= 5) badges.push({ label: 'Deal Hunter', color: 'red', icon: Heart });
    if (userStats.followedStores >= 10) badges.push({ label: 'Explorer', color: 'yellow', icon: Trophy });
    if (userStats.rewardPoints >= 100) badges.push({ label: 'Point Collector', color: 'green', icon: Award });
    return badges;
  };

  // Fetch user profile data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/accounts/sign-in', {
            state: { returnUrl: location.pathname }
          });
          return;
        }

        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.data.user);
        } else {
          setError('Failed to load user data');
          setTimeout(() => {
            navigate('/accounts/sign-in');
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Authentication error occurred');
        setTimeout(() => {
          navigate('/accounts/sign-in');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!authService.isAuthenticated()) return;

      try {
        setStatsLoading(true);

        // Fetch followed stores count
        const followedStoresResponse = await api.get('/users/followed-stores');
        const followedStoresCount = followedStoresResponse.data.success ?
          (followedStoresResponse.data.followedStores?.length || 0) : 0;

        // Get real-time favorites count from the hook
        const favoritesCount = getFavoritesCount();

        // Fetch bookings count - try multiple endpoints
        let bookingsCount = 0;
        try {
          const userBookingsResponse = await api.get('/bookings/user');
          if (userBookingsResponse.data.success && userBookingsResponse.data.bookings) {
            bookingsCount = userBookingsResponse.data.bookings.length;
          } else if (userBookingsResponse.data.data) {
            bookingsCount = Array.isArray(userBookingsResponse.data.data) ?
              userBookingsResponse.data.data.length : 0;
          }
        } catch (bookingsError) {
          console.warn('Primary bookings endpoint failed, trying alternative:', bookingsError.message);
          try {
            const altBookingsResponse = await api.get('/users/bookings');
            if (altBookingsResponse.data.success && altBookingsResponse.data.bookings) {
              bookingsCount = altBookingsResponse.data.bookings.length;
            }
          } catch (altError) {
            console.warn('Alternative bookings endpoint also failed:', altError.message);
          }
        }

        // Fetch reward points - try multiple endpoints
        let rewardPoints = 0;
        try {
          const rewardsResponse = await api.get('/users/rewards');
          if (rewardsResponse.data.success) {
            rewardPoints = rewardsResponse.data.points || rewardsResponse.data.rewardPoints || 0;
          }
        } catch (rewardsError) {
          console.warn('Rewards endpoint failed:', rewardsError.message);
          try {
            const altRewardsResponse = await api.get('/users/points');
            if (altRewardsResponse.data.success) {
              rewardPoints = altRewardsResponse.data.points || 0;
            }
          } catch (altError) {
            console.warn('Alternative rewards endpoint also failed:', altError.message);
          }
        }

        setUserStats({
          totalBookings: bookingsCount,
          totalFavorites: favoritesCount,
          followedStores: followedStoresCount,
          rewardPoints: rewardPoints
        });

        console.log('✅ User stats loaded:', {
          followedStores: followedStoresCount,
          favorites: favoritesCount,
          bookings: bookingsCount,
          points: rewardPoints
        });

      } catch (error) {
        console.error('❌ Error fetching user stats:', error);
        setUserStats(prevStats => ({
          ...prevStats,
          totalBookings: 0,
          totalFavorites: getFavoritesCount(),
          followedStores: 0,
          rewardPoints: 0
        }));
      } finally {
        setStatsLoading(false);
      }
    };

    if (user && !favoritesLoading) {
      fetchUserStats();
    }
  }, [user, favoritesLoading, getFavoritesCount]);

  // Update favorites count when it changes
  useEffect(() => {
    if (!favoritesLoading) {
      setUserStats(prevStats => ({
        ...prevStats,
        totalFavorites: getFavoritesCount()
      }));
    }
  }, [getFavoritesCount, favoritesLoading]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/accounts/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      authService.clearStorage();
      navigate('/accounts/sign-in');
    }
  };

  const getVerificationBadges = () => {
    const badges = [];
    if (user?.isEmailVerified) {
      badges.push({ label: 'Email Verified', color: 'green' });
    }
    if (user?.isPhoneVerified) {
      badges.push({ label: 'Phone Verified', color: 'blue' });
    }
    if (user?.isKYCVerified) {
      badges.push({ label: 'ID Verified', color: 'orange' });
    }
    return badges;
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className={`w-12 h-12 ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className={`${darkMode ? 'text-red-400' : 'text-red-600'} text-lg`}>!</span>
            </div>
            <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Something went wrong</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm`}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Enhanced Header with Dark Mode Toggle */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border-b transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} text-sm mt-1`}>Welcome back, {user?.firstName || 'User'}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => navigate('/profile/settings')}
                className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20 md:pb-0">
        {/* Enhanced Profile Card with Gradient Background */}
        <div className="py-4 md:py-8">
          <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-gray-200'} border rounded-2xl p-4 md:p-8 transition-colors duration-300 relative`}>
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
              {/* Enhanced Profile Picture */}
              <div className="relative mx-auto md:mx-0">
                <div className="w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center relative overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 md:w-16 h-12 md:h-16 text-white" />
                  )}
                </div>
              </div>

              {/* Enhanced Profile Info */}
              <div className="flex-1 text-center md:text-left w-full">
                <div className="flex flex-col items-center md:items-start mb-4 md:mb-6">
                  <div className="mb-4 md:mb-0 text-center md:text-left w-full">
                    <h2 className={`text-xl md:text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {user?.firstName || 'User'} {user?.lastName || ''}
                    </h2>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-1`}>{user?.email}</p>
                    {user?.phoneNumber && (
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-4`}>{user.phoneNumber}</p>
                    )}

                    {/* Enhanced Verification Status */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                      {getVerificationBadges().map((badge, index) => (
                        <span
                          key={index}
                          className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${badge.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              badge.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          {badge.label}
                        </span>
                      ))}
                    </div>

                    {/* User Badges */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      {getUserBadges().map((badge, index) => {
                        const IconComponent = badge.icon;
                        return (
                          <span
                            key={index}
                            className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${badge.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                badge.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                  badge.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              }`}
                          >
                            <IconComponent className="w-3 h-3" />
                            {badge.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} text-sm font-medium transition-colors flex items-center gap-1 mt-4 md:mt-0 md:absolute md:top-4 md:right-4`}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid with Icons and Colors */}
        <div className="pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/profile/bookings')}
              className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'} border rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <Calendar className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {statsLoading ? (
                  <div className={`w-8 h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mx-auto animate-pulse`}></div>
                ) : (
                  userStats.totalBookings
                )}
              </div>
              <div className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>Bookings</div>
            </button>

            <button
              onClick={() => navigate('/profile/favourites')}
              className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-red-500' : 'bg-white border-gray-200 hover:border-red-300'} border rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <Heart className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {favoritesLoading ? (
                  <div className={`w-8 h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mx-auto animate-pulse`}></div>
                ) : (
                  userStats.totalFavorites
                )}
              </div>
              <div className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>Favourites</div>
            </button>

            <button
              onClick={() => navigate('/profile/followed-stores')}
              className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-yellow-500' : 'bg-white border-gray-200 hover:border-yellow-300'} border rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <Users className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {statsLoading ? (
                  <div className={`w-8 h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mx-auto animate-pulse`}></div>
                ) : (
                  userStats.followedStores
                )}
              </div>
              <div className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} font-medium`}>Following</div>
            </button>

            <button
              onClick={() => navigate('/profile/earn')}
              className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-gray-200 hover:border-green-300'} border rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <Target className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {statsLoading ? (
                  <div className={`w-8 h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mx-auto animate-pulse`}></div>
                ) : (
                  userStats.rewardPoints.toLocaleString()
                )}
              </div>
              <div className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>KSH</div>
            </button>
          </div>
        </div>

        {/* Enhanced Quick Actions with More Options */}
        <div className="pb-8">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/Hotdeals')}
              className={`text-left p-6 ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'} border rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Browse Offers</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Discover amazing deals</p>
            </button>

            <button
              onClick={() => navigate('/stores')}
              className={`text-left p-6 ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-gray-200 hover:border-green-300'} border rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Find Stores</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Explore businesses</p>
            </button>

            <button
              onClick={() => navigate('/service-requests')}
              className={`text-left p-6 ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-orange-500' : 'bg-white border-gray-200 hover:border-orange-300'} border rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Service Requests</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Manage requests & offers</p>
            </button>

            <button
              onClick={() => navigate('/profile/settings')}
              className={`text-left p-6 ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-purple-500' : 'bg-white border-gray-200 hover:border-purple-300'} border rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Settings</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Account settings</p>
            </button>
          </div>
        </div>

        {/* Mobile-Friendly Bottom Actions Bar */}
        <div
          className={`md:hidden fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'} px-6 py-4 z-40 transition-colors duration-300`}
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex justify-around">
            <button
              onClick={() => navigate('/Hotdeals')}
              className="flex flex-col items-center gap-1"
            >
              <Gift className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Offers</span>
            </button>
            <button
              onClick={() => navigate('/stores')}
              className="flex flex-col items-center gap-1"
            >
              <Store className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Stores</span>
            </button>
            <button
              onClick={() => navigate('/service-requests')}
              className="flex flex-col items-center gap-1"
            >
              <MessageCircle className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Requests</span>
            </button>
            <button
              onClick={() => navigate('/profile/settings')}
              className="flex flex-col items-center gap-1"
            >
              <Settings className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCouponProfilePage;