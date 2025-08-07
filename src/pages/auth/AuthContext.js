import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Authentication Context
const AuthContext = createContext();

// Auth Context Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get auth token from localStorage
  const getAuthToken = () => {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  };

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  // Check if user is authenticated
  const checkAuthentication = () => {
    const token = getAuthToken();
    const userData = getCurrentUser();
    
    if (token && userData) {
      setUser(userData);
      setAuthenticated(true);
    } else {
      setUser(null);
      setAuthenticated(false);
    }
    setLoading(false);
  };

  // Initialize authentication state
  useEffect(() => {
    checkAuthentication();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'currentUser') {
        checkAuthentication();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab login/logout
    const handleAuthChange = () => {
      checkAuthentication();
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  // Login function
  const login = (token, userData) => {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
      setAuthenticated(true);
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('authStateChanged'));
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setUser(null);
      setAuthenticated(false);
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('authStateChanged'));
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      logout();
      return;
    }

    try {
      // You can add an API call here to refresh user data if needed
      const userData = getCurrentUser();
      if (userData) {
        setUser(userData);
        setAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
    }
  };

  const value = {
    user,
    authenticated,
    loading,
    login,
    logout,
    refreshUser,
    getAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { authenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      );
    }

    if (!authenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-4">Authentication Required</h2>
            <p className="text-gray-600 text-center mb-6">
              Please log in to access this page.
            </p>
            <button
              onClick={() => window.location.href = '/accounts/sign-in'}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Example usage in your main App component:
export const App = () => {
  return (
    <AuthProvider>
      {/* Your app components go here */}
      <div>Your App Content</div>
    </AuthProvider>
  );
};