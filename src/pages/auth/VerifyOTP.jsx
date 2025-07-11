import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { FiPhone, FiTag, FiRefreshCw } from 'react-icons/fi';
import authService from '../../services/authService';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  // Get phone number from location state (passed from signup)
  const phoneNumber = location.state?.phone || '';
  const message = location.state?.message || '';

  useEffect(() => {
    // If no phone number, redirect to signup
    if (!phoneNumber) {
      navigate('/accounts/sign-up');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phoneNumber, navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedNumbers = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (pastedNumbers.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedNumbers.length && i < 6; i++) {
        newOtp[i] = pastedNumbers[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedNumbers.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.verifyOtp(phoneNumber, otpString);
      
      if (result.success) {
        setSuccess('Phone number verified successfully!');
        setTimeout(() => {
          // Redirect to login or dashboard
          navigate('/', { replace: true });
        }, 1500);
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.resendOtp(phoneNumber);
      
      if (result.success) {
        setSuccess('OTP resent successfully!');
        setCanResend(false);
        setCountdown(60);
        
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('An error occurred while resending OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (phone.length <= 4) return phone;
    return phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
  };

  return (
    <main className="h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPhone className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Phone</h1>
            <p className="text-purple-100 text-sm">We've sent a 6-digit code to</p>
            <p className="text-white text-sm font-medium">{formatPhoneNumber(phoneNumber)}</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {/* Success message from signup */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-600 font-medium">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {/* OTP Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Enter 6-digit verification code
                </label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <ClipLoader color="#fff" size={20} />
                    <span className="ml-2">Verifying...</span>
                  </div>
                ) : (
                  'Verify Phone Number'
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    {resendLoading ? (
                      <>
                        <ClipLoader color="#7c3aed" size={16} />
                        Resending...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw className="w-4 h-4" />
                        Resend OTP
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Resend available in {countdown}s
                  </p>
                )}
              </div>

              {/* Back to Login */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Want to use a different phone number?{' '}
                  <Link
                    to='/accounts/sign-up'
                    className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
                  >
                    Back to Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            By verifying, you agree to receive SMS messages from Discoun3
          </p>
        </div>
      </div>
    </main>
  );
};

export default VerifyOTP;