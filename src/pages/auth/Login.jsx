import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { FiEye, FiEyeOff, FiMail, FiLock, FiTag, FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';
import GoogleSignInButton from './GoogleSignInButton';
import authService from '../../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Debug: Log redirect parameters
  useEffect(() => {
    const redirectParam = searchParams.get('redirect');
    console.log('🔍 Login page loaded');
    console.log('📍 Redirect param from URL:', redirectParam);
    console.log('📍 Location state:', location.state);
    console.log('📍 Full URL:', window.location.href);
  }, [searchParams, location.state]);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userResponse = await authService.getCurrentUser();
        if (userResponse?.success) {
          // User is already logged in, redirect them
          const redirectParam = searchParams.get('redirect');
          
          if (redirectParam) {
            const decodedPath = decodeURIComponent(redirectParam);
            console.log('✅ Already logged in, redirecting to:', decodedPath);
            navigate(decodedPath, { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      } catch (err) {
        console.log('User not authenticated');
      }
    };
    checkAuth();
  }, [navigate, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Show validation error toast
      toast.error('Please check your form for errors');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await authService.loginUser(formData.email, formData.password);

      if (result.success) {
        console.log('✅ Login successful!');
        toast.success('Welcome back! Logging you in...');

        // Get redirect path - check query params first, then location state
        const redirectParam = searchParams.get('redirect');
        let redirectPath = '/';

        if (redirectParam) {
          redirectPath = decodeURIComponent(redirectParam);
          console.log('🎯 Redirecting to (from query param):', redirectPath);
        } else if (location.state?.from?.pathname) {
          redirectPath = location.state.from.pathname;
          console.log('🎯 Redirecting to (from location state):', redirectPath);
        } else {
          console.log('🎯 No redirect param, going to home');
        }

        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);

      } else {
        // Handle login errors
        if (result.errors && typeof result.errors === 'object') {
          setErrors(result.errors);
          // Show specific error messages
          const errorMessages = Object.values(result.errors).flat();
          errorMessages.forEach((msg, index) => {
            setTimeout(() => toast.error(msg), index * 100);
          });
        } else {
          const errorMsg = result.message || 'Login failed. Please try again.';
          setErrors({ general: errorMsg });
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Preserve redirect parameter when navigating to sign up
  const getSignUpLink = () => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      return `/accounts/sign-up?redirect=${redirectParam}`;
    }
    return '/accounts/sign-up';
  };

  return (
    <main className="h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Floating discount icons for visual appeal */}
      <div className="absolute top-10 left-10 text-cyan-200 dark:text-cyan-800 opacity-60">
        <FiPercent size={32} />
      </div>
      <div className="absolute top-32 right-20 text-blue-200 dark:text-blue-800 opacity-60">
        <FiTag size={28} />
      </div>
      <div className="absolute bottom-20 left-20 text-cyan-200 dark:text-cyan-800 opacity-60">
        <FiPercent size={24} />
      </div>
      <div className="absolute bottom-32 right-10 text-blue-200 dark:text-blue-800 opacity-60">
        <FiTag size={36} />
      </div>

      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTag className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
            <p className="text-cyan-100 text-sm">Sign in to unlock amazing deals</p>
          </div>

          {/* User/Merchant Toggle - Mobile */}
          <div className="flex md:hidden justify-center gap-1 p-4 bg-gray-50/50 dark:bg-gray-700/50">
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm">
              User
            </button>
            <Link
              to='https://merchants.discoun3ree.com/accounts/login'
              target='_blank'
              rel="noopener noreferrer"
              className="px-6 py-2 bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Merchant
            </Link>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Redirect Info Message */}
              {searchParams.get('redirect') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium">
                    Please sign in to continue with your booking
                  </p>
                </div>
              )}

              {/* Error Messages */}
              {(errors.general || Object.keys(errors).length > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-1">
                  {errors.general && (
                    <p className="text-sm text-red-600 font-medium">{errors.general}</p>
                  )}
                  {Object.keys(errors).filter(key => key !== 'general').map((key) => (
                    <p key={key} className="text-sm text-red-600">
                      {Array.isArray(errors[key]) ? errors[key][0] : errors[key]}
                    </p>
                  ))}
                </div>
              )}

              {/* Success Message (if redirected from registration) */}
              {location.state?.message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">{location.state.message}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full text-xs pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all bg-gray-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.email ? 'border-red-300 bg-red-50/50 dark:border-red-600 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex w-full justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Link
                    to='/request-password-reset'
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full text-xs pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all bg-gray-50/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.password ? 'border-red-300 bg-red-50/50 dark:border-red-600 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-end -mt-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to={getSignUpLink()}
                    className="text-cyan-600 dark:text-cyan-400 font-medium hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-[14px] py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <ClipLoader color="#fff" size={20} />
                    <span className="ml-2">Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <GoogleSignInButton />
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Join thousands of users saving money every day
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;