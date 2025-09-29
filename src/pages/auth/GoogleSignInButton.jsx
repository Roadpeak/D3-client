import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import authService from '../../services/authService';

const GoogleSignInButton = ({ buttonText = "Continue with Google", onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Google OAuth configuration
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Store redirect parameter in localStorage before Google Auth (in case of popup/redirect flow)
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      localStorage.setItem('authRedirect', redirectParam);
      console.log('🔄 Stored redirect for Google Auth:', redirectParam);
    }

    // Load Google Identity Services script
    if (!window.google && GOOGLE_CLIENT_ID) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else if (window.google) {
      initializeGoogleSignIn();
    }
  }, [GOOGLE_CLIENT_ID, searchParams]);

  const initializeGoogleSignIn = () => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setIsGoogleLoaded(true);
    }
  };

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);
      console.log('Google Sign-In response received');

      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Get referral slug from URL if present
      const urlParams = new URLSearchParams(location.search);
      const referralSlug = urlParams.get('ref');

      // Send the Google credential to your backend
      const result = await authService.googleSignIn(response.credential, referralSlug);

      if (result.success) {
        console.log('✅ Google authentication successful');
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result);
        }

        // Get redirect path - check localStorage first (for popup flow), then query params, then location state
        let redirectPath = localStorage.getItem('authRedirect');
        
        if (!redirectPath) {
          const redirectParam = searchParams.get('redirect');
          if (redirectParam) {
            redirectPath = decodeURIComponent(redirectParam);
          }
        }
        
        if (!redirectPath) {
          redirectPath = location.state?.from?.pathname;
        }

        // Clean up localStorage
        if (localStorage.getItem('authRedirect')) {
          localStorage.removeItem('authRedirect');
        }

        // Navigate to the redirect path or home
        const finalPath = redirectPath || '/';
        console.log('🎯 Google Auth redirecting to:', finalPath);
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate(finalPath, { replace: true });
        }, 100);
      } else {
        console.error('Google authentication failed:', result.message);
        throw new Error(result.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      
      // Clean up localStorage on error
      localStorage.removeItem('authRedirect');
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      } else {
        // Default error handling
        alert(error.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      alert('Google Sign-In is not configured. Please contact support.');
      return;
    }

    if (!window.google || !isGoogleLoaded) {
      alert('Google Sign-In is still loading. Please wait a moment and try again.');
      return;
    }

    try {
      setLoading(true);
      window.google.accounts.id.prompt((notification) => {
        setLoading(false);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google Sign-In prompt was not displayed or skipped');
        }
      });
    } catch (error) {
      setLoading(false);
      console.error('Error triggering Google Sign-In:', error);
      alert('Failed to open Google Sign-In. Please try again.');
    }
  };

  // Don't render if Google Client ID is not configured
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-gray-500">Google Sign-In not available</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading || !isGoogleLoaded}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          <span className="text-sm font-medium">Signing in...</span>
        </>
      ) : (
        <>
          <FaGoogle className="text-lg text-red-500" />
          <span className="text-sm font-medium">{buttonText}</span>
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;