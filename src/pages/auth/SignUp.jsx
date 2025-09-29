import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone, FiTag } from 'react-icons/fi';
import GoogleSignInButton from './GoogleSignInButton';
import authService from '../../services/authService';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get redirect path from query parameter or default to home
  const getRedirectPath = () => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      return decodeURIComponent(redirectParam);
    }
    return '/';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await authService.registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      if (result.success) {
        // Registration successful - redirect to intended page or home
        const redirectPath = getRedirectPath();
        navigate(redirectPath, {
          replace: true,
          state: {
            message: 'Registration successful! Welcome to D3 Deals!'
          }
        });
      } else {
        // Handle registration errors
        if (result.errors && typeof result.errors === 'object') {
          // Map backend field names to frontend field names
          const mappedErrors = {};

          Object.keys(result.errors).forEach(key => {
            let frontendField = key;

            // Map backend field names to frontend field names
            switch (key) {
              case 'first_name':
                frontendField = 'firstName';
                break;
              case 'last_name':
                frontendField = 'lastName';
                break;
              case 'phone':
                frontendField = 'phoneNumber';
                break;
              default:
                frontendField = key;
            }

            // Handle array or string error messages
            const errorMessage = Array.isArray(result.errors[key])
              ? result.errors[key][0]
              : result.errors[key];

            mappedErrors[frontendField] = errorMessage;
          });

          setErrors(mappedErrors);
        } else {
          // General error message
          setErrors({ general: result.message });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Preserve redirect parameter when navigating to sign in
  const getSignInLink = () => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      return `/accounts/sign-in?redirect=${redirectParam}`;
    }
    return '/accounts/sign-in';
  };

  return (
    <main className="h-screen bg-gray-50 flex items-center overflow-y-auto justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTag className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join d3 today</h1>
            <p className="text-purple-100 text-sm font-light">Create your account and start saving today</p>
          </div>

          {/* User/Merchant Toggle - Mobile */}
          <div className="flex md:hidden justify-center gap-1 p-4 bg-gray-50/50">
            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm">
              User
            </button>
            <Link
              to='https://merchants.discoun3ree.com/accounts/register'
              target='_blank'
              rel="noopener noreferrer"
              className="px-6 py-2 bg-white text-gray-600 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
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
                    Create an account to continue with your booking
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
                      {errors[key]}
                    </p>
                  ))}
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-10 text-xs pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white ${errors.firstName ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                        }`}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full pl-10 text-xs pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white ${errors.lastName ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                        }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 text-xs pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white ${errors.email ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                      }`}
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1">
                <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full pl-10 text-xs pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white ${errors.phoneNumber ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                      }`}
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 text-xs pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white ${errors.password ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                        }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password_confirmation"
                      name="password_confirmation"
                      placeholder="Confirm password"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className={`w-full pl-10 text-xs pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white ${errors.password_confirmation ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                        }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <p className="text-xs text-gray-500 -mt-4">
                Password must be at least 8 characters long
              </p>

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500/20 focus:ring-2"
                />
                <p className="text-xs text-gray-600 leading-relaxed">
                  By signing up, you agree to our <a href="https://discoun3ree.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">Terms & Conditions</a> and <a href="https://discoun3ree.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">Privacy Policy</a>
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full text-[14px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <ClipLoader color="#fff" size={20} />
                    <span className="ml-2">Creating account...</span></div>
                ) : (
                  'Create Account'
                )}
              </button>

              <GoogleSignInButton />
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <Link
                  to={getSignInLink()}
                  className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignUp;