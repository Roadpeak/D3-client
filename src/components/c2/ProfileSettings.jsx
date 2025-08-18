import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import authService from '../../services/authService';
import api from '../../config/api';

const ProfileSettingsStandalone = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    location: '',
    notifications: true,
    emailUpdates: false,
    smsAlerts: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
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
          const userData = result.data.user;
          setUser(userData);
          setFormData(prev => ({
            ...prev,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
          }));
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      });

      if (response.data.user) {
        setUser(response.data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (settingName, value) => {
    try {
      await api.put('/users/notification-settings', {
        [settingName]: value
      });
      setFormData(prev => ({
        ...prev,
        [settingName]: value
      }));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
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
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-100">
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Push Notifications</h3>
                      <p className="text-sm text-gray-600">Receive notifications about your bookings and offers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({ ...prev, notifications: checked }));
                          handleNotificationUpdate('notifications', checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Updates</h3>
                      <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.emailUpdates}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({ ...prev, emailUpdates: checked }));
                          handleNotificationUpdate('emailUpdates', checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">SMS Alerts</h3>
                      <p className="text-sm text-gray-600">Receive important updates via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.smsAlerts}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({ ...prev, smsAlerts: checked }));
                          handleNotificationUpdate('smsAlerts', checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Account Security</h2>
                <div className="space-y-4">
                  <button
                    type="button"
                    className="w-full text-left border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </button>
                  
                  <button
                    type="button"
                    className="w-full text-left border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </button>
                  
                  <button
                    type="button"
                    className="w-full text-left border border-red-300 rounded-lg p-4 hover:bg-red-50 transition-colors text-red-600"
                  >
                    <h3 className="font-medium">Delete Account</h3>
                    <p className="text-sm">Permanently delete your account and all data</p>
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfileSettingsStandalone;