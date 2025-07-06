import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone, FiTag, FiPercent } from 'react-icons/fi';
import GoogleSignInButton from './GoogleSignInButton';

const SignUp = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = 'http://localhost:4000/api/v1/user/register';
      const response = await axios.post(endpoint, formData);
      const token = response.data.access_token;
      if (window.location.hostname === 'localhost') {
        document.cookie = `access_token=${token}; path=/`;
      } else {
        document.cookie = `access_token=${token}; path=/; domain=.discoun3ree.com; secure; SameSite=None`;
      }
      setErrors({});
      setLoading(false);
      navigate('/accounts/verify-otp', { state: { phone: formData.phone } });
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error) && error.response) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: ['An error occurred'] });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              className="px-6 py-2 bg-white text-gray-600 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Merchant
            </Link>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Error Messages */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-1">
                  {Object.keys(errors).map((key) => (
                    errors[key].map((message) => (
                      <p key={message} className="text-sm text-red-600">{message}</p>
                    ))
                  ))}
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-10 text-xs pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full pl-10 text-xs pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
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
                    className="w-full pl-10 text-xs pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 text-xs pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
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
                      className="w-full pl-10 text-xs pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
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
                      className="w-full pl-10 text-xs pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
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
                  By signing up, you agree to our{' '}
                  <a
                    href="https://discoun3ree.com/terms-and-conditions"
                    target='_blank'
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    Terms & Conditions
                  </a>
                  {' '}and{' '}
                  <a
                    href="https://discoun3ree.com/privacy-policy"
                    target='_blank'
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    Privacy Policy
                  </a>
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
                    <span className="ml-2">Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              {/* <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">or continue with</span>
                </div>
              </div> */}

              <GoogleSignInButton />
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <Link
                  to='/accounts/sign-in'
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