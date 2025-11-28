// src/services/authService.js - Updated with Google Authentication
import api, { API_ENDPOINTS, setTokenToCookie, removeTokenFromCookie, getTokenFromCookie } from '../config/api';

class AuthService {
  // User Registration
  async registerUser(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.user.register, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber || null,
        password: userData.password,
      });

      const { access_token, user } = response.data;

      if (access_token) {
        setTokenToCookie(access_token);
      }

      return {
        success: true,
        data: { user, token: access_token },
        message: 'Registration successful'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // User Login
  async loginUser(email, password) {
    try {
      const response = await api.post(API_ENDPOINTS.user.login, {
        email,
        password,
      });

      const { access_token } = response.data;

      if (access_token) {
        setTokenToCookie(access_token);
      }

      return {
        success: true,
        data: response.data,
        message: 'Login successful'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // NEW: Google Sign-In
  async googleSignIn(googleCredential, referralSlug = null) {
    try {
      console.log('🚀 Sending Google credential to backend...');
      
      const response = await api.post(API_ENDPOINTS.user.googleSignIn, {
        credential: googleCredential,
        referralSlug: referralSlug
      });

      const { access_token, user, isNewUser } = response.data;

      if (access_token) {
        setTokenToCookie(access_token);
        console.log('✅ Google authentication token saved');
      }

      return {
        success: true,
        data: { user, token: access_token, isNewUser },
        message: isNewUser ? 'Account created successfully with Google' : 'Google sign-in successful'
      };
    } catch (error) {
      console.error('❌ Google Sign-In API error:', error);
      return this.handleAuthError(error);
    }
  }

  // Merchant Registration
  async registerMerchant(merchantData) {
    try {
      const response = await api.post(API_ENDPOINTS.merchant.register, {
        firstName: merchantData.firstName,
        lastName: merchantData.lastName,
        email: merchantData.email,
        phoneNumber: merchantData.phoneNumber,
        password: merchantData.password,
      });

      const { access_token, merchant } = response.data;

      if (access_token) {
        setTokenToCookie(access_token);
      }

      return {
        success: true,
        data: { merchant, token: access_token },
        message: 'Merchant registration successful'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // Merchant Login
  async loginMerchant(email, password) {
    try {
      const response = await api.post(API_ENDPOINTS.merchant.login, {
        email,
        password,
      });

      const { access_token } = response.data;

      if (access_token) {
        setTokenToCookie(access_token);
      }

      return {
        success: true,
        data: response.data,
        message: 'Merchant login successful'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // Updated getCurrentUser function
  async getCurrentUser() {
    try {
      const token = getTokenFromCookie();
      console.log('🎫 Token from cookie:', token ? `Exists (${token.substring(0, 20)}...)` : 'No token');

      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await api.get(API_ENDPOINTS.user.profile);
      console.log('✅ Profile request successful');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ getCurrentUser error:', error.response?.data);
      return this.handleAuthError(error);
    }
  }

  // Logout
  logout() {
    removeTokenFromCookie();
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!getTokenFromCookie();
  }

  // Verify OTP
  async verifyOtp(phone, otp) {
    try {
      const response = await api.post(API_ENDPOINTS.user.verifyOtp, {
        phone,
        otp,
      });

      return {
        success: true,
        data: response.data,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // Resend OTP
  async resendOtp(phone) {
    try {
      const response = await api.post(API_ENDPOINTS.user.resendOtp, {
        phone,
      });

      return {
        success: true,
        data: response.data,
        message: 'OTP resent successfully'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // Request Password Reset
  async requestPasswordReset(email, userType = 'user') {
    try {
      const endpoint = userType === 'merchant'
        ? API_ENDPOINTS.merchant.requestPasswordReset
        : API_ENDPOINTS.user.requestPasswordReset;

      const response = await api.post(endpoint, { email });

      return {
        success: true,
        data: response.data,
        message: 'Password reset email sent'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // Reset Password
  async resetPassword(token, newPassword, userType = 'user') {
    try {
      const endpoint = userType === 'merchant'
        ? API_ENDPOINTS.merchant.resetPassword
        : API_ENDPOINTS.user.resetPassword;

      const response = await api.post(endpoint, {
        token,
        newPassword,
      });

      return {
        success: true,
        data: response.data,
        message: 'Password reset successfully'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // NEW: Link Google account to existing account
  async linkGoogleAccount(googleCredential) {
    try {
      const response = await api.post(API_ENDPOINTS.user.linkGoogle, {
        credential: googleCredential
      });

      return {
        success: true,
        data: response.data,
        message: 'Google account linked successfully'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // NEW: Unlink Google account
  async unlinkGoogleAccount() {
    try {
      const response = await api.delete(API_ENDPOINTS.user.unlinkGoogle);

      return {
        success: true,
        data: response.data,
        message: 'Google account unlinked successfully'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // Handle authentication errors
  handleAuthError(error) {
    let errorMessage = 'An unexpected error occurred';
    let errors = {};

    if (error.response) {
      const { status, data } = error.response;

      // Handle different error formats from your backend
      if (data.message) {
        errorMessage = data.message;
      } else if (typeof data === 'object') {
        // Handle validation errors object format
        errors = data;
        // Get first error message for general display
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
      } else if (data.error) {
        errorMessage = data.error;
      }

      // Handle specific status codes
      switch (status) {
        case 400:
          errorMessage = errorMessage || 'Invalid request data';
          break;
        case 401:
          errorMessage = errorMessage || 'Invalid credentials';
          break;
        case 404:
          errorMessage = errorMessage || 'User not found';
          break;
        case 409:
          errorMessage = errorMessage || 'User already exists';
          break;
        case 422:
          errorMessage = errorMessage || 'Google authentication failed';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          break;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    }

    return {
      success: false,
      message: errorMessage,
      errors: errors,
      status: error.response?.status,
    };
  }
}

export default new AuthService();