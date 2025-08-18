import React, { useState, useEffect } from 'react';
import { User, Gift, Store, MapPin, Settings, LogOut, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import authService from '../services/authService';
import api from '../config/api';
import { useFavorites } from '../hooks/useFavorites';

// Main Profile Page Component - Dashboard Only
const CouponProfilePage = () => {
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
  const navigate = useNavigate();
  const location = useLocation();

  // Use favorites hook to get real-time favorites count
  const { getFavoritesCount, loading: favoritesLoading } = useFavorites();

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

        // You can add more API calls here for other stats
        // For now, I'll use mock data for other stats since their endpoints aren't implemented
        const bookingsCount = 0; // await api.get('/users/bookings') when implemented
        const rewardPoints = 0; // await api.get('/users/rewards') when implemented

        setUserStats({
          totalBookings: bookingsCount,
          totalFavorites: favoritesCount,
          followedStores: followedStoresCount,
          rewardPoints: rewardPoints
        });

        console.log('✅ User stats loaded:', {
          followedStores: followedStoresCount,
          favorites: favoritesCount
        });

      } catch (error) {
        console.error('❌ Error fetching user stats:', error);
        // Don't show error for stats, just keep default values
        setUserStats(prevStats => ({
          ...prevStats,
          totalBookings: 0,
          totalFavorites: getFavoritesCount(), // Still use real favorites count
          followedStores: 0,
          rewardPoints: 0
        }));
      } finally {
        setStatsLoading(false);
      }
    };

    // Only fetch stats after user is loaded and favorites are not loading
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getVerificationBadges = () => {
    const badges = [];
    if (user?.isEmailVerified) {
      badges.push({ label: 'Email Verified', color: 'green' });
    }
    if (user?.isPhoneVerified) {
      badges.push({ label: 'Phone Verified', color: 'blue' });
    }
    if (user?.isKYCVerified) {
      badges.push({ label: 'ID Verified', color: 'purple' });
    }
    return badges;
  };

  // Stats display component with loading state
  const StatCard = ({ 
    icon: Icon, 
    count, 
    title, 
    description, 
    bgGradient, 
    iconColor, 
    textColor, 
    onClick,
    isLoading = false
  }) => (
    <div 
      onClick={onClick}
      className={`${bgGradient} rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-all transform`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-8 h-8 ${iconColor}`} />
        <span className="text-2xl font-bold">
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            count
          )}
        </span>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className={`${textColor} text-sm`}>{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Profile Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          {/* Profile Avatar & Info */}
          <div className="text-center md:text-left">
            <div className="relative w-24 h-24 mx-auto md:mx-0 mb-4">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <User className="w-12 h-12 text-blue-600" />
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {user?.firstName || 'User'} {user?.lastName || ''}
            </h1>
            <p className="text-gray-600 mb-2">{user?.email}</p>
            {user?.phoneNumber && (
              <p className="text-gray-600 text-sm mb-3">{user.phoneNumber}</p>
            )}
            
            {/* Verification Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              {getVerificationBadges().map((badge, index) => (
                <span 
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${
                    badge.color === 'green' ? 'bg-green-100 text-green-700' :
                    badge.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}
                >
                  {badge.label}
                </span>
              ))}
              {getVerificationBadges().length === 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Verify your account
                </span>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center md:justify-start gap-8 text-center">
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  ) : (
                    userStats.totalBookings
                  )}
                </div>
                <div className="text-sm text-gray-600">Bookings</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {favoritesLoading ? (
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin mx-auto"></div>
                  ) : (
                    userStats.totalFavorites
                  )}
                </div>
                <div className="text-sm text-gray-600">Saved</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  ) : (
                    userStats.rewardPoints
                  )}
                </div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 md:ml-auto">
            <button 
              onClick={() => navigate('/profile/settings')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
            
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}! 👋
          </h2>
          <p className="text-gray-600">
            Manage your account, view your bookings, and discover amazing deals.
          </p>
        </div>

        {/* Quick Stats Cards with Real Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Store}
            count={userStats.totalBookings}
            title="My Bookings"
            description="View and manage your bookings"
            bgGradient="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            iconColor="text-blue-200"
            textColor="text-blue-100"
            onClick={() => navigate('/profile/bookings')}
            isLoading={statsLoading}
          />

          <StatCard
            icon={Heart}
            count={userStats.totalFavorites}
            title="Favourites"
            description="Your saved services and offers"
            bgGradient="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            iconColor="text-red-200"
            textColor="text-red-100"
            onClick={() => navigate('/profile/favourites')}
            isLoading={favoritesLoading}
          />

          <StatCard
            icon={MapPin}
            count={userStats.followedStores}
            title="Followed Stores"
            description="Stores you follow for updates"
            bgGradient="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            iconColor="text-green-200"
            textColor="text-green-100"
            onClick={() => navigate('/profile/followed-stores')}
            isLoading={statsLoading}
          />

          <StatCard
            icon={Gift}
            count={userStats.rewardPoints}
            title="Reward Points"
            description="Referrals and reward programs"
            bgGradient="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            iconColor="text-purple-200"
            textColor="text-purple-100"
            onClick={() => navigate('/profile/earn')}
            isLoading={statsLoading}
          />
        </div>

        {/* Stats Loading Message */}
        {(statsLoading || favoritesLoading) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading your statistics...</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/Hotdeals')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Browse Offers</div>
                <div className="text-sm text-gray-500">Discover amazing deals</div>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/stores')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Find Stores</div>
                <div className="text-sm text-gray-500">Explore new businesses</div>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/my-vouchers')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">My Vouchers</div>
                <div className="text-sm text-gray-500">View your vouchers</div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity & Recommended Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {user?.recentActivity?.length > 0 ? (
                user.recentActivity.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm mb-2">No recent activity</p>
                  <button 
                    onClick={() => navigate('/offers')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Start exploring offers
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/Hotdeals')}
                className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Browse New Offers</p>
                    <p className="text-xs text-gray-500">Discover amazing deals near you</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/profile/earn')}
                className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Refer Friends</p>
                    <p className="text-xs text-gray-500">Earn rewards for every referral</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/stores')}
                className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Store className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Explore Stores</p>
                    <p className="text-xs text-gray-500">Find new services and businesses</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CouponProfilePage;