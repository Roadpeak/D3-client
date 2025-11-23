import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gift, DollarSign, TrendingUp, Copy, Users, Share2, ArrowLeft } from 'lucide-react';
import authService from '../../services/authService';
import api from '../../config/api';

const EarnStandalone = () => {
  const [user, setUser] = useState(null);
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    currentBalance: 0,
    referralCount: 0,
    pendingRewards: 0,
    totalReferralBookings: 0,
    averageEarningPerBooking: 0
  });
  const [referralLink, setReferralLink] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
          await fetchEarningsData();
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

  const fetchEarningsData = async () => {
    try {
      const [earningsResponse, activitiesResponse] = await Promise.all([
        api.get('/users/earnings'),
        api.get('/users/earning-activities')
      ]);

      setEarnings(earningsResponse.data.earnings || {});
      setReferralLink(earningsResponse.data.referralLink || '');
      setRecentActivities(activitiesResponse.data.activities || []);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me and earn rewards!',
        text: 'Sign up using my referral link and we both benefit when you book offers!',
        url: referralLink
      });
    } else {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Referral Rewards</h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Earn 30% of the access fee every time someone you refer completes an offer booking.
                The more your friends book, the more you earn!
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 dark:text-green-200 text-sm">Total Earned</p>
                    <p className="text-2xl font-bold">KES {earnings.totalEarned.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-200 dark:text-green-300" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 dark:text-blue-200 text-sm">Available Balance</p>
                    <p className="text-2xl font-bold">KES {earnings.currentBalance.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-200 dark:text-blue-300" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 dark:text-purple-200 text-sm">Total Referrals</p>
                    <p className="text-2xl font-bold">{earnings.referralCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-200 dark:text-purple-300" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 dark:text-orange-200 text-sm">Pending Rewards</p>
                    <p className="text-2xl font-bold">KES {earnings.pendingRewards.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-200 dark:text-orange-300" />
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-6 border border-green-200 dark:border-green-700">
              <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-300">How Referral Earnings Work</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Share Your Link</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Share your unique referral link with friends and family</p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. They Book Offers</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">When they complete offer bookings, they pay an access fee</p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. You Earn 30%</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">You automatically earn 30% of every access fee they pay</p>
                </div>
              </div>
            </div>

            {/* Referral Section */}
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-600">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Share Your Referral Link
              </h2>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-4">
                <p className="text-blue-800 dark:text-blue-300 text-sm mb-2">
                  <strong>Start earning today!</strong> Share your unique link and earn 30% of access fees when your referrals book offers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Referral Link</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg px-3 py-2 bg-gray-50 dark:bg-gray-600 text-sm text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={shareReferralLink}
                    className="bg-green-600 dark:bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Link
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-600">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Referral Bookings</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{earnings.totalReferralBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Average Earning per Booking</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      KES {earnings.averageEarningPerBooking.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {earnings.referralCount > 0
                        ? Math.round((earnings.totalReferralBookings / earnings.referralCount) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-600">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Tips</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Share your link on social media for maximum reach</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Explain how offers work to increase booking likelihood</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Higher discount offers = higher access fees = more earnings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-600">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Referral Activity</h2>

              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-lg mb-2">No referral activity yet</p>
                  <p className="text-sm">Start sharing your link to see earnings here!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{activity.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="text-green-600 dark:text-green-400 font-medium">+KES {activity.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarnStandalone;